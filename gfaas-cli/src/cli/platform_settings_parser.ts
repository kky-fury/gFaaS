import fs from "fs";
import { homedir } from 'os'
import {FaaSPrinter} from "./printer";
import YAML from "yaml";
import {NoAuth} from "../model/authentication/no_auth";
import {BasicAuth} from "../model/authentication/basic_auth";
import {BearerAuth} from "../model/authentication/bearer_auth";
import {OpenFaasServiceConfiguration} from "../model/service_configuration/openfaas_service_configuration";
import {FissionServiceConfiguration} from "../model/service_configuration/fission_service_configuration";
import {KnativeServiceConfiguration} from "../model/service_configuration/knative_service_configuration";
import {NuclioServiceConfiguration} from "../model/service_configuration/nuclio_service_configuration";
import {FaasPlatformConfiguration} from "../model/service_configuration/faas_service_configuration";


export class PlattformSettingsParser{


    static parsePlattformSettings(): FaasPlatformConfiguration[]{
        const userHomeDir = homedir()
        const platformSettings = `${userHomeDir}/gfaas/platform_settings.yml`;
        const configs: FaasPlatformConfiguration[] = [];

        if(!fs.existsSync(platformSettings)){
            FaaSPrinter.printError(`Could not find platform configurations '${platformSettings}'. Please make sure to provide the configuration file.`)
            FaaSPrinter.printError(`Type 'gfaas initPlatformSettings' to initialize the configuration file.`)
            return [];
        }


        const file = fs.readFileSync(platformSettings, 'utf8')
        let parsedYaml = YAML.parse(file)

        for(let i = 0; i < parsedYaml.length; i++){
            const e = parsedYaml[i];
            if(this.isOpenFaasConfig(e)){
                configs.push(this.parseOpenFaasConfig(e.openfaas))
            }else if(this.isFissionConfig(e)){
                configs.push(this.parseFissionConfig(e.fission))
            }else if(this.isKnativeConfig(e)){
                configs.push(this.parseKnativeConfig(e.knative))
            }else if(this.isNuclioConfig(e)){
                configs.push(this.parseNuclioConfig(e.nuclio))
            }else{
                FaaSPrinter.printError(`Unsupported platform configuration: \n ${JSON.stringify(e)}`)
                return [];
            }
        }
        return configs;
    }

    private static isOpenFaasConfig(e: any): boolean{
        return e.openfaas != null;
    }

    private static parseOpenFaasConfig(e: any){
        const auth = this.parseAuthentication(e)
        return new OpenFaasServiceConfiguration(
                e.id,
                e.managementHost,
                e.managementPort,
                e.functionHost,
                e.functionPort,
                auth,
                e.skipTLSVerify
        );
    }

    private static parseFissionConfig(e: any){
        const auth = this.parseAuthentication(e)
        return new FissionServiceConfiguration(
            e.id,
            e.managementHost,
            e.managementPort,
            e.functionHost,
            e.functionPort,
            auth,
            e.skipTLSVerify
        );
    }

    private static parseKnativeConfig(e: any){
        const auth = this.parseAuthentication(e)
        return new KnativeServiceConfiguration(
            e.id,
            e.managementHost,
            e.managementPort,
            e.functionHost,
            e.functionPort,
            auth,
            e.skipTLSVerify,
            e.httpFunctionInvocationPort
        );
    }

    private static parseNuclioConfig(e: any){
        const auth = this.parseAuthentication(e)
        return new NuclioServiceConfiguration(
            e.id,
            e.managementHost,
            e.managementPort,
            e.functionHost,
            e.functionPort,
            auth,
            e.skipTLSVerify
        );
    }

    private static isFissionConfig(config: any): boolean{
        return config.fission != null;
    }

    private static isKnativeConfig(config: any): boolean{
        return config.knative != null;
    }

    private static isNuclioConfig(config: any): boolean{
        return config.nuclio != null;
    }

    private static parseAuthentication(e: any){
        if(e.authentication){
            if(e.authentication.type == 'basic-auth'){
                return new BasicAuth(
                    e.authentication.username,
                    e.authentication.password,
                );
            }else if(e.authentication.type == 'bearer'){
                return new BearerAuth(
                    e.authentication.token
                );
            }else{
                return new NoAuth();
            }
        }else{
            return new NoAuth();
        }
    }

}
