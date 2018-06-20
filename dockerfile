FROM node:latest
WORKDIR /app/processor
COPY . .

RUN npm install

CMD [ "npm","start" ]

EXPOSE 3000