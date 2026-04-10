FROM golang:1.20-alpine AS builder

WORKDIR /app

# Enable CGO for some drivers if needed, otherwise leave disabled
ENV CGO_ENABLED=0

COPY . .

# Initialize go.sum inside the container since we can't run it locally
RUN go mod tidy
RUN go build -o main .

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .

EXPOSE 8080
CMD ["./main"]
