import {FaasPlatformType} from "../../enums/faas_platform_type";
import {AbstractAuth} from "../authentication/abstract_auth";
import {FaasService} from "../../faas_service/faas_service";

export abstract class FaasPlatformConfiguration {

    uniqueId: string;
    faasPlatformType:  FaasPlatformType;
    managementHost: string;
    managementHostPort: string;
    functionInvocationHost: string;
    functionInvocationHostPort: string;
    authentication: AbstractAuth;
    skipTLSVerify: boolean;

    httpFunctionInvocationPort: number;


    protected constructor(uniqueId: string,
                          faasPlatformType: FaasPlatformType,
                          managementHost: string,
                          managementHostPort: string,
                          functionInvocationHost: string,
                          functionInvocationHostPort: string,
                          authentication: AbstractAuth,
                          skipTLSVerify: boolean,
                          httpFunctionInvocationPort: number = 0) {
        this.managementHost = managementHost;
        this.managementHostPort = managementHostPort;
        this.functionInvocationHost = functionInvocationHost;
        this.functionInvocationHostPort = functionInvocationHostPort;
        this.faasPlatformType = faasPlatformType;
        this.authentication = authentication;
        this.uniqueId = uniqueId;
        this.skipTLSVerify = skipTLSVerify;
        this.httpFunctionInvocationPort = httpFunctionInvocationPort;
    }

    getManagementHostAndPort(): string{
        return this.managementHost + ':' + this.managementHostPort;
    }

    getInvocationHostAndPort(): string{
        return this.functionInvocationHost + ':' + this.functionInvocationHostPort;
    }

    abstract getPlatformService(): FaasService;

}
