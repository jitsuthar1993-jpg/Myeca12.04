FROM node:22.16.0-bookworm-slim AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build

COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:22.16.0-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000

COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

COPY --from=build /app/api ./api
COPY --from=build /app/client ./client
COPY --from=build /app/dist ./dist
COPY --from=build /app/migrations ./migrations
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/vite.config.ts ./vite.config.ts

EXPOSE 5000
CMD ["./node_modules/.bin/tsx", "server/index.ts"]
