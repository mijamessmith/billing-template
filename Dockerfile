FROM node:22.5.1-alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./
COPY .babelrc ./

RUN npm i --silent

COPY ./src ./src
COPY openapi.json ./
COPY tsconfig.json ./

EXPOSE 3001

RUN npm run build
CMD npm run docker-start

#build command: docker-compose up --build