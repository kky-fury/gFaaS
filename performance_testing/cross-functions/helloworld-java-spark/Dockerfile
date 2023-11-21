# Use the official maven/Java 8 image to create a build artifact.
# https://hub.docker.com/_/maven


# Supplies processor uhttpc, used for healthcheck
FROM nuclio/uhttpc:0.0.1-amd64 as uhttpc


FROM maven:3.5-jdk-8-alpine as builder

# Copy local code to the container image.
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Build a release artifact.
RUN mvn package -DskipTests

# Use the Official OpenJDK image for a lean production stage of our multi-stage build.
# https://hub.docker.com/_/openjdk
# https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds
FROM openjdk:8-jre-alpine

# Copy the jar to the production image from the builder stage.
COPY --from=builder /app/target/helloworld-0.0.1-SNAPSHOT-jar-with-dependencies.jar helloworld.jar
COPY --from=uhttpc /home/nuclio/bin/uhttpc /usr/local/bin/uhttpc

HEALTHCHECK --interval=1s --timeout=3s CMD /usr/local/bin/uhttpc --url http://127.0.0.1:8082/ready || exit 1

ENV PORT 8080

EXPOSE 8080

CMD [ "processor" ]
# Run the web service on container startup.
CMD ["java","-jar","helloworld.jar"]

