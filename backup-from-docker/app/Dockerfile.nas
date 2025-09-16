FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the frontend
RUN npm run build

# Set environment variables for Docker deployment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Use a simple start command
CMD ["node", "server.js"] 