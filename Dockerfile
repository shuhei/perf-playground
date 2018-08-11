FROM node:8.11.2-jessie

ADD . /opt/app/
WORKDIR /opt/app

EXPOSE 8080

ENV NODE_ENV production

ENTRYPOINT node --perf-basic-prof-only-functions index.js
# ENTRYPOINT node --perf-basic-prof index.js
