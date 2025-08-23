# EcoRide - Node.js app
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer cache)
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the rest
COPY . .

EXPOSE 3000

# Default command (change to `npm run dev` during development if you prefer)
CMD ["npm","start"]
