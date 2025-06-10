FROM golang:1.24-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download
RUN go mod verify

COPY . .

RUN go build -o /refuel-app .

EXPOSE 8080

CMD ["/refuel-app"]