import {AbstractAuth} from "./abstract_auth";
import {AuthenticationType} from "../../enums/authentication_type";

export class NoAuth extends AbstractAuth{
    getAuthenticationHeaderValue(): string {
        return "";
    }

    constructor() {
        super(AuthenticationType.noAuth);
    }

    getAuthenticationHeader(): Record<string, string> {
        return {};
    }

    getCredentials(): string {
        return "";
    }

    printAuthenticationType(): string {
        return "No Authentication";
    }

}
