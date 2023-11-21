import {FaasPlatformType} from "../../enums/faas_platform_type";

export class gFaasFunction {
    name: string;
    namespace: string;
    platformId: string;
    functionId: string;
    platformType: FaasPlatformType;
    createdAt: string;
    invocationCount: string;
    triggers: XFaasFunctionTriggers[];
    limits? : {cpu: string, memory: string};
    requests? : {cpu: string, memory: string};
    scale? : {min?: string, max? : string, target? : string, scaleToZeroDuration? : string};
    image: string;
    status: string;

    constructor(name: string,
                platformId: string,
                functionId: string,
                platformType: FaasPlatformType,
                createdAt: string,
                invocationCount: string = 'Unknown',
                triggers: XFaasFunctionTriggers[],
                namespace: string,
                image: string,
                status: string,
                limits?: {cpu: string, memory: string},
                requests?: {cpu: string, memory: string},
                scale? : {min?: string, max? : string, target? : string, scaleToZeroDuration? : string}) {
        this.name = name;
        this.platformId = platformId;
        this.functionId = functionId;
        this.platformType = platformType;
        this.createdAt = createdAt;
        this.invocationCount = invocationCount;
        this.triggers = triggers
        this.namespace = namespace;
        this.limits = limits;
        this.requests = requests;
        this.scale = scale;
        this.image = image;
        this.status = status;
    }

    getHttpTriggerUrl(): string{
        if(this.triggers.length == 0){
            return '';
        }else{
            const trigger = this.getHttpTrigger()
            if(!trigger){
                return ''
            }else{
                return trigger.url ?? '';
            }
        }
    }

    getHttpTrigger(){
        return this.triggers[0] ?? undefined;
    }

    getCurlFormattedUrl(): string{
        let url = this.getHttpTriggerUrl();
        const headers = this.getHttpTrigger()?.headers;
        if(headers){
            headers.forEach((value, key) => url += ` --header "${key}:${value}"`)
        }
        return url
    }

}

export class XFaasFunctionTriggers{
    kind: string;
    name: string;
    url?: string;
    maxWorkers?: number;
    serviceType?: string;
    headers: Map<string, string>

    constructor(kind: string, name: string, url: string, headers: Map<string, string> = new Map(), maxWorkers?: number, serviceType?: string) {
        this.kind = kind;
        this.name = name;
        this.url = url;
        this.maxWorkers = maxWorkers;
        this.serviceType = serviceType;
        this.headers = headers;
    }
}
