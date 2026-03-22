FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server.js ./
COPY .env.example ./
EXPOSE 3002
CMD ["npm","start"]