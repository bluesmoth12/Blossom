# Dockerfile

# Base image with Node
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Build frontend and backend
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
