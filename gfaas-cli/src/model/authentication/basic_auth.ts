import {AbstractAuth} from "./abstract_auth";
import {AuthenticationType} from "../../enums/authentication_type";

export class BasicAuth extends AbstractAuth{
    username: String;
    password: String;

    constructor(username: String, password: String) {
        super(AuthenticationType.basicAuth);
        this.username = username;
        this.password = password;
    }

    getAuthenticationHeader(): Record<string, string> {
        return {'Authorization' : this.getAuthenticationHeaderValue()};
    }

    getCredentials(): string {
        return this.username + ':'+ this.password;
    }

    getAuthenticationHeaderValue(): string {
        let buff = Buffer.from(this.getCredentials());
        let credentialsBase64 = buff.toString('base64');
        return 'Basic ' + credentialsBase64;
    }

    printAuthenticationType(): string {
        return this.getCredentials();
    }
}
