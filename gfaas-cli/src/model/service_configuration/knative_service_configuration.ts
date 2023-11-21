import {FaasPlatformConfiguration} from "./faas_service_configuration";
import {AbstractAuth} from "../authentication/abstract_auth";
import {FaasPlatformType} from "../../enums/faas_platform_type";
import {KnativeService} from "../../faas_service/knative_service";
import {FaasService} from "../../faas_service/faas_service";

export class KnativeServiceConfiguration extends FaasPlatformConfiguration{

    constructor(uniqueId: string,
                managementHost: string,
                managementHostPort: string,
                functionInvocationHost: string,
                functionInvocationHostPort: string,
                authentication: AbstractAuth,
                skipTLSVerify: boolean,
                httpFunctionInvocationPort: number) {
        super(uniqueId, FaasPlatformType.knative, managementHost, managementHostPort, functionInvocationHost, functionInvocationHostPort, authentication, skipTLSVerify, httpFunctionInvocationPort);
    }

    getPlatformService(): FaasService {
        return new KnativeService(this);
    }

}
