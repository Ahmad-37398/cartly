FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm@11

RUN npm install --no-audit --no-fund --loglevel=error

COPY . .

EXPOSE 3000

CMD ["npm","start"]