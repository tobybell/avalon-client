# Build environment.
FROM node:12.16-alpine as builder
WORKDIR /app

ARG server_host

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .
ENV REACT_APP_SERVER_HOST="$server_host"
RUN npm run build

# Production environment.
FROM node:12.16-alpine
WORKDIR /app
COPY --from=builder /app/build .
RUN npm install -g serve
CMD ["serve", "-l", "80", "-s", "."]
