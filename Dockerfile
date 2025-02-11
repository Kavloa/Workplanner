# Use Node.js image for building
FROM node:18 as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install  # Use the default npm version compatible with Node.js 18

COPY . ./
RUN npm run build

# Use Nginx to serve frontend
FROM nginx:latest

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
