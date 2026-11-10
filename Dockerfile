# Builds Pitchpad as a container. Render uses this when a service is set to Docker.
FROM node:22-slim

WORKDIR /app

# Install exactly the versions in package-lock.json
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the app files
COPY . .

ENV NODE_ENV=production
# Render tells the app which port to use through PORT (usually 10000)
EXPOSE 10000
CMD ["node", "server.js"]
