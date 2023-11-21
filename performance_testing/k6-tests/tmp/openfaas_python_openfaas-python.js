import http from "k6/http";
import { check } from 'k6';

export const options = {
    vus: 1,
    insecureSkipTLSVerify: true,
    duration: '5s'
};

const params = {
  headers: {
    'X-Nuclio-Function-Name': 'openfaas-python',
  },
};

const url = "https://10.195.8.172.sslip.io:31333/function/openfaas-python.openfaas-fn"

export default function () {
    const response = http.get(url, params);
    check(response, {
        'is status 200': (r) => r.status === 200,
    });
        // check(response, {
        // 'is status 200': (r) => r.body === "Hello World!",
    // });
}
