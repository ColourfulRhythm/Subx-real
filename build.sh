#!/bin/bash

# Clean previous build
rm -rf dist
rm -rf node_modules

# Install dependencies
npm install

# Build the application
npm run build

echo "Build completed successfully!" 