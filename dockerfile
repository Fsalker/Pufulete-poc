FROM node:latest
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 1338
CMD node main.js