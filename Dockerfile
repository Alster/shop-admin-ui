# Base node image:
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Installing dev dependencies:
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,sharing=locked,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
ENV NODE_ENV production
COPY . .
RUN pnpm run build:prod

# Setting up the runner:
FROM base AS runner
WORKDIR /app
COPY ./server ./
RUN --mount=type=cache,sharing=locked,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=builder /app/dist/shop-admin-ui ./
EXPOSE 4200
CMD ["node", "server.js"]

#FROM base AS runner
#WORKDIR /app
#RUN pnpm install -g http-server
#COPY --from=builder /app/dist/shop-admin-ui ./
#EXPOSE 4200
#CMD ["http-server", "-p", "4200"]


#FROM base AS runner
#ENV NODE_ENV production
#WORKDIR /app
#COPY package.json pnpm-lock.yaml ./
#RUN --mount=type=cache,sharing=locked,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
#COPY --from=builder /app/dist ./
#CMD ["pnpm", "run", "start:prod"]
