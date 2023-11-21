import {FaasPlatformService} from "../faas_service/faas_platforms_service";


export class Parser{

    static parseFunctionName(id: string): string[] | undefined {
        let functionPlatform = id.split(':');
        if(functionPlatform.length != 3){
            console.log('The given ID \'' + id + '\' is not valid. \nType \'xfaas functions\' to get a valid one.');
            return;
        }

        let functionName = functionPlatform[0];
        let functionNamespace = functionPlatform[1];
        let platformId = functionPlatform[2];

        let platformConfig = FaasPlatformService.getPlatformById(platformId);
        if(!platformConfig){
            console.log('Cannot find the configuration for platform \'' + platformId + '\.');
            return;
        }

        return [functionName, functionNamespace, platformId];
    }


}
