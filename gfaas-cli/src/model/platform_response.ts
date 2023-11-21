
export class PlatformResponse<T>{
    successful: boolean;
    response?: T;
    errorMessage?: string;

    constructor(successful: boolean, response?: T, errorMessage?: string) {
        this.successful = successful;
        this.response = response;
        this.errorMessage = errorMessage;
    }
}
