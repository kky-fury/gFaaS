const Dockerode = require('dockerode');


export class ContainerService {


    static getDocker(){
        return new Dockerode({socketPath: '/var/run/docker.sock'});
    }

    static async isServiceReachable(): Promise<boolean>{
        const docker = ContainerService.getDocker();
        return (await docker.ping()).toString().toLowerCase() == 'ok';
    }

    static async buildFunction(archive: string, tag: string, onError: Function, onSuccess: Function): Promise<void>{
        const docker = ContainerService.getDocker();
        let imageStream: any;

        const onFinished = async (err: any, res: any) => {

            if(err){
                onError(err)
            }else if (!await ContainerService.imageExistsLocally(tag) || res[res.length -1].error){
                let errorStack = res.map((e: any) => e.stream || e.error).join('')
                onError(errorStack)
            }else{
                onSuccess(res)
            }
        }

        try {
            imageStream = await docker.buildImage(archive, {t: tag});
        }catch (e) {
            onFinished(e, null)
        }


        await new Promise(() => {
            try{
                docker.modem.followProgress(imageStream, onFinished);
            }catch (e) {
            }
        });
    }

    static async pushImage(image: string, onError: Function, onSuccess: Function, auth: any){
        const docker = ContainerService.getDocker();
        const img = docker.getImage(image);


        const onFinished = (err: any, res: any) => {
            if(err){
                onError(err)
            }else{
                onSuccess(res)
            }
        }

        let stream: any;

        try{
            stream = await img.push({ authconfig: auth });
        }catch (e) {
            onFinished(e, null)
        }

        await new Promise(() => {
            try{
                docker.modem.followProgress(stream, onFinished);
            }catch (e) {
            }
        });
    }

    static async auth(auth: any): Promise<boolean>{
        try{
            const docker = ContainerService.getDocker();
            let authRequest = await docker.checkAuth(auth);
            return authRequest.Status == 'Login Succeeded'
        }catch (e) {
            return false;
        }
    }

    static async imageExistsLocally(image: string): Promise<boolean>{
        try{
            const docker = ContainerService.getDocker();
            let img = await docker.getImage(image);
            await img.get()
            // Only reached if img.get() does not throw an exception
            return true;
        }catch (e) {
            return false;
        }
    }

}
