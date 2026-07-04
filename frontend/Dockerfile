FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies, bypassing peer conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .

# Expose Expo web port
EXPOSE 8081

# Start the Expo web server
CMD ["npm", "run", "web"]
