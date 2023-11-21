import {
    FunctionResources, Scale,
    XFaasFunctionYaml,
} from "../model/function/xfaas_function_yaml";
import fs from "fs";
import YAML from "yaml";


export class FunctionParser {


    static parseFuncfionConfig(configFile: string){
        // TODO: check the yaml file for valid input types
        let xfaasFunctionYaml: XFaasFunctionYaml;

        try {
            const file = fs.readFileSync(configFile, 'utf8')
            let parsedYaml = YAML.parse(file)

            // Validate yaml file
            if(!parsedYaml.name){
                console.log('Attribute name is missing');
                return;
            }
            if(!parsedYaml.lang){
                console.log('Attribute lang is missing');
                return;
            }
            // if(!parsedYaml.handler){
            //     console.log('Attribute handler is missing');
            //     return;
            // }
            if(!parsedYaml.image){
                console.log('Attribute image is missing');
                return;
            }

            if(!parsedYaml.deployRegistry){
                console.log('Attribute deployRegistry is missing');
                return;
            }

            if(!parsedYaml.namespace){
                console.log('Attribute namespace is missing');
                return;
            }


            const limits = this.processLimits(parsedYaml);
            const requests = this.processRequests(parsedYaml);

            let scale = this.processScale(parsedYaml);

            xfaasFunctionYaml = new XFaasFunctionYaml(
                parsedYaml.name,
                parsedYaml.lang,
                parsedYaml.image,
                parsedYaml.deployRegistry,
                parsedYaml?.namespace ?? 'default',
                limits,
                requests,
                scale,
                parsedYaml.is_grpc ?? false
            );

            return xfaasFunctionYaml;

        } catch (e) {
            console.log('Could not read file ' + configFile);
            return;
        }
    }

    static processRequests(parsedYaml: any): FunctionResources{
        return new FunctionResources(
            parsedYaml?.requests?.memory ?? '128M',
            parsedYaml?.requests?.cpu ?? '100m'
        );
    }

    static processLimits(parsedYaml: any): FunctionResources{
        return new FunctionResources(
            parsedYaml?.limits?.memory ?? '128M',
            parsedYaml?.limits?.cpu ?? '100m'
        );
    }

    static processScale(parsedYaml: any): Map<string, Scale>{
        let scale = new Map<string, Scale>()

        if(parsedYaml.scale.knative){
            scale.set(
                'knative',
                new Scale(
                    parsedYaml.scale.knative.scaleToZeroDuration,
                    parsedYaml.scale.knative.enableScaleToZero,
                    parsedYaml.scale.knative.min,
                    parsedYaml.scale.knative.max,
                    parsedYaml.scale.knative.target,
                )
            );
        }
        if(parsedYaml.scale.openfaas){
            scale.set(
                'openfaas',
                new Scale(
                    parsedYaml.scale.openfaas.scaleToZeroDuration,
                    parsedYaml.scale.openfaas.enableScaleToZero,
                    parsedYaml.scale.openfaas.min,
                    parsedYaml.scale.openfaas.max,
                    parsedYaml.scale.openfaas.target,
                )
            );
        }
        if(parsedYaml.scale.fission){
            scale.set(
                'fission',
                new Scale(
                    parsedYaml.scale.fission.scaleToZeroDuration,
                    parsedYaml.scale.fission.enableScaleToZero,
                    parsedYaml.scale.fission.min,
                    parsedYaml.scale.fission.max,
                    parsedYaml.scale.fission.target,
                )
            );
        }
        if(parsedYaml.scale.nuclio){
            scale.set(
                'nuclio',
                new Scale(
                    parsedYaml.scale.nuclio.scaleToZeroDuration,
                    parsedYaml.scale.nuclio.enableScaleToZero,
                    parsedYaml.scale.nuclio.min,
                    parsedYaml.scale.nuclio.max,
                    parsedYaml.scale.nuclio.target,
                )
            );
        }
        return scale;
    }

}
