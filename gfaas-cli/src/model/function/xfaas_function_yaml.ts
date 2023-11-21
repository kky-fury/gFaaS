export class XFaasFunctionYaml{
    name: string;
    namespace: string;
    lang: string;
    image: string;
    deployRegistry: string;
    limits: FunctionResources;
    requests: FunctionResources;
    scale: Map<string, Scale>;
    isGrpc: boolean;

    constructor(name: string, lang: string, image: string,  deployRegistry: string, namespace: string, limits: FunctionResources, requests: FunctionResources, scale: Map<string, Scale>, isGrpc: boolean) {
        this.name = name;
        this.lang = lang;
        this.image = image;
        this.deployRegistry = deployRegistry;
        this.namespace = namespace;
        this.limits = limits;
        this.requests = requests;
        this.scale = scale;
        this.isGrpc = isGrpc;
    }

    /*
        Scale
     */
    getRegistryImageLocation(): string{
        return this.deployRegistry + '/' +this.image;
    }

    getKnativeScale(): Scale | undefined{
        return this.scale.get('knative');
    }

    getOpenFaasScale(): Scale | undefined{
        return this.scale.get('openfaas');
    }

    getFissionScale(): Scale | undefined{
        return this.scale.get('fission');
    }

    getNuclioScale(): Scale | undefined{
        return this.scale.get('nuclio');
    }

}

export class XFaasFunctionYamlNuclio{
    serviceType: string;

    constructor(serviceType: string) {
        this.serviceType = serviceType;
    }
}

export class FunctionResources{
    memory: string;
    cpu: string;

    constructor(memory: string, cpu: string) {
        this.memory = memory;
        this.cpu = cpu;
    }
}

export class Scale{
    scaleToZeroDuration: any;
    enableScaleToZero: string;
    min: number;
    max: number;
    target: number;

    constructor(scaleToZeroDuration: any, enableScaleToZero: string, min: number, max: number, target: number) {
        this.scaleToZeroDuration = scaleToZeroDuration;
        this.enableScaleToZero = enableScaleToZero;
        this.min = min;
        this.max = max;
        this.target = target;
    }
}
