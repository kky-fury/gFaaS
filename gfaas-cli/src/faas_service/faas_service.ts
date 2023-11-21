import {XFaasFunctionYaml} from "../model/function/xfaas_function_yaml";
import {PlatformResponse} from "../model/platform_response";
import {gFaasFunction} from "../model/function/xfaas_function";
import {HttpService} from "./http_service";
import {FaasPlatformConfiguration} from "../model/service_configuration/faas_service_configuration";
import {Namespaces} from "../model/namespace/namespace";
import {FaaSPrinter} from "../cli/printer";
import {Parser} from "../cli/parser";
import {FaasPlatformService} from "./faas_platforms_service";
import {FaasPlatformType} from "../enums/faas_platform_type";


export abstract class FaasService extends HttpService{

    faasServiceConfiguration: FaasPlatformConfiguration;

    protected constructor(faasServiceConfiguration: FaasPlatformConfiguration) {
        super(faasServiceConfiguration.authentication.getAuthenticationHeader(), faasServiceConfiguration.getManagementHostAndPort(), !faasServiceConfiguration.skipTLSVerify);
        this.faasServiceConfiguration = faasServiceConfiguration;
    }

    protected createPlatformId(functionName: string, namespace: string, platformId: string): string{
        return functionName + ':' + namespace + ':' + platformId;
    }

    abstract health<T>(): Promise<PlatformResponse<T>>;

    abstract getFunctions(): Promise<PlatformResponse<gFaasFunction[]>>;

    abstract getFunction(functionName: string, namespace: string): Promise<PlatformResponse<gFaasFunction>>;

    abstract translateFunctionObject(fun: any): Promise<gFaasFunction>;

    abstract deleteFunction(functionName: string, namespace: string): Promise<PlatformResponse<any>>;

    abstract createFunction(xFaasFunctionYaml: XFaasFunctionYaml, logStatus: boolean): Promise<PlatformResponse<any>>;

    abstract getNamespaces(): Promise<PlatformResponse<Namespaces>>;

    async invoke(fun: gFaasFunction, payload: any, ID : any): Promise<PlatformResponse<any>>{
            const httpTrigger = fun.getHttpTrigger();
            if(!httpTrigger || !httpTrigger.url){
                FaaSPrinter.printError(`Function ${ID} has no public HTTP-Trigger which can be invoked`);
                return new PlatformResponse(false);
            }

            if(httpTrigger.kind == 'http2'){
                FaaSPrinter.printError(`Cannot invoke grpc function. Use a grpc client like grpcurl.`);
                return new PlatformResponse(false);
            }

            this.url = httpTrigger.url;
            const headers = httpTrigger.headers;

            const payloadInfo = payload ? `with payload ${payload}` : '';
            FaaSPrinter.print(`Invoking function ${ID} (${fun.getCurlFormattedUrl()}) '${payloadInfo}':`)

            const record: Record<string, string> = {}
            headers.forEach((value, key) => record[key] = value)

            const invocation = await this.get('', record, payload);
            if(invocation.successful){
                console.log(invocation.response)
                return new PlatformResponse(true);
            }else{
                FaaSPrinter.printError(`Could not invoke function ${ID}`)
                return new PlatformResponse(false);
            }
    }

    async canDeployFunction(xFaasFunctionYaml: XFaasFunctionYaml, checkNamespace: boolean = true): Promise<PlatformResponse<any>>{
        // check if namespace exists
        if(checkNamespace){
            const namespaces = await this.getNamespaces();
            if(!namespaces.successful){
                return new PlatformResponse(false, {}, 'Could not reach server.');
            }else if(!namespaces.response?.containsNamespace(xFaasFunctionYaml.namespace)){
                return new PlatformResponse(false, {}, `Namespace '${xFaasFunctionYaml.namespace}' does not exist.`);
            }
        }

        // check if function already exists
        if((await this.getFunction(xFaasFunctionYaml.name, xFaasFunctionYaml.namespace)).response){
            return new PlatformResponse(
                false,
                {},
                `Function '${xFaasFunctionYaml.name}' in namespace '${xFaasFunctionYaml.namespace}' already exists`);
        }

        if(this.faasServiceConfiguration.faasPlatformType != FaasPlatformType.knative && xFaasFunctionYaml.isGrpc){
            return new PlatformResponse(
                false,
                {},
                `Function with 'isGrpc: true' can only be deployed to Knative.`);
        }

        return new PlatformResponse(true)
    }

    static async doDeleteFunction(ID: string): Promise<PlatformResponse<any>>{
        const parts = Parser.parseFunctionName(ID)
        if(!parts){
            console.log('Could not delete function.')
            return new PlatformResponse(false);
        }

        let platformConfig = FaasPlatformService.getPlatformById(parts[2]);

        if(!platformConfig){
            FaaSPrinter.printError('Could not find configuration for platform \'' + parts[2] + '\'');
            return new PlatformResponse(false);
        }

        let res = await platformConfig.getPlatformService().deleteFunction(parts[0], parts[1]);
        if(res.successful){
            console.log('Function was deleted.');
            return new PlatformResponse(true);
        }else{
            console.log('Could not delete function.')
            return new PlatformResponse(false);
        }
    }

}
