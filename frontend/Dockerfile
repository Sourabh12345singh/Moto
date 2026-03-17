# Stage 1: Build the React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install

# Pass Cloudinary env vars at build time (Vite embeds VITE_* vars during build)
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_UPLOAD_PRESET
ENV VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME
ENV VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copy nginx config as a template (uses $BACKEND_URL variable)
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
# nginx:alpine image auto-processes /etc/nginx/templates/*.template with envsubst
# Set default backend URL for local Docker Compose usage
ENV BACKEND_URL=http://backend:8080
CMD ["nginx", "-g", "daemon off;"]
