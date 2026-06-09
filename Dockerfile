# ----------- Stage 1: Builder -----------
FROM node:18-alpine AS builder
RUN npm install -g pnpm@10.34.1
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ----------- Stage 2: Production -----------
FROM node:18-alpine
RUN addgroup -g 1001 -S wikiuser && adduser -u 1001 -S wikiuser -G wikiuser
WORKDIR /app
RUN chown -R wikiuser:wikiuser /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/templates ./templates
COPY --from=builder /app/skills ./skills

EXPOSE 3141
USER wikiuser

# 🔥 关键修改：使用 ENTRYPOINT，默认参数使用 CMD
ENTRYPOINT ["node", "dist/index.js"]
CMD ["serve"]
