FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server.js ./
COPY .env.example ./
EXPOSE 3001
CMD ["npm","start"]
