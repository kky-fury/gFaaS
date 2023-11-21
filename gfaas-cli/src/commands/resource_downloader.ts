import {Adapter} from "./adapter";
import loading from "loading-cli";
import {FaaSPrinter} from "../cli/printer";
import fs from "fs";
const extract = require('extract-zip')

export class ResourceDownloader {

    static async downloadTemplatesZip(targetDir: string, targetFile: string){
        const load = loading("Downloading templates, please wait!").start()
        const templates = 'https://github.com/paul-wie/gfaas-templates/archive/refs/heads/main.zip'
        await Adapter.download(templates, targetDir, targetFile, (error: string) => {
            load.stop();
            if(error){
                FaaSPrinter.printError(error);
            }
        })
    }

    static async unzip(zipFile: string, targetFile: string){
        const resolve = require('path').resolve
        const resolvedTargetPath = resolve(targetFile);
        await extract(zipFile, { dir: resolvedTargetPath })
    }

    static async downloadAndUnzipTemplates(){
        if(fs.existsSync('function-templates')){
            return;
        }
        await ResourceDownloader.downloadTemplatesZip('function-templates', 'gfaas-templates.zip')
        await ResourceDownloader.unzip('function-templates/gfaas-templates.zip', 'function-templates/gfaas-templates')
    }

}
