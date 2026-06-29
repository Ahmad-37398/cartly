FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm@11

RUN npm config set progress false && npm install --no-audit --no-fund --loglevel=error

COPY . .

EXPOSE 5173

CMD ["npm","run","dev","--","--host","0.0.0.0"]