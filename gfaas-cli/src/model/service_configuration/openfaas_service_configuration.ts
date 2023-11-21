import {FaasPlatformConfiguration} from "./faas_service_configuration";
import {FaasPlatformType} from "../../enums/faas_platform_type";
import {AbstractAuth} from "../authentication/abstract_auth";
import {OpenFaasService} from "../../faas_service/open_faas_service";
import {FaasService} from "../../faas_service/faas_service";

export class OpenFaasServiceConfiguration extends FaasPlatformConfiguration{

    constructor(uniqueId: string,
                managementHost: string,
                managementHostPort: string,
                functionInvocationHost: string,
                functionInvocationHostPort: string,
                authentication: AbstractAuth,
                skipTLSVerify: boolean) {
        super(uniqueId, FaasPlatformType.openfaas, managementHost, managementHostPort, functionInvocationHost, functionInvocationHostPort, authentication, skipTLSVerify);
    }

    getPlatformService(): FaasService {
        return new OpenFaasService(this);
    }

}
