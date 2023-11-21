import {describe, expect, test} from '@jest/globals';
import {OpenFaasService} from "../faas_service/open_faas_service";
import {FaasPlatformService} from "../faas_service/faas_platforms_service";

describe('sum module', () => {
    test('adds 1 + 2 to equal 3', async () =>{

        let faasServiceConfiguration = FaasPlatformService.getPlatforms()[0];

        let openFaasService = new OpenFaasService(faasServiceConfiguration);
        let healthStatus = await openFaasService.health();
        expect(healthStatus).toBe(true);
    });
    test('Get functions', async () =>{

        let faasServiceConfiguration = FaasPlatformService.getPlatforms()[0];

        let openFaasService = new OpenFaasService(faasServiceConfiguration);
        let healtStatus = await openFaasService.getFunctions();
        // expect(healtStatus).toBe(true);
    });
});
