# Use a base image with Node + Python + build tools
FROM node:18-bullseye

# Install Python dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv python3-dev build-essential \
    curl git wget rustc cargo

# Set working dir
WORKDIR /app

COPY package*.json ./
RUN npm install 

# Copy backend code
COPY . .

# Install Python packages
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

# Install Node packages
# RUN npm install

EXPOSE 8080
# Start your server
CMD ["npm", "start"]
