# Use official Node.js image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package files first and install dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production  # ✅ Install only production dependencies

# Copy the entire backend folder
COPY . .

# Expose the port
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
