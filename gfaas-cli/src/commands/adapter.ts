import {FaaSPrinter} from "../cli/printer";

const fs = require('fs');
import axios from "axios";
import {ResourceDownloader} from "./resource_downloader";
import {SupportedLanguages} from "./supported_languages";
const fsExtra = require("fs-extra");

export class Adapter{

    static copiedYamlPositive = 'Created ./function.yml'
    static copiedYamlNegative = 'Could not create ./function.yml'

    static copiedDockerfilePositive = 'Created ./Dockerfile'
    static copiedDockerfileNegative = 'Could not create ./Dockerfile'

    static copiedReadmePositive = 'Created ./README.md'
    static copiedReadmeNegative = 'Could not create ./README.md'


    static async download(url: string, destPath: string, destFile: string, cb: Function){

        if (!fs.existsSync(destPath)){
            fs.mkdirSync(destPath, { recursive: true });
        }

        const dest = destPath + '/' + destFile


        let file = await axios.get(url,{
            method: 'GET',
            responseType: 'arraybuffer',
            responseEncoding: 'binary'
        })

        if(file.status != 200){
            cb('Could not download template data. Please try again.')
            return;
        }

        fs.writeFileSync(dest, file.data)
        cb()
    }

    static async adapt(lang: string){


        if(!SupportedLanguages.isLanguageSupported(lang)){
            SupportedLanguages.printLanguageNotSupported(lang)
            return;
        }

        await ResourceDownloader.downloadAndUnzipTemplates()

        if(lang == 'go1.19'){
            FaaSPrinter.print('Create files for function adapter go 1.19')
            await this.adaptGo()
        }else if (lang == 'python3.9'){
            FaaSPrinter.print('Create files for function adapter python3')
            await this.adaptPython()
        } else if(lang == 'node14'){
            FaaSPrinter.print('Create files for function adapter Node14')
            await this.adaptNode14()
        } else if (lang == 'java19'){
            FaaSPrinter.print('Create files for function adapter Java19')
            await this.adaptJava()
        } else if (lang == 'cpp20'){
            FaaSPrinter.print('Create files for function adapter Java19')
            await this.adaptCpp()
        } else{
            SupportedLanguages.printLanguageNotSupported(lang)
        }
    }

    private static async adaptGo(){
        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-go1.19/function.yml',
            'function.yml',
            Adapter.copiedYamlPositive,
            Adapter.copiedYamlNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-go1.19/Dockerfile',
            'Dockerfile',
            Adapter.copiedDockerfilePositive,
            Adapter.copiedDockerfileNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-go1.19/README.md',
            'README.md',
            Adapter.copiedReadmePositive,
            Adapter.copiedReadmeNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-go1.19/function.go',
            'function.go',
            'Created ./function.go',
            'Could not create ./function.go'
        )
        this.printReadAdapterSection()
    }

    private static async adaptPython(){

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-python3.9/function.yml',
            'function.yml',
            Adapter.copiedYamlPositive,
            Adapter.copiedYamlNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-python3.9/Dockerfile',
            'Dockerfile',
            Adapter.copiedDockerfilePositive,
            Adapter.copiedDockerfileNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-python3.9/README.md',
            'README.md',
            Adapter.copiedReadmePositive,
            Adapter.copiedReadmeNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-python3.9/function.py',
            'function.py',
            'Created ./function.py',
            'Could not create ./function.py'
        )

        this.printReadAdapterSection()
    }

    private static async adaptNode14(){

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-node14/function.yml',
            'function.yml',
            Adapter.copiedYamlPositive,
            Adapter.copiedYamlNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-node14/Dockerfile',
            'Dockerfile',
            Adapter.copiedDockerfilePositive,
            Adapter.copiedDockerfileNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-node14/README.md',
            'README.md',
            Adapter.copiedReadmePositive,
            Adapter.copiedReadmeNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-node14/function.js',
            'function.js',
            'Created ./function.js',
            'Could not create ./function.js'
        )

        this.printReadAdapterSection()
    }

    private static async adaptJava(){

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-java19/function.yml',
            'function.yml',
            Adapter.copiedYamlPositive,
            Adapter.copiedYamlNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-java19/Dockerfile',
            'Dockerfile',
            Adapter.copiedDockerfilePositive,
            Adapter.copiedDockerfileNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-java19/README.md',
            'README.md',
            Adapter.copiedReadmePositive,
            Adapter.copiedReadmeNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-java19/src/main/java/org/gfaas/function/Function.java',
            'src/main/java/org/gfaas/function/Function.java',
            'Created src/main/java/org/gfaas/function/Function.java',
            'Could not create src/main/java/org/gfaas/function/'
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-java19/libs',
            'libs/',
            'Created libs/gfaas-core.jar',
            'Could not create libs/gfaas-core-x.x.x.jar'
        )

        this.printReadAdapterSection()
    }

    private static printReadAdapterSection(){
        FaaSPrinter.printInfo('Read section Adapter in ./README.md for the next steps.')
    }

    public static async copyFile(src: string, dest: string, successMessage: string, errorMessage: string){
        try{
            await fsExtra.copySync(
                src,
                dest)
            FaaSPrinter.printSuccess(successMessage)
        }catch (e) {
            console.log(e)
            FaaSPrinter.printError(errorMessage)
        }
    }

    private static async adaptCpp() {

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-cpp20/function.yml',
            'function.yml',
            Adapter.copiedYamlPositive,
            Adapter.copiedYamlNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-cpp20/Dockerfile',
            'Dockerfile',
            Adapter.copiedDockerfilePositive,
            Adapter.copiedDockerfileNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-cpp20/README.md',
            'README.md',
            Adapter.copiedReadmePositive,
            Adapter.copiedReadmeNegative
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-cpp20/main.cpp',
            'main.cpp',
            'Created main.cpp',
            'Could not create main.cpp'
        )

        await Adapter.copyFile(
            'function-templates/gfaas-templates/gfaas-templates-main/function-cpp20/gfaas-cpp-httplib',
            'gfaas-cpp-httplib/',
            'Created gfaas-cpp-httplib',
            'Could not create gfaas-cpp-httplib'
        )

        this.printReadAdapterSection()
    }
}
