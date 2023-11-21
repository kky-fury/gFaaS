import {XFaasFunctionYaml} from "../model/function/xfaas_function_yaml";
import {PlatformResponse} from "../model/platform_response";
import {gFaasFunction, XFaasFunctionTriggers} from "../model/function/xfaas_function";
import {FaasPlatformConfiguration} from "../model/service_configuration/faas_service_configuration";
import {FaasPlatformType} from "../enums/faas_platform_type";
import {FaasService} from "./faas_service";
import {Namespaces} from "../model/namespace/namespace";

export class FissionService extends FaasService{


    constructor(faasServiceConfiguration: FaasPlatformConfiguration) {
        super(faasServiceConfiguration);
    }

    async createFunction(xFaasFunctionYaml: XFaasFunctionYaml, logStatus = true): Promise<PlatformResponse<any>> {

        // Check if function can be deployed
        const canDeployFunction = await this.canDeployFunction(xFaasFunctionYaml, false);
        if(!canDeployFunction.successful) {return canDeployFunction;}


        let fissionFunction = this.configureFissionDeployment(xFaasFunctionYaml);
        let resFunction =  this.post('/v2/functions', fissionFunction);

        if(xFaasFunctionYaml.name){

            const trigger = this.configureFissionHttpTrigger(xFaasFunctionYaml);
          if(logStatus){
              console.log('     - Try to create http trigger for function ' + xFaasFunctionYaml.name);
          }
          let resTrigger = await this.post('/v2/triggers/http', trigger);

          if(logStatus){
              if(resTrigger.successful){
                  console.log('     - Trigger for function ' + xFaasFunctionYaml.name + ' was created.');
              }else{
                  console.log('     - Could not create trigger for function ' + xFaasFunctionYaml.name);
              }
          }
        }
        return resFunction;
    }

    async getHttpTrigger(name: string, namespace: string): Promise<PlatformResponse<XFaasFunctionTriggers | any>>{
        const trigger = await this.get(`/v2/triggers/http/${name}?namespace=${namespace}`)
        if(trigger.successful){
            return trigger;
        }else{
            return trigger;
        }
    }

    async deleteFunction(functionName: string, namespace: string): Promise<PlatformResponse<any>> {

        let res = await this.delete<PlatformResponse<any>>('/v2/functions/' + functionName + '?namespace=' + namespace, '');
        if((await res).successful){
            // Delete http trigger
            let resTrigger = await this.delete('/v2/triggers/http/' + functionName + '?namespace=' + namespace, '');
            if(resTrigger.successful){
                console.log('HTTPTrigger was deleted.');
            }
        }
        return res;
    }

    async getFunction(functionName: string, namespace: string): Promise<PlatformResponse<gFaasFunction>> {
        let res = await this.get<any>(`/v2/functions/${functionName}?namespace=${namespace}`);

        if(res.successful){
            return new PlatformResponse<gFaasFunction>(true, await this.translateFunctionObject(res.response));
        }else{
            return new PlatformResponse<gFaasFunction>(false, );
        }
    }

    async getFunctions(): Promise<PlatformResponse<gFaasFunction[]>> {
        let response = await this.get<any[]>('/v2/functions');

        if(response.successful && response.response){
            let xFaasFunctions: gFaasFunction[] = [];
            for (const f of (response.response as any[])) {

                xFaasFunctions.push(await this.translateFunctionObject(f));
            }
            return new PlatformResponse(true, xFaasFunctions);
        }
        return new PlatformResponse(false, []);
    }

    async health<T>(): Promise<PlatformResponse<T>> {
        return this.get('/');
    }


    private configureFissionDeployment(xFaasFunctionYaml: XFaasFunctionYaml): string{
        return JSON.stringify({
        "kind": "Function",
        "apiVersion": "fission.io/v1",
        "metadata": {
            "name": xFaasFunctionYaml.name,
            "namespace": xFaasFunctionYaml.namespace
        },
        "spec": {
            "InvokeStrategy": {
                "ExecutionStrategy": {
                    "ExecutorType": 'container',
                    "MinScale": xFaasFunctionYaml.getFissionScale()?.min ?? 1,
                    "MaxScale": xFaasFunctionYaml.getFissionScale()?.max ?? 1,
                    "SpecializationTimeout": 120
                },
                "StrategyType": "execution"
            },
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
            "functionTimeout": 120,
            "idletimeout": xFaasFunctionYaml.getFissionScale()?.scaleToZeroDuration ?? 120,
            "podspec": {
                "containers": [
                    {
                        "name": xFaasFunctionYaml.name,
                        "image": xFaasFunctionYaml.getRegistryImageLocation(),
                        "ports": [
                            {
                                "name": "http-env",
                                "containerPort": 8080,
                                "protocol": "TCP"
                            }
                        ],
                        "resources": {}
                    }
                ],
                "terminationGracePeriodSeconds": 0
            }
        }
    });
    }

    private configureFissionHttpTrigger(xFaasFunctionYaml: XFaasFunctionYaml): string{
        return JSON.stringify({
                    "kind" : "HTTPTrigger",
                    "apiVersion" : "ission.io/v1",
                    "spec" : {
                        "relativeurl" : `/${xFaasFunctionYaml.name}`,
                        "methods" : [
                            "GET"
                        ],
                        "functionref" : {
                            "type" : "name",
                            "name" : xFaasFunctionYaml.name
                        }
                    },
                    "metadata" :  {
                        "name" : xFaasFunctionYaml.name,
                        "namespace" : xFaasFunctionYaml.namespace
                    }
                });
    }

    async translateFunctionObject(fun: any): Promise<gFaasFunction> {
        const funName = fun.metadata.name;
        const funNamespace = fun.metadata.namespace;

        let httpTrigger = await this.get<any>(`/v2/triggers/http/${funName}?namespace=${funNamespace}`);
        let triggers = [];
        if(httpTrigger.successful){
            let xFaasHttpTrigger = new XFaasFunctionTriggers(
                'HTTPTrigger',
                httpTrigger.response!.metadata!.name,
                this.faasServiceConfiguration.getManagementHostAndPort() + httpTrigger.response!.spec.relativeurl,
            );
            triggers.push(xFaasHttpTrigger);
        }

        const executionStrategy = fun?.spec?.InvokeStrategy?.ExecutionStrategy;

        return new gFaasFunction(
            funName,
            this.faasServiceConfiguration.uniqueId,
            this.createPlatformId(funName, funNamespace, this.faasServiceConfiguration.uniqueId),
            FaasPlatformType.fission,
            fun.metadata?.creationTimestamp,
            fun.invocationCount?.toString() ?? '0',
            triggers,
            funNamespace,
            fun?.spec?.podspec?.containers[0]?.image,
            '-',
            {cpu: fun?.spec?.resources?.limits?.cpu ?? '', memory: fun?.spec?.resources?.limits?.memory?? ''},
            {cpu: fun?.spec?.resources?.requests?.cpu ?? '', memory: fun?.spec?.resources?.limits?.cpu ?? ''},
            {min: executionStrategy?.MinScale, max: executionStrategy?.MaxScale, target: '-', scaleToZeroDuration: fun?.spec?.idletimeout}

        );
    }

    async getNamespaces(): Promise<PlatformResponse<Namespaces>> {
        throw new Error('Namespaces is not suported in Fission. This Function should never be called')
    }


}
