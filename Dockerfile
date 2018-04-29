FROM node:8.9

RUN mkdir -p /usr/home/app
WORKDIR /usr/home/app
COPY package.json /usr/home/app
COPY yarn.lock /usr/home/app
RUN yarn install
COPY ./src /usr/home/app/src

EXPOSE 3000
EXPOSE 9229
