FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS build
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
# postinstall (skipped above): the Fragments worker served from public/.
RUN node scripts/copy-fragments-worker.mjs
# NEXT_PUBLIC_* are inlined into the browser bundle at build time, so the image is
# built for one public origin. BACKEND_URL is only used if a page renders at build.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_CDN_URL
ARG BACKEND_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_CDN_URL=$NEXT_PUBLIC_CDN_URL \
    NEXT_PUBLIC_USE_MOCK_API=false \
    BACKEND_URL=$BACKEND_URL
RUN npm run build && npm prune --omit=dev

FROM base AS production
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build /app/package*.json /app/next.config.ts ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build --chown=node:node /app/.next ./.next
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/robots.txt').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node_modules/.bin/next", "start"]
