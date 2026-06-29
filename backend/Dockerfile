FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm@11
RUN npm config set progress false && npm install --no-audit --no-fund --loglevel=error --registry http://verdaccio:4873
COPY . .

RUN npm run prisma:generate

EXPOSE 5000

CMD ["npm","start"]