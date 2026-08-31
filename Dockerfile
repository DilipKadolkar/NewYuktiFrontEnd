# ---- build ----------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
# npm ci, not npm install: installs exactly the lockfile, so a build is
# reproducible and a transitive dependency cannot drift between environments.
RUN npm ci

COPY . .
# INLINE_RUNTIME_CHUNK=false keeps CRA from inlining the webpack runtime into
# index.html. That is what lets nginx.conf use script-src 'self' with no
# 'unsafe-inline' - the single most valuable directive in the CSP.
ENV INLINE_RUNTIME_CHUNK=false
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# ---- serve ----------------------------------------------------------------
FROM nginx:1.27-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN rm -f /usr/share/nginx/html/*.map
EXPOSE 80 443
