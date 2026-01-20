FROM node:20 as base
WORKDIR /usr/src/app

# Copy package files first
COPY package.json package-lock.json* ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json

# Install dependencies
RUN npm install

# Rebuild native modules (bcrypt) to ensure they work correctly
RUN npm rebuild bcrypt --build-from-source || npm rebuild bcrypt

# Copy source files explicitly (avoiding conflicts with node_modules)
COPY tsconfig.base.json ./
COPY apps/server/tsconfig.json apps/server/
COPY apps/web/tsconfig.json apps/web/
COPY apps/web/vite.config.ts apps/web/
COPY apps/web/tailwind.config.js apps/web/
COPY apps/web/postcss.config.js apps/web/
COPY apps/web/index.html apps/web/
COPY apps/web/public apps/web/public
COPY apps/server/src apps/server/src
COPY apps/web/src apps/web/src
COPY uploads uploads

ENV NODE_ENV=production
RUN npm run build

FROM node:20
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/apps/server/dist ./apps/server/dist
COPY --from=base /usr/src/app/apps/server/package.json ./apps/server/package.json
COPY --from=base /usr/src/app/apps/web/dist ./apps/web/dist
COPY --from=base /usr/src/app/uploads ./uploads
# Rebuild bcrypt in final stage to ensure SELinux compatibility
RUN npm rebuild bcrypt --build-from-source || npm rebuild bcrypt
EXPOSE 1337
CMD ["node", "apps/server/dist/index.js"]

