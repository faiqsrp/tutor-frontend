# Step 1: Build the Vite app
FROM node:22-slim as build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Step 2: Serve the app using a lightweight server
FROM node:22-slim

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Vite outputs to "dist", not "build"
COPY --from=build /usr/src/app/dist ./build

# Expose the desired port
EXPOSE 3001

# Serve the app from the "build" folder
CMD ["serve", "-s", "build", "-l", "3001"]
