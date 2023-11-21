import {Table} from "console-table-printer";
import {FaasPlatformConfiguration} from "../model/service_configuration/faas_service_configuration";
import {gFaasFunction} from "../model/function/xfaas_function";
const clc = require("cli-color");

export class FaaSPrinter{


    printPlatforms(faasPlatformConfigurations: FaasPlatformConfiguration[]){
        const p = new Table({
            columns: [
                { name: 'Platform ID'},
                { name: 'Platform Type' },
                { name: 'Gateway'},
                { name: 'Authentication Type'},
                { name: 'Credentials'},
            ],
        });

        faasPlatformConfigurations.forEach(platform => {
            p.addRow(
                { 'Platform ID': platform.uniqueId,
                    'Platform Type': platform.faasPlatformType,
                    'Gateway': platform.getManagementHostAndPort(),
                    'Authentication Type': platform.authentication.authenticationType,
                    'Credentials': platform.authentication.printAuthenticationType()});
        });

        p.printTable();
    }

    printPlatformsHealth(faasPlatformConfigurations: Map<FaasPlatformConfiguration, boolean>){
        const p = new Table({
            columns: [
                { name: 'Platform ID'},
                { name: 'Health Status'},
            ],
        });

        faasPlatformConfigurations.forEach((value, key) => {
            p.addRow({ 'Platform ID': key.uniqueId, 'Health Status': value ? 'Ok' : 'Not Reached'});
        });

        p.printTable();
    }

    printFunctions(functions: gFaasFunction[]){
        const p = new Table({
            columns: [
                { name: 'Function ID'},
                { name: 'Name'},
                { name: 'Namespace'},
                { name: 'Platform ID'},
                { name: 'Status'},
                { name: 'Trigger'},
                { name: 'URL (curl notation)'},
            ],
        });

        functions.forEach((f) => {

            let url: string = f.getCurlFormattedUrl() ?? 'No HttpTrigger found'
            let trigger = 'http';
            if(f.getHttpTrigger().kind == 'http2'){
                trigger = 'grpc'
            }

            p.addRow({
                'Function ID': f.functionId,
                'Name': f.name, 'Namespace':  f.namespace, 'Platform ID': f.platformId, 'Status': f.status, 'Trigger': trigger,'URL (curl notation)': url,});
        });

        p.printTable();
    }

    static printFunction(f: gFaasFunction){
        const p = new Table({});

        let cpuLimit = f?.limits?.cpu;
        if(cpuLimit){
            cpuLimit += ' (CPU)'
        }else{
            cpuLimit = 'No CPU limit set'
        }

        let memoryLimit = f?.limits?.memory;
        if(memoryLimit){
            memoryLimit += ' (Memory)'
        }else{
            memoryLimit = 'No Memory limit set'
        }

        let cpuRequest = f?.requests?.cpu;
        if(cpuRequest){
            cpuRequest += ' (CPU)'
        }else{
            cpuRequest = 'No CPU request set'
        }

        let memoryRequest = f?.requests?.memory;
        if(memoryRequest){
            memoryRequest += ' (Memory)'
        }else{
            memoryRequest = 'No Memory request set'
        }

        const t = f.getHttpTrigger();
        let triggerType = 'http';
        if(t.kind == 'http2'){
            triggerType = 'grpc'
        }

        p.addColumn('Key');
        p.addColumn( 'Value');
        p.addRow({Key: 'Address', Value: f.getCurlFormattedUrl() ?? 'No trigger found'})
        p.addRow({Key: 'Trigger Type', Value: triggerType})
        p.addRow({Key: 'Function ID', Value: f.functionId})
        p.addRow({Key: 'Image', Value: f.image})
        p.addRow({Key: 'Created at', Value: f.createdAt})
        p.addRow({Key: 'Name', Value: f.name})
        p.addRow({Key: 'Namespace', Value: f.namespace})
        p.addRow({Key: 'Platform ID', Value: f.platformId})
        p.addRow({Key: 'Platform Type', Value: f.platformType})
        p.addRow({Key: 'Limits', Value: cpuLimit})
        p.addRow({Value: memoryLimit})
        p.addRow({Key: 'Requests', Value: cpuRequest})
        p.addRow({Value: memoryRequest})


        p.addRow({Key: 'Scale to zero duration', Value: `${f.scale?.scaleToZeroDuration ?? '-'}`})
        p.addRow({Key: 'Minimum Scale', Value: `${f.scale?.min ?? '-'}`})
        p.addRow({Key: 'Maximum Scale', Value: `${f.scale?.max ?? '-'}`})
        p.addRow({Key: 'Target Scale', Value: `${f.scale?.target ?? '-'}`})
        // p.addRow({Value: memoryRequest})

        p.printTable();
    }

    static printDockerNotInstalled(){
        console.log('Could not reach Docker-Demon. Please make sure Docker is installed and running.')
    }

    static printError(error: string){
        console.log(clc.red(error))
    }

    static printSuccess(success: string){
        console.log(clc.green(success))
    }

    static printInfo(success: string){
        console.log(clc.yellow(success))
    }

    static print(text: string){
        console.log(text)
    }
}
