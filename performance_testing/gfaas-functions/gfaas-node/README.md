# XFaaS Function Node 14


The function is located in <code>function.py</code>.

#### Requirements

You need to have [Docker](https://www.docker.com), otherwise the CLI will not work properly.

## About

The Function is based on [Express](https://expressjs.com) which is a minimalist web framework for NodeJs.

## Workflow

##### Build the Function locally and push it to the local docker repository

- <code>xfaas build function.yaml</code>

##### Push the Function to the configured remote repository which can be reached by the FaaS Platform

- <code>xfaas push function.yaml</code>

##### Deploy the Function to the given FaaS Platform

- <code>xfaas deploy function.yaml target_faas_platform</code>

## Run the function locally

- <code>node function.js</code> or execute <code>runFunction</code> in <code>package.json</code>.

## Run and build the function using docker

- <code>docker build -t xfaas-function-node14 .</code>
- <code>docker run --rm -p 8080:8080 xfaas-function-node14</code>


## Adapter

#### Adapt your project to XFaaS

1. Execute <code>xfaas adapt --lang node14</code> inside the root folder of your node project. The following files are created:
    - <code>./function.js</code>
    - <code>./README.md</code>
    - <code>./Dockerfile</code>
    - <code>./function.yaml</code>
2. Run <code>npm i xfaas-core-node14</code> to add <code>[xfaas-core-node14](https://www.npmjs.com/package/xfaas-core-node14)</code> to your dependencies. 
3. Add <code>"runFunction": "node function.js"</code> to <code>package.json:scripts</code>.
4. Open <code>function.yaml</code> and give your function a name. Also, enter a valid image me and registry, to which the function image should be pushed.
5. In <code>./function.js:call</code> you can put the code that should be executed on the function call. You can call some code from your existing project.
6. Follow the steps under **Workflow**
