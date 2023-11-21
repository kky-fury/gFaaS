import {FaasPlatformConfiguration} from "../model/service_configuration/faas_service_configuration";
import {XFaasFunctionYaml} from "../model/function/xfaas_function_yaml";
import {PlatformResponse} from "../model/platform_response";
import {gFaasFunction, XFaasFunctionTriggers} from "../model/function/xfaas_function";
import {Cluster, CoreV1Api, CustomObjectsApi, User} from "@kubernetes/client-node";
import {FaasPlatformType} from "../enums/faas_platform_type";
import {FaasService} from "./faas_service";
import {Namespace, Namespaces} from "../model/namespace/namespace";

const k8s = require('@kubernetes/client-node');

export class KnativeService extends FaasService {

    cluster: Cluster;
    user: User;

    kc = new k8s.KubeConfig();
    k8sCustomObjectApi: CustomObjectsApi;
    k8sCoreApi: CoreV1Api;


    constructor(faasServiceConfiguration: FaasPlatformConfiguration) {
        super(faasServiceConfiguration);

        this.cluster = {
            name: 'kubernetes',
            skipTLSVerify: false,
            server: this.faasServiceConfiguration.getManagementHostAndPort()
        };

        this.user = {
            name: "kubernetes-admin"
        };

        this.kc.loadFromClusterAndUser(this.cluster, this.user);
        this.k8sCustomObjectApi = this.kc.makeApiClient(k8s.CustomObjectsApi);
        this.k8sCoreApi = this.kc.makeApiClient(k8s.CoreV1Api);

        this.k8sCoreApi.setDefaultAuthentication({
            applyToRequest: (opts: any) => {
                opts.rejectUnauthorized = !this.faasServiceConfiguration.skipTLSVerify;
                opts.headers.Authorization = this.faasServiceConfiguration.authentication.getAuthenticationHeaderValue();
            }
        });

        this.k8sCustomObjectApi.setDefaultAuthentication({
            applyToRequest: (opts: any) => {
                opts.rejectUnauthorized = !this.faasServiceConfiguration.skipTLSVerify;
                opts.headers.Authorization = this.faasServiceConfiguration.authentication.getAuthenticationHeaderValue();
            }
        });
    }

    async createFunction(xFaasFunctionYaml: XFaasFunctionYaml, logStatus = true): Promise<PlatformResponse<any>> {

        // Check if function can be deployed
        const canDeployFunction = await this.canDeployFunction(xFaasFunctionYaml, false);
        if(!canDeployFunction.successful) {return canDeployFunction;}

        const namespace = xFaasFunctionYaml.namespace;
        const functionName = xFaasFunctionYaml.name;
        const data = KnativeService.get_knative_function_specification(xFaasFunctionYaml);
        const deployment = k8s.loadYaml(JSON.stringify(data));


        // Make sure the target namespace exists
        try{
            await this.k8sCoreApi.readNamespace(namespace);
            if(logStatus){
                console.log(`Namespace ${namespace} already exists. Continue with deployment.`);
            }
        }catch (e) {
            console.log(`Namespace ${namespace} does not exist. Try to create namespace.`);
            // try to create namespace
            await this.k8sCoreApi.createNamespace({
                kind: 'Namespace',
                metadata: {
                    name: namespace
                }
            }).then((_) => {
                console.log(`Namespace ${namespace} was created. Continue with deployment.`)
            }).catch((_) => {
                return new PlatformResponse(false, '', `Could not create namespace ${namespace}.`);
            });
        }
        // Try to deploy the function
        return await this.k8sCustomObjectApi.getNamespacedCustomObject('serving.knative.dev', 'v1', namespace, 'services', functionName).then(
            (_) => {
                return new PlatformResponse(false, '', `Function ${functionName} in namespace ${namespace} already exists.`);
            }
        ).catch(async (_) => {
            return await this.k8sCustomObjectApi.createNamespacedCustomObject('serving.knative.dev', 'v1', namespace, 'services', deployment)
                .then((_) => {
                    return new PlatformResponse(true, '',  `Function ${functionName} was deployed in namespace ${namespace}.`);
            }).catch(async (e: any) => {
                console.log(e)
                return new PlatformResponse(false, '',  `Could not deploy function ${functionName} in namespace ${namespace}.`);
            })
        });
    }

    async deleteFunction(functionName: string, namespace: string): Promise<PlatformResponse<any>> {
        return await this.k8sCustomObjectApi.deleteNamespacedCustomObject('serving.knative.dev', 'v1', namespace, 'services',  functionName)
            .then((_) => {
                return new PlatformResponse(true, '', `Function ${functionName} in namespace ${namespace} was deleted successfully.`);
            }).catch((_) => {
                return new PlatformResponse(false, '', `Could not delete function ${functionName} in namespace ${namespace}.`);
            });
    }

    async getFunction(functionName: string, namespace: string): Promise<PlatformResponse<gFaasFunction>> {
        try{
            const res = await this.k8sCustomObjectApi.getNamespacedCustomObject('serving.knative.dev',
                'v1',
                namespace,
                'services',
                functionName)
            return new PlatformResponse(true, await this.translateFunctionObject(res.body) );
        }catch(e){
            return new PlatformResponse(false);
        }
    }

    async getFunctions(): Promise<PlatformResponse<gFaasFunction[]>> {
        try{
            const res: any = await this.k8sCustomObjectApi.listClusterCustomObject('serving.knative.dev', 'v1', 'services');
            const functions = res.body.items;
            const xfaasFunctions: gFaasFunction[] = [];
            for(const f of functions){
                xfaasFunctions.push(
                    await this.translateFunctionObject(f)
                )
            }
            return new PlatformResponse(true, xfaasFunctions);
        }catch (e) {
            return new PlatformResponse(false, [], 'Could not reach server.');
        }
    }

    async health(): Promise<PlatformResponse<any>> {
        return await this.get('/livez?verbose', {}, '');
    }

    static get_knative_function_specification(xFaasFunctionYaml: XFaasFunctionYaml): any {

        const knativeScale = xFaasFunctionYaml.getKnativeScale()
        const knativeRequests = xFaasFunctionYaml.requests
        const knativeLimits = xFaasFunctionYaml.limits

        const triggerName = xFaasFunctionYaml.isGrpc ? 'h2c' : 'http1';

        return {
            apiVersion: 'serving.knative.dev/v1',
            kind: 'Service',
            metadata: {
                name: `${xFaasFunctionYaml.name}`,
                namespace: `${xFaasFunctionYaml.namespace}`
            },
            spec: {
                template: {
                    metadata: {
                        annotations: {
                            'autoscaling.knative.dev/class': 'kpa.autoscaling.knative.dev',
                            'autoscaling.knative.dev/scale-to-zero-pod-retention-period': knativeScale?.scaleToZeroDuration ?? '0s',
                            'autoscaling.knative.dev/metric': 'concurrency',
                            'autoscaling.knative.dev/target': `${knativeScale?.target ?? 100}`,
                            'autoscaling.knative.dev/min-scale': `${knativeScale?.min ?? 0}`,
                            'autoscaling.knative.dev/max-scale': `${knativeScale?.max ?? 0}`,
                        }
                    },
                    spec: {
                        containers: [
                            {
                                'image': `${xFaasFunctionYaml.getRegistryImageLocation()}`,
                                'resources': {
                                    requests: {
                                        'memory': `${knativeRequests?.memory}`,
                                        'cpu': `${knativeRequests?.cpu}`,
                                    },
                                    limits: {
                                        'memory': `${knativeLimits?.memory}`,
                                        'cpu': `${knativeLimits?.cpu}`,
                                    }
                                },
                                'ports': [
                                    {
                                        'name': triggerName,
                                        'containerPort': 8080
                                    }
                                ]
                            }
                        ]

                    }
                },
            }
        };
    }

    async translateFunctionObject(fun: any): Promise<gFaasFunction> {

        const template = fun?.spec?.template;
        const annotations = template?.metadata?.annotations;

        // Scaling
        const maxScale = annotations['autoscaling.knative.dev/max-scale'] ?? '-';
        const minScale = annotations['autoscaling.knative.dev/min-scale'] ?? '-';
        const target = annotations['autoscaling.knative.dev/target'] ?? '-';
        const scaleToZeroDuration = annotations['autoscaling.knative.dev/scale-to-zero-pod-retention-period'] ?? '-';

        // Image
        const container = template?.spec?.containers[0];
        const image = container?.image ?? '-';

        //Invocation URL
        let url = fun?.status?.url + ':' + this.faasServiceConfiguration.httpFunctionInvocationPort;


        let trigger = 'http';
        if(fun.spec.template.spec.containers[0].ports[0].name == 'h2c'){
            trigger = 'http2';
        }

        const isHttps = url.startsWith('https');
        const isHttp = url.startsWith('http')
        if(trigger == 'http2'){
            if(isHttps){
                url = url.substring(8, url.length)
            }else if(isHttp){
                url = url.substring(7, url.length)
            }
        }

        // Resources
        const resources = container.resources;
        const limitCpu = resources?.limits?.cpu ?? '';
        const limitMemory = resources?.limits?.memory ?? '';
        const requestsCpu = resources?.requests?.cpu ?? '';
        const requestsMemory = resources?.requests?.memory ?? '';

        // Status
        let status = 'NOT READY'
        for(let i = fun?.status?.conditions?.length -1; i >= 0; i--){
            if(fun?.status?.conditions[i]?.type == 'Ready' && fun?.status?.conditions[i]?.status == 'True'){
                status = 'READY'
            }
        }

        return new gFaasFunction(
            fun.metadata.name,
            this.faasServiceConfiguration.uniqueId,
            this.createPlatformId(fun.metadata.name, fun.metadata.namespace, this.faasServiceConfiguration.uniqueId),
            FaasPlatformType.knative,
            fun.metadata.creationTimestamp,
            '',
            [
                new XFaasFunctionTriggers(
                    trigger,
                    'function-trigger',
                    url
                )
            ],
            fun.metadata.namespace,
            image,
            status,
            {cpu: limitCpu, memory: limitMemory},
            {cpu: requestsCpu, memory: requestsMemory},
            {min: minScale, max: maxScale, target: target, scaleToZeroDuration: scaleToZeroDuration}
        )
    }

   async  getNamespaces(): Promise<PlatformResponse<Namespaces>> {
        return new PlatformResponse(false, new Namespaces())
    }

}
