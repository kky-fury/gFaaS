import {FaasPlatformConfiguration} from "./faas_service_configuration";
import {FissionService} from "../../faas_service/fission_service";
import {AbstractAuth} from "../authentication/abstract_auth";
import {FaasPlatformType} from "../../enums/faas_platform_type";
import {FaasService} from "../../faas_service/faas_service";

export class FissionServiceConfiguration extends FaasPlatformConfiguration{

    constructor(uniqueId: string,
                managementHost: string,
                managementHostPort: string,
                functionInvocationHost: string,
                functionInvocationHostPort: string,
                authentication: AbstractAuth,
                skipTLSVerify: boolean) {
        super(uniqueId, FaasPlatformType.fission, managementHost, managementHostPort, functionInvocationHost, functionInvocationHostPort, authentication, skipTLSVerify);
    }

    getPlatformService(): FaasService {
        return new FissionService(this);
    }

}
