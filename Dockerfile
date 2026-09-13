# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copiar manifests de dependências
COPY package*.json ./
RUN npm ci

# Copiar arquivos do projeto e compilar
COPY . .
RUN npm run build

# Production stage com Nginx
FROM nginx:alpine

# Configuração de fallback para SPA (Single Page Application)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { \
        root /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copiar arquivos compilados da etapa de build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
