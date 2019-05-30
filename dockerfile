FROM node:latest
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 1337
CMD node main.js