import {FaasPlatformService} from "../faas_service/faas_platforms_service";
import {gFaasFunction} from "../model/function/xfaas_function";
import {FaasService} from "../faas_service/faas_service";
import {FaaSPrinter} from "../cli/printer";


export class DeleteAllFunctions {

    static async deleteAllFunctions(){
        let platforms = FaasPlatformService.getPlatforms();
        const functions: gFaasFunction[] = []
        for(let platformConfig of platforms){
            const res = await platformConfig.getPlatformService().getFunctions()
            if(res.successful){
                res.response?.forEach(f => functions.push(f));
            }
        }
        let deletedFunctions = 0;
        for(let fun of functions){
            const res = await FaasService.doDeleteFunction(fun.functionId)
            if(res.successful){
                deletedFunctions ++;
            }
        }
        FaaSPrinter.print(`Deleted ${deletedFunctions} functions.`)
    }
}
