FROM node:22-alpine3.21

LABEL org.opencontainers.image.authors="Bastien BYRA (GitHub)"
LABEL org.opencontainers.image.url="https://github.com/BastienBYRA/CPE-Mapper"
LABEL org.opencontainers.image.documentation="https://github.com/BastienBYRA/CPE-Mapper/blob/main/README.md"
LABEL org.opencontainers.image.source="https://github.com/BastienBYRA/CPE-Mapper"
LABEL org.opencontainers.image.version="0.1.0"
LABEL org.opencontainers.image.vendor="Bastien BYRA"
LABEL org.opencontainers.image.licenses="Apache-2.0"7
LABEL org.opencontainers.image.created=""
LABEL org.opencontainers.image.revision=""

WORKDIR /cpe-mapper

COPY package*.json .
RUN npm ci --omit=dev

COPY . .

ENTRYPOINT ["node", "src/cli.js"]
CMD ["help"]
