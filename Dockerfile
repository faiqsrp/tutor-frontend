# Step 1: Build the React app
FROM node:22-slim as build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve the app using a lightweight server
FROM node:22-slim

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy build output from previous stage
COPY --from=build /usr/src/app/build ./build

# Expose the desired port
EXPOSE 3001

# Run the app
CMD ["serve", "-s", "build", "-l", "3001"]
