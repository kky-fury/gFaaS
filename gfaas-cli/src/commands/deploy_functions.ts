
import fs from 'fs';
import {FaaSPrinter} from "../cli/printer";
import {parse} from "csv-parse";
import {FaasPlatformService} from "../faas_service/faas_platforms_service";
import {Scale, XFaasFunctionYaml} from "../model/function/xfaas_function_yaml";


type CsvLine = {
    name: string,
    image: string,
    namespace: string,
    platformId: string,
    requestMemory: string,
    requestCpu: string,
    maxMemory: string,
    maxCpu: string,
    minScale: number,
    targetScale: number,
    maxScale: number
};

export class DeployFunctions {

    static async deployFunctions(csv: string){
        if(!fs.existsSync(csv)){
            FaaSPrinter.printError(`Could not find file: ${csv}`)
            return;
        }

        const fileContent = fs.readFileSync(csv, { encoding: 'utf-8' });
        const headers = ['name', 'image', 'namespace', 'platformId', 'requestMemory', 'requestCpu', 'maxMemory', 'maxCpu', 'minScale', 'targetScale', 'maxScale'];

        parse(fileContent, {
            delimiter: ',',
            columns: headers,
        }, (error, result: CsvLine[]) => {
            if (error) {
                FaaSPrinter.printError(`Could not read ${csv}`)
            }
            result = result.slice(1, result.length)
            this.doDeployFunctions(result);
        });
    }


    static async doDeployFunctions(functions: CsvLine[]){
        let numberDeployedFunctions = 0;
        for(let fun of functions){
            let platform = FaasPlatformService.getPlatformById(fun.platformId);
            const yml = this.getFunctionDefinition(fun)
            const res = await platform?.getPlatformService()!.createFunction(yml, false)
            if(res?.successful ?? false){
                numberDeployedFunctions ++;
            }
        }
        FaaSPrinter.print(`Deployed ${numberDeployedFunctions} functions.`)
    }

    static getFunctionDefinition(fun: CsvLine): XFaasFunctionYaml{

        const scale = new Map();

        scale.set(
            'knative',
            new Scale(
                '2m',
                'true',
                fun.minScale,
                fun.maxScale,
                fun.targetScale,
            )
        );

        scale.set(
            'nuclio',
            new Scale(
                '30',
                'true',
                Number(fun.minScale),
                Number(fun.maxScale),
                Number(fun.targetScale),
            )
        );

        scale.set(
            'fission',
            new Scale(
                30,
                'true',
                Number(fun.minScale),
                Number(fun.maxScale),
                Number(fun.targetScale),
            )
        );

        scale.set(
            'openfaas',
            new Scale(
                30,
                'false',
                fun.minScale,
                fun.maxScale,
                fun.targetScale,
            )
        );

        return new XFaasFunctionYaml(
            fun.name,
            "java",
            fun.image,
            "registry.hub.docker.com",
            fun.namespace,
            {
                memory: fun.maxMemory,
                cpu: fun.maxCpu,
            },
            {
                memory: fun.requestMemory,
                cpu: fun.requestCpu
            },
            scale,
            false
        )
    }
}
