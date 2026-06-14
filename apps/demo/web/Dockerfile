# Build context: monorepo root (../../)
# This lets us resolve @a2ui/core from the workspace before the package is published to npm.
# Once published, replace "workspace:*" with "npm install @a2ui/core" and build standalone.

FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /repo

# Copy workspace manifests so pnpm can resolve the workspace graph
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./

# Copy only the packages needed (core + this app)
COPY packages/core ./packages/core
COPY apps/demo/web ./apps/demo/web

# Install deps for both packages (core is a peer of the web app)
RUN pnpm install --filter=@a2ui/core --filter=a2ui-demo-web --frozen-lockfile

# Build @a2ui/core so dist/index.js has the latest renderer (vite run directly, no pnpm TTY)
WORKDIR /repo/packages/core
RUN node_modules/.bin/vite build

WORKDIR /repo/apps/demo/web
EXPOSE 6001
CMD ["pnpm", "dev", "--port", "6001", "--hostname", "0.0.0.0"]
