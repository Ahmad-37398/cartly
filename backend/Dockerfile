FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm@11

<<<<<<< HEAD
RUN npm config set progress false && npm install --no-audit --no-fund --loglevel=error
=======
RUN npm config set progress false && \
    npm install --no-audit --no-fund --loglevel=error
>>>>>>> c983a14dfce57869ebd53bbd6838f886d21ca748

COPY . .

RUN npm run prisma:generate

EXPOSE 5000

CMD ["npm","start"]
