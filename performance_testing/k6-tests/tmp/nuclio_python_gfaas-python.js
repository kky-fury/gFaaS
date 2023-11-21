import http from "k6/http";
import { check } from 'k6';

export const options = {
    vus: 1,
    insecureSkipTLSVerify: true,
    duration: '5s'
};

const params = {
  headers: {
    'X-Nuclio-Function-Name': 'gfaas-python',
  },
};

const url = "https://10.195.9.71.sslip.io:30747/gfaas-python"

export default function () {
    const response = http.get(url, params);
    check(response, {
        'is status 200': (r) => r.status === 200,
    });
        // check(response, {
        // 'is status 200': (r) => r.body === "Hello World!",
    // });
}
