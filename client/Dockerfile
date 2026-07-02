FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["npx", "serve", "-s", "dist", "-l", "80"]