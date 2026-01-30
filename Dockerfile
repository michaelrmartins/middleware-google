# Dockerfile

# 1. QUAL A IMAGEM BASE?
# Diz ao Docker para começar com uma "fundação" que já tem o Node.js v18 instalado.
# A versão 'alpine' é super leve, o que é ótimo.
FROM node:24-alpine

# 2. QUAL SERÁ A PASTA DE TRABALHO DENTRO DO CONTÊINER?
# Cria e define o diretório /app como a pasta principal para todos os comandos seguintes.
WORKDIR /app

# 3. COPIAR OS ARQUIVOS DO PROJETO
# Copia o package.json e o package-lock.json da sua máquina para a pasta /app dentro do contêiner.
# Fazemos isso primeiro para aproveitar o cache do Docker. Se esses arquivos não mudarem, o Docker não
# precisa reinstalar todas as dependências toda vez, acelerando o build.
COPY package*.json ./

# 4. EXECUTAR UM COMANDO DURANTE A CONSTRUÇÃO
# Roda o comando 'npm install' DENTRO da imagem que está sendo criada.
# Isso vai baixar as dependências (express, googleapis) e criar a pasta node_modules dentro da imagem.
RUN npm install

# 5. COPIAR O RESTANTE DO CÓDIGO
# Agora, copia todos os outros arquivos (index.js, etc.) da sua máquina para a pasta /app na imagem.
COPY . .

# 6. "AVISAR" QUAL PORTA A APLICAÇÃO USA
# Isso é mais uma documentação. Informa ao Docker que a aplicação no contêiner
# vai usar a porta 3000. Não abre a porta para o mundo exterior, apenas informa.
EXPOSE 3000

# 7. QUAL O COMANDO PARA INICIAR A APLICAÇÃO?
# Este é o comando que será executado QUANDO o contêiner for iniciado com 'docker run'.
# Ele efetivamente inicia o seu servidor Express.
CMD ["node", "server.js"]