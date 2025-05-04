FROM node:18-alpine

WORKDIR /app

# Copiamos solo los archivos de configuración primero
COPY package.json package-lock.json .npmrc ./

# Instalamos dependencias con --legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copiamos todo el código fuente
COPY . .

# Limpiamos la caché y node_modules para forzar una reconstrucción limpia
RUN rm -rf node_modules/.vite

EXPOSE 5173

# Corremos la aplicación
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 