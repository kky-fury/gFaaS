import {FaasPlatformConfiguration} from "../model/service_configuration/faas_service_configuration";
import {PlatformResponse} from "../model/platform_response";
import {gFaasFunction, XFaasFunctionTriggers} from "../model/function/xfaas_function";
import {FaasPlatformType} from "../enums/faas_platform_type";
import {XFaasFunctionYaml} from "../model/function/xfaas_function_yaml";
import {FaasService} from "./faas_service";
import {Namespace, Namespaces} from "../model/namespace/namespace";

export class NuclioService extends FaasService{

    constructor(faasServiceConfiguration: FaasPlatformConfiguration) {
        super(faasServiceConfiguration);
    }

    async health(): Promise<PlatformResponse<any>> {
        return await this.get('/');
    }


    async getFunction(functionName: string, namespace: string): Promise<PlatformResponse<gFaasFunction>> {
        let res = await this.get<any>(`/api/functions`, {
                'x-nuclio-function-namespace' : namespace,
                'x-nuclio-function-name' : functionName,
        });

        let nuclioFunction: any;
        Object.entries(res.response ?? '').map(e => {
            nuclioFunction = e[1];
        });

        if(!nuclioFunction){
            return new PlatformResponse<gFaasFunction>(false, undefined, 'Could not find fucntion');
        } if(res.successful){
            return new PlatformResponse<gFaasFunction>(true, await this.translateFunctionObject(nuclioFunction));
        }else{
            return new PlatformResponse<gFaasFunction>(false, );
        }
    }

    async getFunctions(): Promise<PlatformResponse<gFaasFunction[]>> {
        let res = await this.get<Map<string, string>>('/api/functions');

        if(res.successful){
            let xfaasFunction: gFaasFunction[] = [];
            Object.entries(res.response ?? '').map( async e => {
                let f = e[1];

                xfaasFunction.push(await this.translateFunctionObject(f));

            });
                return new PlatformResponse<gFaasFunction[]>(res.successful, xfaasFunction);
        }else{
            return new PlatformResponse<gFaasFunction[]>(false, []);
        }
    }

    async deleteFunction(functionName: string, namespace: string): Promise<PlatformResponse<any>> {
        let body = {
            "metadata": {
                "name": functionName,
                "namespace": namespace
            }
        };
        let res = await this.delete('/api/functions', JSON.stringify(body));
        return new PlatformResponse<Boolean>(res.successful);
    }

    async createFunction<T>(xFaasFunctionYaml: XFaasFunctionYaml, logStatus = true): Promise<PlatformResponse<any>> {

        // Check if function can be deployed
        const canDeployFunction = await this.canDeployFunction(xFaasFunctionYaml);
        if(!canDeployFunction.successful) {return canDeployFunction;}

        const deployment = this.configureDeploymentJson(xFaasFunctionYaml);
        return await this.post('/api/functions', deployment);
    }

    private configureDeploymentJson(xFaasFunctionYaml: XFaasFunctionYaml): string{

        let managementHost = this.faasServiceConfiguration.managementHost;
        if(managementHost.startsWith('http://')){
            managementHost = managementHost.substring(7, managementHost.length)
        }else if(managementHost.startsWith('https://')){
            managementHost = managementHost.substring(8, managementHost.length)
        }

        return JSON.stringify({
            "metadata": {
                "name": xFaasFunctionYaml.name,
                "namespace": xFaasFunctionYaml.namespace,
            },
            "spec": {
                "runtime": "java",
                "minReplicas" : xFaasFunctionYaml.getNuclioScale()?.min ?? 0,
                "maxReplicas" : xFaasFunctionYaml.getNuclioScale()?.max ?? 1,
                "replicas": xFaasFunctionYaml.getNuclioScale()?.target ?? 0,
                "resources": {
                    "requests": {
                        "cpu": xFaasFunctionYaml.requests.cpu ?? "",
                        "memory": xFaasFunctionYaml.requests.memory ?? ""
                    },
                    "limits" : {
                        "cpu": xFaasFunctionYaml.limits.cpu ?? "",
                        "memory": xFaasFunctionYaml.limits.memory ?? ""
                    }
                },
                "image": xFaasFunctionYaml.getRegistryImageLocation(),
                "triggers": {
                    "gfaas": {
                        "class": "nginx",
                        "kind": "http",
                        "name": "gfaas",
                        "attributes": {
                            // "ingresses": {
                            //     "gfaas": {
                            //         "host": managementHost,
                            //         "pathType": "ImplementationSpecific",
                            //         "paths": [
                            //             '/' + xFaasFunctionYaml.name
                            //         ]
                            //     }
                            // },
                            "serviceType": "ClusterIP"
                        }
                    }
                }
            },
        });
    }

    async translateFunctionObject(fun: any): Promise<gFaasFunction>{


        const funName = fun.metadata.name;
        const funNamespace = fun.metadata.namespace;

        const triggers = [];
        const headers = new Map<string, string>();
        headers.set("X-Nuclio-Function-Name", funName)

        const host = fun?.spec?.triggers?.gfaas?.attributes?.ingresses?.gfaas?.host;
        const paths = fun.spec?.triggers?.gfaas?.attributes?.ingresses?.gfaas?.paths;

        let httpTrigger;

        if (host && paths.length > 0){
            httpTrigger = new XFaasFunctionTriggers(
                'HTTPTrigger',
                '',
                `${this.faasServiceConfiguration.managementHost}:${this.faasServiceConfiguration.managementHostPort}${paths[0]}`,
                new Map()
            );
        }else{
            httpTrigger = new XFaasFunctionTriggers(
                'HTTPTrigger',
                '',
                `${this.faasServiceConfiguration.getManagementHostAndPort()}/api/function_invocations`,
                headers
            );
        }


        triggers.push(httpTrigger);

        let state = fun.status.state ?? 'NOT READY'
        state = state.toUpperCase()

        return new gFaasFunction(
            fun.metadata.name,
            this.faasServiceConfiguration.uniqueId,
            this.createPlatformId(funName, funNamespace, this.faasServiceConfiguration.uniqueId),
            FaasPlatformType.nuclio,
            '-',
             '0',
            triggers,
            funNamespace,
            fun.spec.image,
            state,
            {cpu: fun?.spec?.resources?.limits?.cpu ?? '', memory: fun?.spec?.resources?.limits?.memory?? ''},
            {cpu: fun?.spec?.resources?.requests?.cpu ?? '', memory: fun?.spec?.resources?.limits?.cpu ?? ''},
            {min: fun?.spec?.minReplicas, max: fun?.spec?.maxReplicas, target: fun?.spec?.replicas, scaleToZeroDuration: '-'}
        );
    }

    async getNamespaces(): Promise<PlatformResponse<Namespaces>> {
        const r = await this.get('/api/namespaces');
        if(r.successful){
            const s = r.response as {'namespaces': {'names': string[]}}
            const namespaces = s?.namespaces.names?.map( (r: string) => new Namespace(r, this.faasServiceConfiguration.uniqueId)) ?? [];
            const n = new Namespaces(namespaces);

            return new PlatformResponse(true, n)
        }else{
            return new PlatformResponse(false, new Namespaces())
        }
    }
}
