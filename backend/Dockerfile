FROM node:14.14.0-stretch

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production
COPY . .

EXPOSE 8080
CMD [ "node", "src/index.ts" ]