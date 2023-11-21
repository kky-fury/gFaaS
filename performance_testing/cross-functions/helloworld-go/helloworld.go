package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func handler(w http.ResponseWriter, r *http.Request) {
	log.Print("helloworld: received a request")
	target := os.Getenv("TARGET")
	if target == "" {
		target = "World"
	}
	fmt.Fprintf(w, "Hello %s!\n", target)
}

func ready(w http.ResponseWriter, _ *http.Request) {
	_, err := fmt.Fprintf(w, "Ok")
	if err != nil {
		return
	}
}

func main() {
	log.Print("helloworld: starting server...")

	http.HandleFunc("/", handler)
	http.HandleFunc("/__internal/health", ready)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

		http.HandleFunc("/live", ready)
    	go func() {
    		err := http.ListenAndServe(":8082", nil)
    		if err != nil {
    			fmt.Printf("Could not start health server: %s\n", err)
    		}
    	}()

	log.Printf("helloworld: listening on port %s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), nil))
}

