#Build stage

FROM gradle:8-jdk19 AS BUILD
WORKDIR /usr/app/
COPY . .
RUN gradle build

# Package stage

FROM openjdk:19-jdk-slim
ENV JAR_NAME=function.jar
ENV APP_HOME=/usr/app/
WORKDIR $APP_HOME
COPY --from=BUILD $APP_HOME .
EXPOSE 8080
ENTRYPOINT exec java -jar $APP_HOME/build/libs/$JAR_NAME --functionTarget=org.xfaas.function.Function
