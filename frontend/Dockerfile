# frontend/Dockerfile

# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source & build
COPY . .
# Pass API base at build time; CRA reads REACT_APP_* at build.
ARG REACT_APP_API_BASE=https://posterscoop-api.fly.dev
ENV REACT_APP_API_BASE=${REACT_APP_API_BASE}
RUN npm run build

# --- serve stage ---
FROM nginx:stable-alpine
# Custom nginx config for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
