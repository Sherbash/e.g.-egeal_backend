# Use Node.js base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the application
COPY . .

# Build TypeScript files
RUN npm run build

# Expose the port your app runs on
EXPOSE 5300

# Start the app
CMD ["node", "dist/server.js"]
