# Usa un'immagine Node.js ufficiale
FROM node:18-alpine

# Crea directory di lavoro
WORKDIR /usr/src/app

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il codice dell'app
COPY . .

# Esponi la porta (modifica se la tua app usa una porta diversa)
EXPOSE 3000

# Comando per avviare l'app in modalità sviluppo
CMD ["npm", "run", "dev"]
