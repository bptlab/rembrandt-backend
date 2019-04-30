FROM node:alpine AS builder
WORKDIR /usr/src/rembrandt-backend
COPY . .
RUN npm install && \
    npm run build && \
    mkdir ./builder && \
    mv ./build ./builder/build && \
    mv ./tsconfig.json ./builder/tsconfig.json && \
    mv ./package.json ./builder/package.json

FROM node:alpine
WORKDIR /usr/src/rembrandt-backend
COPY --from=builder /usr/src/rembrandt-backend/builder .
RUN npm install --production
CMD npm run production
