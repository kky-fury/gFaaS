# XFaaS Function


The function is located in <code>org.xfaas.function.Function</code>.

#### Requirements

You need to have [Docker](https://www.docker.com), otherwise the CLI will not work properly.

## About

This project contains everything to develop, run and deploy a function written in Java11.
The function is placed in org.xfaas.function.Function and can be extended with the business logic.
The function extends the XFunction class from the xfaas-core project, which provides interfaces, models and the underlying code to server the function.
Do not relocate the Function class, otherwise the build.gradle and the Dockerfile must be adjusted to guarantee proper build and execution.

## Workflow

##### Build the Function locally and push it to the local docker repository

```
xfaas build function.yaml
```

##### Push the Function to the configured remote repository which can be reached by the FaaS Platform

```
xfaas push function.yaml
```

##### Deploy the Function to the given FaaS Platform

```
xfaas deploy function.yaml target_faas_platform
```

## Run Function with Gradle

```
./gradlew runFunction
```

## Build the Function

```
./gradlew build
```

## Run Function from Jar

```
java -jar build/libs/function.jar --functionTarget=org.xfaas.function.Function
```

## Build and Run the Function in a Container
```
docker build . -t xfaas-java19-function
```
```
docker run -p 8080:8080 xfaas-java19-function
```

#### Adapt your project to XFaaS

1. Execute ```xfaas adapt --lang java19``` inside the root folder of your java project. The following files are created:
    - <code>./src/main/java/org/xfaas/function/Function.java</code>
    - <code>./libs/xfaas-core-0.0.1.jar</code>
    - <code>./README.md</code>
    - <code>./Dockerfile</code>
    - <code>./function.yaml</code>
2. Add dependency to your <code>build.gradle</code>
###### Note
The xfaas-core library is not published on any public repository. Therefore, the jar file must be included from local repository. 
<pre>
repositories {
    mavenCentral()
    flatDir {
        dirs("libs")
    }
}

dependencies {
    implementation name: 'xfaas-core-0.0.1'
}
</pre>

3. Add gradle task **runFunction** <code>build.gradle</code>
###### Note
- Your function must be located in <code>org.xfaas.function.Function</code>
<pre>
task runFunction(type: JavaExec){
    main = 'org.xfaas.core.runner.XRunner'
    classpath = files('libs/xfaas-core-0.0.1.jar')
    classpath = sourceSets.main.runtimeClasspath
    args = ['--functionTarget=org.xfaas.function.Function']
}
</pre>

4. Add proper build configurations to your <code>build.gradle</code>

###### Note
- The local <code>xfaas-core</code> library must be included
- The main class must be the <code>XRunner</code>
- The build output must be named <code>function.jar</code> 

<pre>
jar {
    from {
        configurations.runtimeClasspath.collect { it.isDirectory() ? it : zipTree(it) }
    }
    manifest {
        attributes(
                'Main-Class': 'org.xfaas.core.runner.XRunner'
        )
    }
    archiveFileName.set('function.jar')
}
</pre>

5. Open <code>function.yaml</code> and give your function a name. Also, enter a valid image me and registry, to which the function image should be pushed.
6. In <code>./org.xfaas.function.Function.java:call</code> you can put the code that should be executed on the function call. You can call some code from your existing project.
7. Follow the steps under **Workflow**

##### Extension for Spring projects

Use the <code>XFaaSSpringAdapter</code> to delegate the request to your Spring <code>@RestController</code> endpoint:

1. Go to the Function <code>org.xfaas.function.Function</code> and user the spring adapter to choose the proper endpoint.
The following example is delegating the request to the <code>getWorld</code> endpoint of the <code>HelloWorldController</code>.

###### Note
The spring <code>@RequestBody</code> and <code>@RequestParam</code> are created by the <code>invokeRestControllerFunction()</code> function of the spring adapter.
**Currently, other endpoint parameters are not provided.**

<pre>
package org.xfaas.function;


import org.xfaas.core.adapter.XFaasSpringAdapter;
import org.xfaas.core.model.XFunction;
import org.xfaas.core.model.XRequest;
import org.xfaas.core.model.XResponse;
import org.xfaas.spring.example.HelloController;
import org.xfaas.spring.example.XfaasSpringExampleApplication;

public class Function extends XFunction {

    @Override
    public XResponse call(XRequest xRequest) {
        return new XFaasSpringAdapter()
            .invokeRestControllerFunction(XfaasSpringExampleApplication.class,
                                          xRequest, 
                                          HelloController.class, 
                                          "getWorld");
    }
}
</pre>

<pre>
package org.xfaas.spring.example;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping
    public WorldDTO getWorld(@RequestBody WorldDTO worldDTO, @RequestParam String id){
        var result = new WorldDTO();
        result.world = "World: " + worldDTO.world + ", ID: " + id;
        return result;
    }
}
</pre>
