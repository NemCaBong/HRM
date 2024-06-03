FROM node:20-alpine3.16

WORKDIR /hrm-app

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY ./sql ./sql
COPY ecosystem.config.js .
COPY ./src ./src
RUN npm install pm2 -g
RUN npm install
RUN npm run build 

EXPOSE 5000

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
