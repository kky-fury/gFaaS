import {AbstractAuth} from "./abstract_auth";
import {AuthenticationType} from "../../enums/authentication_type";

export class BearerAuth extends AbstractAuth{
    token: string;

    constructor(token: string) {
        super(AuthenticationType.bearerAuth);
        this.token = token;
    }

    getAuthenticationHeader(): Record<string, string> {
        return {'Authorization' : this.getAuthenticationHeaderValue()};
    }

    getAuthenticationHeaderValue(): string{
        return 'Bearer ' + this.token;
    }

    getCredentials(): string {
        return this.token;
    }

    printAuthenticationType(): string {
        // do not print the complete token
        let print = '';
        if(this.token && this.token.length >= 15){
            print += this.token.substring(0, 15)
        }
        return print + '...';
    }
}
