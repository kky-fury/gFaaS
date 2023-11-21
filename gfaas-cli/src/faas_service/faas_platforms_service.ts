import {FaasPlatformConfiguration} from "../model/service_configuration/faas_service_configuration";
import {PlattformSettingsParser} from "../cli/platform_settings_parser";

export class FaasPlatformService{


    static getPlatforms(): FaasPlatformConfiguration[]{
        return PlattformSettingsParser.parsePlattformSettings();
    }

    static getPlatformById(uniqueId: string): FaasPlatformConfiguration | undefined{
        return this.getPlatforms().find(value => {
           return value.uniqueId == uniqueId;
        });
    }
}
