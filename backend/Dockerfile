FROM node:18-alpine
WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

COPY . .
EXPOSE 5000
CMD ["node", "src/index.js"]
