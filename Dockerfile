# Node.js 16 is used to remain consistent with the assignment environment.
FROM node:16-alpine

# Application directory inside the container.
WORKDIR /usr/src/app

# Copy dependency manifests first so Docker can cache dependency installation.
COPY package*.json ./

# Install only production dependencies.
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source.
COPY --chown=node:node app.js ./

# Do not run the web application as root.
USER node

# Express application listens on port 8080.
EXPOSE 8080

# Start the application.
CMD ["npm", "start"]
