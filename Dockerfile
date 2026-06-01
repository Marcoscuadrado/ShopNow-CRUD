# Usamos una imagen oficial y ligera de Node.js
FROM node:20-alpine

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos solo los archivos de dependencias primero (aprovecha la caché de Docker)
COPY package.json package-lock.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código del proyecto
COPY . .

# Compilamos la aplicación de Next.js para producción
RUN npm run build

# Exponemos el puerto 3000
EXPOSE 3000

# Comando para encender el servidor en modo producción
CMD ["npm", "run", "start"]