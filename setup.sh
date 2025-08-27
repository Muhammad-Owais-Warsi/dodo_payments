#!/bin/bash

# Exit on any error
set -e

echo "Starting project setup..."

# 1️⃣ Go to client folder and install dependencies
if [ -d "client" ]; then
  echo "Installing client dependencies..."
  cd client
  bun install
  cd ..
else
  echo "Client folder not found!"
fi

# 2️⃣ Go to server folder and install dependencies
if [ -d "server" ]; then
  echo "Installing server dependencies..."
  cd server
  bun install

  # 3️⃣ Copy .env.example to .env if it doesn't exist
  if [ -f ".env.example" ]; then
    if [ ! -f ".env" ]; then
      echo "Creating .env file from .env.example..."
      cp .env.example .env
    else
      echo ".env already exists, skipping copy."
    fi
  else
    echo ".env.example not found in server folder!"
  fi

  cd ..
else
  echo "Server folder not found!"
fi

echo "Project setup complete!"
