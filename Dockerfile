FROM node:alpine
WORKDIR /usr/src/dmr
COPY package*.json ./
RUN npm install
RUN npm install pm2 -g
COPY . .
EXPOSE 80
#CMD [ "node", "index.js" ]
CMD ["pm2-runtime", "index.js"]
