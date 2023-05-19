# Base image
FROM node:18-slim

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-deu

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# remove non used code
RUN npm prune --production 

# Start the server using the production build
CMD [ "node", "dist/main.js" ]