# Railway Deployment
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

# Serve the built app
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]