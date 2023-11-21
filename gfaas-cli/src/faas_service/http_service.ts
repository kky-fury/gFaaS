import {PlatformResponse} from "../model/platform_response";
import axios from "axios";
import {FaasService} from "./faas_service";
import * as https from "https";

export class HttpService{

    authHeader: any;
    url: string;
    private timeout = 10000;
    rejectUnauthorized;

    constructor(authHeader: any, url: string, rejectUnauthorized = true) {
        this.authHeader = authHeader;
        this.url = url;
        this.rejectUnauthorized = rejectUnauthorized;
    }

    /*
            Basic HTTP functions
     */
    async get<T>(path: string, headers? : Record<string, string>, body?: any): Promise<PlatformResponse<T>>{


        const httpsAgent = new https.Agent({
            rejectUnauthorized: this.rejectUnauthorized,
        })


        const h = {
            ... this.authHeader,
            ... headers
        }

            return await axios.get(this.url + path,{
                httpsAgent: httpsAgent,
                data: body,
                headers: h,
                timeout: this.timeout
            }).then(
                function (response) {
                    return new PlatformResponse<T>(true, response.data);
                }
            ).catch(function (error) {
                return FaasService.handleError(error);
            });
    }

    async delete<T>(path: string, body: string): Promise<PlatformResponse<T>>{

            const httpsAgent = new https.Agent({
                rejectUnauthorized: this.rejectUnauthorized,
            })

            return  await axios.delete(this.url + path,{
                httpsAgent: httpsAgent,
                headers:  this.authHeader,
                timeout: this.timeout,
                data: body
            }).then(
                function (response) {
                    return new PlatformResponse<T>(true, response.data);
                }
            ).catch(function (error) {
                return FaasService.handleError(error);
            });
    }

    async post<T>(path: string, body: string): Promise<PlatformResponse<T>>{

            const httpsAgent = new https.Agent({
                rejectUnauthorized: this.rejectUnauthorized,
            })

            return await axios.post(this.url + path, body, {
                httpsAgent: httpsAgent,
                headers:  this.authHeader,
                timeout: this.timeout,
            }).then(
                function (response) {
                    return new PlatformResponse<T>(true, response.data);
                }
            ).catch(function (error) {
                console.log(error)
                return FaasService.handleError(error);
            });
    }

    async patch<T>(path: string, body: string): Promise<PlatformResponse<T>>{

        const httpsAgent = new https.Agent({
            rejectUnauthorized: this.rejectUnauthorized,
        })

        return await axios.patch(this.url + path, body, {
            httpsAgent: httpsAgent,
            headers:  this.authHeader,
            timeout: this.timeout,
        }).then(
            function (response) {
                return new PlatformResponse<T>(true, response.data);
            }
        ).catch(function (error) {
            console.log(error)
            return FaasService.handleError(error);
        });
    }

    static handleError<T>(error: any): PlatformResponse<T>{
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return new PlatformResponse<T>(false, error.response.data.error, error.response.data.error);
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            return new PlatformResponse<T>(false, error.request, error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            return new PlatformResponse<T>(false, error.message,error.message);
        }
    }
}
