###############################
# Etapa 1 — Build
###############################
FROM node:lts-alpine3.23 AS builder

# Instalar zona horaria Colombia + corepack/pnpm
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/Bogota /etc/localtime && \
    echo "America/Bogota" > /etc/timezone && \
    corepack enable

WORKDIR /app

# Copiar manifest y lock de pnpm
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias (incluye devDependencies)
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Variable para build
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}


# Build de producción (generará .next/standalone)
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build


###############################
# Etapa 2 — Producción
###############################
FROM node:lts-alpine3.23 AS runner

# Instalar tzdata (NO necesitamos corepack/pnpm en producción con standalone)
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/America/Bogota /etc/localtime && \
    echo "America/Bogota" > /etc/timezone

WORKDIR /app

ENV NODE_ENV=production

# Copiar el build standalone (ya incluye node_modules necesarios)
COPY --from=builder /app/.next/standalone ./
# Copiar archivos estáticos
COPY --from=builder /app/.next/static ./.next/static
# Copiar public (imágenes, etc)
COPY --from=builder /app/public ./public

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# El standalone genera un server.js que inicia la app
CMD ["node", "server.js"]