import http from "k6/http";
import { check } from 'k6';

export const options = {
    vus: 1,
    insecureSkipTLSVerify: true,
    duration: '5s'
};

const params = {
  headers: {
    'X-Nuclio-Function-Name': 'cross-go',
  },
};

const url = "http://cross-go.default.10.195.9.114.sslip.io:30014"

export default function () {
    const response = http.get(url, params);
    check(response, {
        'is status 200': (r) => r.status === 200,
    });
        // check(response, {
        // 'is status 200': (r) => r.body === "Hello World!",
    // });
}
