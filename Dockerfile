# Etapa base
FROM node:lts-alpine3.18 AS base

WORKDIR /usr/src/app

# Definindo variáveis de ambiente
ENV NODE_ENV=production PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Instalando dependências necessárias
RUN apk update && \
    apk add --no-cache \
    vips-dev \
    fftw-dev \
    gcc \
    g++ \
    make \
    libc6-compat \
    chromium \
    nss \
    && rm -rf /var/cache/apk/*

# Copiando os arquivos package.json e package-lock.json
COPY package*.json ./

# Instalando dependências de produção
RUN npm install --production && \
    npm install sharp --ignore-scripts && \
    npm cache clean --force

# Copiando o restante do código da aplicação
COPY . .

# Expondo a porta que sua aplicação utiliza (se aplicável)
# EXPOSE 3000

# Comando de inicialização da aplicação
CMD ["npm", "start"]
