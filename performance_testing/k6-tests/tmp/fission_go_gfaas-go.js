import http from "k6/http";
import { check } from 'k6';

export const options = {
    vus: 1,
    insecureSkipTLSVerify: true,
    duration: '5s'
};

const params = {
  headers: {
    'X-Nuclio-Function-Name': 'gfaas-go',
  },
};

const url = "https://10.195.7.135.sslip.io:32748/gfaas-go"

export default function () {
    const response = http.get(url, params);
    check(response, {
        'is status 200': (r) => r.status === 200,
    });
        // check(response, {
        // 'is status 200': (r) => r.body === "Hello World!",
    // });
}
