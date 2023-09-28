FROM node:19-alpine3.16

# create root application folder
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# copy configs to /app folder
COPY ./package*.json ./

# copy source code to /usr/src/app folder
COPY ./index.js ./
COPY ./config/* ./config/

EXPOSE 8080

RUN yarn install

ENTRYPOINT [ "yarn" ]

CMD [ "run", "start" ]