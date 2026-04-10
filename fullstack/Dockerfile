# Stage 1: Build the React frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY ../pwa/package.json ../pwa/package-lock.json ./
RUN npm install
COPY ../pwa/ .
RUN npm run build

# Stage 2: Build the Go binary
FROM golang:1.25-alpine AS go-build
WORKDIR /app
COPY go.mod ./
COPY backend/ backend/
COPY main.go ./
COPY --from=frontend-build /app/frontend/dist frontend/dist/
RUN CGO_ENABLED=0 go build -o weakness-calculator .

# Stage 3: Final minimal image
FROM alpine:3.21
WORKDIR /app
COPY --from=go-build /app/weakness-calculator .
EXPOSE 8080
CMD ["./weakness-calculator"]
