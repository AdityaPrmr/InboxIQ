FROM node:20


WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install


RUN npm install --save-dev ts-node-dev


COPY . .


EXPOSE 4000


CMD ["npm", "run", "dev"]
