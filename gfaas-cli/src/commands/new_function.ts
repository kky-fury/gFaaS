import {SupportedLanguages} from "./supported_languages";
import {Adapter} from "./adapter";
import {ResourceDownloader} from "./resource_downloader";

export class NewFunction {

    static async createNewFunction(language: string, folderName: string){

        if(!SupportedLanguages.isLanguageSupported(language)){
            SupportedLanguages.printLanguageNotSupported(language)
            return;
        }

        await ResourceDownloader.downloadAndUnzipTemplates()

        const functionPath = 'function-templates/gfaas-templates/gfaas-templates-main/function-' + language

        await Adapter.copyFile(functionPath,
            folderName,
            `Created new Function in ./${folderName} for language ${language}`,
            'Could not create new Function')

    }

}
