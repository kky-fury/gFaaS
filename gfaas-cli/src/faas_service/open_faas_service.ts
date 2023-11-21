import {FaasPlatformConfiguration} from "../model/service_configuration/faas_service_configuration";
import {PlatformResponse} from "../model/platform_response";
import {FaasPlatformType} from "../enums/faas_platform_type";
import {gFaasFunction, XFaasFunctionTriggers} from "../model/function/xfaas_function";
import {XFaasFunctionYaml} from "../model/function/xfaas_function_yaml";
import {FaasService} from "./faas_service";
import {Namespace, Namespaces} from "../model/namespace/namespace";

export class OpenFaasService extends FaasService{

    constructor(faasServiceConfiguration: FaasPlatformConfiguration) {
        super(faasServiceConfiguration);
    }

    async health(): Promise<PlatformResponse<any>> {
        return await this.get('/healthz');
    }

    async getFunction(functionName: string, namespace: string): Promise<PlatformResponse<gFaasFunction>> {
        let res = await this.get<any[]>(encodeURI(`/system/function/${functionName}?namespace=${namespace}`));
        if(res.successful){
            return new PlatformResponse<gFaasFunction>(true, await this.translateFunctionObject(res.response));
        }else{
            return new PlatformResponse<gFaasFunction>(false, );
        }
    }

    async getFunctions(): Promise<PlatformResponse<gFaasFunction[]>> {

        // Get the namespaces
        let namespaces = await this.getNamespaces();
        if(!namespaces.successful || !namespaces.response){
            return new PlatformResponse<gFaasFunction[]>(false, []);
        }

        let allNamespaceFunctions: any[] = [];

        // Get functions from all namespaces
        for(let namespace of namespaces.response.getNamespaces().map(n => n.name)){
            let res = await this.get<any[]>(encodeURI('/system/functions?namespace=' + namespace));
            if(res.successful){
                res.response?.forEach(f => allNamespaceFunctions.push(f));
            }
        }

        if(allNamespaceFunctions.length !== 0){

            let functions: gFaasFunction[] = [];

            for(const f of allNamespaceFunctions){
                functions.push(await this.translateFunctionObject(f));
            }

            return new PlatformResponse<gFaasFunction[]>(true, functions);
        }else{
            return new PlatformResponse<gFaasFunction[]>(false, []);
        }

    }

    async deleteFunction(functionName: string, namespace: string): Promise<PlatformResponse<any>> {
        let body = {'functionName': functionName};
        let res = await this.delete('/system/functions?namespace=' + namespace, JSON.stringify(body));
        return new PlatformResponse<Boolean>(res.successful);
    }

    async createFunction<T>(xFaasFunctionYaml: XFaasFunctionYaml, logStatus = true): Promise<PlatformResponse<any>> {

        // Check if function can be deployed
        const canDeployFunction = await this.canDeployFunction(xFaasFunctionYaml);
        if(!canDeployFunction.successful) {return canDeployFunction;}

        const openFaasLimits = xFaasFunctionYaml.limits;
        const openFaasRequests = xFaasFunctionYaml.requests;


        let openFaasFunction = {
            "service": xFaasFunctionYaml.name,
            "image": xFaasFunctionYaml.image,
            "namespace": xFaasFunctionYaml.namespace,
            "limits": {
                "memory": openFaasLimits?.memory,
                "cpu": openFaasLimits?.cpu
            },
            "requests": {
                "memory": openFaasRequests?.memory,
                "cpu": openFaasRequests?.cpu
            },
            "labels": {
                "com.openfaas.scale.min": xFaasFunctionYaml.getOpenFaasScale()?.min?.toString() ?? "1",
                "com.openfaas.scale.max": xFaasFunctionYaml.getOpenFaasScale()?.max?.toString() ?? "5",
            }
        };
        return await this.post('/system/functions', JSON.stringify(openFaasFunction));
    }

    async translateFunctionObject(fun: any): Promise<gFaasFunction> {
        const triggers = [
            new XFaasFunctionTriggers(
                'HTTPTrigger',
                'api-trigger',
                this.faasServiceConfiguration.getManagementHostAndPort() + '/function/' + fun.name + '.' + fun.namespace
            )
        ]

        return new gFaasFunction(
            fun.name,
            this.faasServiceConfiguration.uniqueId,
            this.createPlatformId(fun.name, fun.namespace, this.faasServiceConfiguration.uniqueId),
            FaasPlatformType.openfaas,
            fun.createdAt,
            fun.invocationCount?.toString() ?? '0',
            triggers,
            fun.namespace,
            fun.image,
            fun.availableReplicas ? 'READY': 'NOT READY',
            {cpu: fun?.limits?.cpu, memory: fun?.limits?.memory},
            {cpu: fun?.requests?.cpu, memory: fun?.requests?.memory},
            {min: fun.labels['com.openfaas.scale.min'] ?? "-", max : fun.labels['com.openfaas.scale.max'] ?? "-", target: "-", scaleToZeroDuration: "-"}
        );
    }

    async getNamespaces(): Promise<PlatformResponse<Namespaces>> {
        let namespacesResponse = await this.get<string[]>('/system/namespaces');
        if(namespacesResponse.successful && (namespacesResponse.response?.length ?? 0) > 0){

            const namespaces = namespacesResponse.response?.map(r => new Namespace(r, this.faasServiceConfiguration.uniqueId));
            const n = new Namespaces(namespaces);

            return new PlatformResponse(true, n)
        }else{
            return new PlatformResponse(false, new Namespaces())
        }
    }
}
