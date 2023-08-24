# Use a base image
FROM node:18

# Set the working directory inside the container
WORKDIR /

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Specify the command to run when the container starts
CMD ["node", "script/app.js"]
