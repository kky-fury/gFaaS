package com.example.helloworld;

import spark.Service;


public class HelloWorldApplication {


    public static void main(String args[]) {

        /*
        * Please Note:
        * Default port in SparkJava is 4567
        * We are using the environment variable PORT or default to 8080
        */

        Service service1 = Service.ignite().port(8082).threadPool(20);
        service1.get("/live", (q, a) -> "Ok");

        Service service2 = Service.ignite().port(8080).threadPool(10);
        service2.get("/__internal/health", (q, a) -> "Ok");
        service2.get("/", (req,res) -> "Hello World!");
    }
}
