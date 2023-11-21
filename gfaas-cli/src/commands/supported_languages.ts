import {FaaSPrinter} from "../cli/printer";


export class SupportedLanguages {

    static supportedLanguages = ['go1.19', 'grpc-go1.19', 'python3.9', 'grpc-python3.9', 'node14', 'grpc-node14', 'java19', 'grpc-java19', 'cpp20']

    static isLanguageSupported(language: string): boolean{
        return SupportedLanguages.supportedLanguages.filter(l => l == language).length > 0
    }

    static getSupportedLanuagesAsString(): string{
        return this.supportedLanguages.join(', ')
    }

    static printLanguageNotSupported(language: string){
        FaaSPrinter.printError(`Language \'${language}\' is not supported. Choose one of the following: ${SupportedLanguages.getSupportedLanuagesAsString()}`)
    }

}
