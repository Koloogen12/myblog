# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time args for Vite envs
ARG VITE_SUPABASE_PROJECT_ID
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_URL
ARG VITE_MINIO_ENDPOINT
ARG VITE_MINIO_BUCKET

ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_MINIO_ENDPOINT=$VITE_MINIO_ENDPOINT
ENV VITE_MINIO_BUCKET=$VITE_MINIO_BUCKET

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run sends traffic to $PORT (default 8080)
ENV PORT=8080
EXPOSE 8080

# Use envsubst to inject PORT at runtime
CMD ["/bin/sh", "-c", "sed -i \"s/listen 8080;/listen ${PORT};/g\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
