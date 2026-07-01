# Build context: monorepo root (../../)
# Resolves @a2ra/core from the workspace before the package is published to npm.

FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /repo

# Copy workspace manifests so pnpm can resolve the workspace graph
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./

# Copy only the packages needed (core + this app)
COPY packages/core ./packages/core
COPY apps/dev-survey ./apps/dev-survey

# Install deps for both packages
RUN pnpm install --filter=@a2ra/core --filter=a2ui-dev-survey --frozen-lockfile

# Build @a2ra/core so dist/index.js has the latest renderer
WORKDIR /repo/packages/core
RUN pnpm build

WORKDIR /repo/apps/dev-survey
EXPOSE 3001
CMD ["pnpm", "exec", "next", "dev", "--port", "3001", "--hostname", "0.0.0.0"]
