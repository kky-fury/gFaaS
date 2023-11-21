#!/usr/bin/env node

import {FaasPlatformService} from "./faas_service/faas_platforms_service";
import {FaaSPrinter} from "./cli/printer";
import {FaasPlatformConfiguration} from "./model/service_configuration/faas_service_configuration";
import {PlatformResponse} from "./model/platform_response";
import {XFaasResource} from "./enums/xfaas_resource";
import {gFaasFunction} from "./model/function/xfaas_function";

const program = require('commander');
const fs   = require('fs');
import {Adapter} from "./commands/adapter";
const tar = require('tar')
import {ContainerService} from "./container/container_service";
import {FunctionParser} from "./cli/function_parser";
import {SupportedLanguages} from "./commands/supported_languages";
import {NewFunction} from "./commands/new_function";
import {Parser} from "./cli/parser";
import {PlattformSettingsParser} from "./cli/platform_settings_parser";
import {FaasService} from "./faas_service/faas_service";
import {DeployFunctions} from "./commands/deploy_functions";
import {DeleteAllFunctions} from "./commands/delete_all_functions";
const readlineSync = require('readline-sync');
const loading =  require('loading-cli');

program
    .name('xfaas')
    .description('CLI to interact with the open-source FaaS platforms OpenFaaS, Nuclio, Fn, Fission and Knative')
    .version('1.1.17');

program.command('platforms')
    .description('Display information about the configured platforms')
    .option('--health', 'Display health check on the platforms')
    .action(async (options: any) => {
        let platforms = FaasPlatformService.getPlatforms();
        if(platforms.length == 0){
            FaaSPrinter.printError('No or invalid platform settings were provided.');
            return;
        }

        if(options.health){
            let platforms = FaasPlatformService.getPlatforms();
            let healthMap = new Map<FaasPlatformConfiguration, boolean>();
            for(let platformConfig of platforms){
                let health = await platformConfig.getPlatformService().health();
                healthMap.set(platformConfig, health.successful);
            }
            new FaaSPrinter().printPlatformsHealth(healthMap);
        }else{
            let platforms = FaasPlatformService.getPlatforms();
            new FaaSPrinter().printPlatforms(platforms);
        }
    });

program.command('functions')
    .description('Display information about the deployed functions')
    .action(async () => {

        let platforms = FaasPlatformService.getPlatforms();
            if(platforms.length == 0){
                FaaSPrinter.printError('No or invalid platform settings were provided.');
                return;
            }

            const collectFunctions = loading("Collect deployed functions, please wait!").start()

            let functions: gFaasFunction[] = [];
            for(let p of platforms){
                let res: PlatformResponse<gFaasFunction[]> = await p.getPlatformService().getFunctions();
                if(res.successful){
                    res.response?.forEach(f => functions.push(f));
                }
            }
            collectFunctions.stop();
            new FaaSPrinter().printFunctions(functions);
    });

program.command('function')
    .description('Display information about the deployed functios')
    .argument('<ID>', 'The ID of the fuction')
    .action(async (ID: string) => {

        const parts = Parser.parseFunctionName(ID)
        if(!parts){
            return;
        }

        let platformConfig = FaasPlatformService.getPlatformById(parts[2]);

        if(!platformConfig){
            FaaSPrinter.printError('Could not find configuration for platform \'' + parts[2] + '\'');
            return;
        }

        let res = await platformConfig.getPlatformService().getFunction(parts[0], parts[1]);

        if(res.successful){
            FaaSPrinter.printFunction(res.response!);
        }else{
            FaaSPrinter.printError(`Could not fetch function ${ID}`)
        }

    });

program.command('invoke')
    .description('Display information about the deployed functios')
    .argument('<ID>', 'The ID of the fuction')
    .option('-p, --payload <payload>', 'Payload of function invokation')
    .action(async (ID: string, options: {payload: string}) => {

        const parts = Parser.parseFunctionName(ID)
        if(!parts){
            return;
        }

        let platformConfig = FaasPlatformService.getPlatformById(parts[2]);

        if(!platformConfig){
            FaaSPrinter.printError('Could not find configuration for platform \'' + parts[2] + '\'');
            return;
        }

        let res = await platformConfig.getPlatformService().getFunction(parts[0], parts[1]);
        if(res.successful){
            await platformConfig.getPlatformService().invoke(res.response!, options.payload, ID)
        }else{
            FaaSPrinter.printError(`Could not invoke function ${ID}`)
        }
    });

program.command('delete')
    .description('Delete resources')
    .argument('<resource>', 'The resource that should be deleted. Supported resources: function')
    .argument('<ID>', 'The The XFaas Id of the resource')
    .action(async (resource: string, ID: string) => {

        if(XFaasResource.function == resource){

            await FaasService.doDeleteFunction(ID);
        }else{
            console.log('The given resource \'' + resource + '\' is not supported. \nType \'xfaas help delete\' to display the supported resources.')
            return;
        }
    });

program.command('deploy')
    .description('Deploy the function to the given FaaS platform')
    .argument('<functionConfigFile>', 'The path to the yaml config file of the function one wants to deploy')
    .argument('<targetPlatformUniqueId>', 'The UniqueId of the target platform. Type in \'xfaas platforms\' to show available platfroms.')
    .action(async (functionConfigFile: string, targetPlatformUniqueId: string) => {
        let targetPlatform = FaasPlatformService.getPlatformById(targetPlatformUniqueId);

        if(!targetPlatform){
            console.log('Could not find the target platform ' + targetPlatformUniqueId +'.\nPlease type in \'xfaas platforms\' to display available platforms');
            return;
        }

       let xfaasFunctionYaml = FunctionParser.parseFuncfionConfig(functionConfigFile);
        if(!xfaasFunctionYaml){
            return;
        }

        console.log('Try to deploy function ' + xfaasFunctionYaml.deployRegistry + '/' + xfaasFunctionYaml.image + ' to ' + targetPlatformUniqueId + '.');
        const deployFunction = loading("Deploying Function, please wait!").start()

        let deployment = await targetPlatform!.getPlatformService().createFunction(xfaasFunctionYaml!, true);

        deployFunction.stop();
        if(deployment.successful){
            console.log('Function was deployed.');
        }else{
            console.log(`Could not deploy function: ${deployment.errorMessage}`);
        }
    });

program.command('push')
    .description('Deploy the function to the given FaaS platform')
    .argument('<function_config>', 'Function YAML config file')
    .action(async (function_config: string) => {


        PlattformSettingsParser.parsePlattformSettings();


        // Make sure docker is installed and running
        if(!await ContainerService.isServiceReachable()){
            FaaSPrinter.printDockerNotInstalled();
            return;
        }

        const checkingYamlFile = loading("Checking function config.").start()
        let functionYaml = FunctionParser.parseFuncfionConfig(function_config);
        if(!functionYaml){
            return;
        }

        const imageName = functionYaml.image;
        const imageExists = await ContainerService.imageExistsLocally(imageName);
        checkingYamlFile.stop();
        // Check if image exists
        if(!imageExists){
            FaaSPrinter.printError(`Function image \'${functionYaml.getRegistryImageLocation()}\' does not exist in your local docker repository.`)
            FaaSPrinter.printError(`Please execute \'xfaas build function.yaml\' before pushing.`)
            return
        }

        // Authentication
        FaaSPrinter.print(`Please enter your username and password for repository \'${functionYaml.deployRegistry}\'`)
        let username = readlineSync.question('Username: ');
        let password = readlineSync.question('Password: ', {hideEchoBack: true, mask: '*'});
        const auth = {
            username: username,
            password: password,
            serveraddress: functionYaml.deployRegistry
        };
        if(!await ContainerService.auth(auth)){
            FaaSPrinter.printError(`Could not log in. Wrong username or password for registry \'${functionYaml.deployRegistry}\'`)
            return
        }


        FaaSPrinter.print(`Try to push Function ${functionYaml.name} (${functionYaml.image}) to repository ${functionYaml.deployRegistry}`)
        const load = loading("Pushing Function, please wait!").start()
        function onError(e: any){
            load.stop();
            FaaSPrinter.printError('Could not push Function. Please make sure:')
            FaaSPrinter.printError(`    1. The image you want to push \'${imageName}\' exists in your local repo.`)
            FaaSPrinter.printError(`    2. You have entered the proper credentials for your account and remote repo \'${functionYaml?.deployRegistry}\'`)
            FaaSPrinter.printError('Push Error: ' + e)
        }

        function onSuccess(_: any){
            load.stop();
            FaaSPrinter.printSuccess(`Function was successfully pushed to remote repository \'${functionYaml?.deployRegistry}\'`)
            FaaSPrinter.printSuccess('Next Step: \'xfaas deploy function.yaml target_faas_platform\' to deploy the Function to the given FaaS Platform.')
        }
        await ContainerService.pushImage(imageName, onError, onSuccess, auth)


    });

program.command('newFunction')
    .description('Create a new function based on the xfaas-templates')
    .requiredOption('-l, --lang <language>', `Language for the template must be provided: ${SupportedLanguages.getSupportedLanuagesAsString()}`)
    .option('-n, --name <name>', 'Name of the Function folder', 'function')
    .action(async (options: {lang: string, name: string}) => {

        await NewFunction.createNewFunction(options.lang, options.name)

    });

program.command('build')
    .description('Build a function')
    .argument('<function_config>', 'Function YAML config file')
    .action(async (function_config: string) => {

        // For development set it to a function directory
        // const path = '/Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-python3.9'
        // const path = '/Users/paul/Desktop/master_thesis/xfaas-templates/xfaas-function-cpp20'
        // process.chdir(path)

        // Make sure docker is installed and running
        if(!await ContainerService.isServiceReachable()){
            FaaSPrinter.printDockerNotInstalled();
            return;
        }

        let xfaasFunctionYaml = FunctionParser.parseFuncfionConfig(function_config);
        if(!xfaasFunctionYaml){
            return;
        }

        console.log(`Try to build function ${xfaasFunctionYaml.name} as ${xfaasFunctionYaml.image}`)
        const load = loading("Building Function, please wait!").start()

        const dockerfile = 'Dockerfile'


        if(!fs.existsSync(dockerfile)){
            load.stop();
            FaaSPrinter.printError('Error: Could not find file Dockerfile in the current directory')
            return;
        }

        // Create an archive of the function to send it to the docker deamon
        if(!fs.existsSync('build')){
            fs.mkdirSync('build')
        }

        const functionPath = 'build/' + xfaasFunctionYaml.name + '.tar';

        await tar.c(
            {
                gzip: false,
                file: functionPath
            },
            ['.']
        ).then((_: any) => {
        })

        function onBuildError(err: any){
            load.stop();
            FaaSPrinter.printError("Error building the Function:")
            FaaSPrinter.printError('Build Error: ' + err)
        }

        function onBuildSuccess(_: any){
            load.stop();
            FaaSPrinter.printSuccess("Function was built successfully.")
            FaaSPrinter.printSuccess('Next Step: \'xfaas push function.yaml\' to push the Function to your remote repository.')
        }


        await ContainerService.buildFunction(
            functionPath,
            xfaasFunctionYaml.image,
            onBuildError,
            onBuildSuccess);
    });

program.command('adapt')
    .description('Add the code to integrate the function code into an existing project')
    .requiredOption('-l, --lang <language>', 'supported languages: go1.19')
    .action(async (language: {lang: string}) => {
        await Adapter.adapt(language.lang)
});

program.command('deployFunctions')
    .description('Deploy multiple functions frosm csv file.')
    .requiredOption('-f, --file <file>', 'Support csv file with function definitions')
    .action(async (options: {file: string}) => {
        await DeployFunctions.deployFunctions(options.file);
    });

program.command('deleteAllFunctions')
    .description('Delete all deployed functions')
    .action(async () => {
        const d = readlineSync.question('Do you really want to delete all deployed functions? (Y/N):\n');
        if(d === 'Y'){
            FaaSPrinter.print('Deleting all deployed functions.')
            await DeleteAllFunctions.deleteAllFunctions();
        }else{
            FaaSPrinter.print('Deletion aborted.')
        }
    });


program.parse();
