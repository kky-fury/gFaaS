# XFaaS Function Go 1.19

The function is located in <code>function.go</code>.
#### Requirements

You need to have [Docker](https://www.docker.com), otherwise the CLI will not work properly.

## Workflow

##### Build the Function locally and push it to the local docker repository 
- <code>xfaas build function.yaml</code>

##### Push the Function to the configured remote repository which can be reached by the FaaS Platform

- <code>xfaas push function.yaml</code>

##### Deploy the Function to the given FaaS Platform

- <code>xfaas deploy function.yaml target_faas_platform</code>

## Run the function locally

- Set up the IDE to use <code>go 1.19</code> and <code>main.go</code> as entry.

## Run and build the function using docker

- <code>docker build -t xfaas-function-go1.19 .</code>
- <code>docker run --rm -p 8080:8080 xfaas-function-go1.19 -f</code>

## Adapter

#### Adapt your project to XFaaS

1. Execute <code>xfaas adapt --lang go1.19</code> inside the root folder of your go project. The following files are created:
   - <code>./function.go</code>
   - <code>./README.md</code>
   - <code>./Dockerfile</code>
   - <code>./function.yaml</code>
2. Execute <code>go get</code> to update the function dependencies. There should be a new entry in you <code>go.mod</code> and <code>go.sum</code> file.
3. Eventually delete your <code>main.go</code> as <code>function.go</code> contains a main function.
4. Open <code>function.yaml</code> and give your function a name. Also, enter a valid image me and registry, to which the function image should be pushed.
5. In <code>./function.go:Call</code> you can put the code that should be executed on the function call. You can call some code from your existing project.
6. Follow the steps under **Workflow**