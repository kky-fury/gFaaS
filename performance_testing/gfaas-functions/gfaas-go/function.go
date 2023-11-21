package main

import (
	"fmt"
	gfaas_core_go "github.com/paul-wie/gfaas-templates/core-go1.19"
	"net/http"
)

// MyFunction implements the XFunction interface and can be passed to RunFunction
type MyFunction struct {
	gfaas_core_go.XFunction
}

func (f MyFunction) Call(w http.ResponseWriter, r *http.Request) {
	// Place here your custom code
	_, err := fmt.Fprintf(w, "Hello World!")
	if err != nil {
		return
	}
}

func RunFunction() {
	gfaas_core_go.RunFunction(MyFunction{})
}

func main() {
	RunFunction()
}
