# Step 1: Build the React app
FROM node:22-slim as build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
