
export class Namespaces{
    namespaces: Namespace[];

    constructor(namespaces: Namespace[] = []) {
        this.namespaces = namespaces;
    }


    getNamespaces(): Namespace[]{
        return this.namespaces;
    }

    getNamespacesAsStringList(): string[]{
        return this.namespaces.map(n => n.name);
    }

    containsNamespace(namespace: string): boolean{
        return (this.namespaces.map(n => n.name)?.find(n => n === namespace)?.length ?? 0) > 0;
    }

}

export class Namespace{

    name: string;
    platform: string;

    constructor(name: string, platform: string) {
        this.name = name;
        this.platform = platform;
    }

}
