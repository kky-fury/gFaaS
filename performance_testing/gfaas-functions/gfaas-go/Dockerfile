# https://docs.docker.com/language/golang/build-images/
FROM golang:1.19-alpine

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY *.go ./

RUN go build -o /docker-gs-ping

EXPOSE 8080
EXPOSE 8082

CMD [ "/docker-gs-ping" ]