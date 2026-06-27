FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Create a writable temp directory for uploaded PDFs
RUN mkdir -p /tmp/pdf_storage

EXPOSE 3002

CMD ["node", "context1.js"]
