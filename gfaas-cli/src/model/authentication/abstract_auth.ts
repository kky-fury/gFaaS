import {AuthenticationType} from "../../enums/authentication_type";

export abstract class AbstractAuth {

    authenticationType: AuthenticationType;

    protected constructor(authenticationType: AuthenticationType) {
        this.authenticationType = authenticationType;
    }

    abstract getAuthenticationHeader(): Record<string, string>;
    abstract getCredentials(): string;
    abstract getAuthenticationHeaderValue(): string;

    abstract printAuthenticationType(): string;

}


