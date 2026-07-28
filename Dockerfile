FROM node:20 as base
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm install

RUN npm rebuild bcrypt --build-from-source || npm rebuild bcrypt

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
RUN npm rebuild bcrypt --build-from-source || npm rebuild bcrypt
EXPOSE 1337
CMD ["node", "apps/server/dist/index.js"]

