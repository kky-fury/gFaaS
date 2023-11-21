import {FaasPlatformConfiguration} from "./faas_service_configuration";
import {FaasPlatformType} from "../../enums/faas_platform_type";
import {AbstractAuth} from "../authentication/abstract_auth";
import {NuclioService} from "../../faas_service/nuclio_service";
import {FaasService} from "../../faas_service/faas_service";

export class NuclioServiceConfiguration extends FaasPlatformConfiguration{

    constructor(uniqueId: string,
                managementHost: string,
                managementHostPort: string,
                functionInvocationHost: string,
                functionInvocationHostPort: string,
                authentication: AbstractAuth,
                skipTLSVerify: boolean) {
        super(uniqueId, FaasPlatformType.nuclio, managementHost, managementHostPort, functionInvocationHost, functionInvocationHostPort, authentication, skipTLSVerify);
    }

    getPlatformService(): FaasService {
        return new NuclioService(this);
    }

}
