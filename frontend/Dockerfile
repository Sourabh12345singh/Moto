# Stage 1: Build the React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install

# Pass env vars at build time (Vite embeds VITE_* vars during build)
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_UPLOAD_PRESET
ARG VITE_API_URL=https://motoshare-backend.onrender.com/api
ENV VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME
ENV VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copy nginx config (no envsubst needed — API calls go directly to backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
