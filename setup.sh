#!/bin/bash

echo "========================================"
echo "MERN E-Commerce Setup Script"
echo "========================================"
echo

echo "Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "Error installing server dependencies!"
    exit 1
fi

echo
echo "Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "Error installing client dependencies!"
    exit 1
fi

echo
echo "Setup completed successfully!"
echo
echo "Next steps:"
echo "1. Copy server/.env.example to server/.env and configure your environment variables"
echo "2. Make sure MongoDB is running"
echo "3. Run 'npm run seed' in the server directory to populate sample data"
echo "4. Run 'npm run dev:full' in the server directory to start both servers"
echo
echo "Demo credentials:"
echo "Admin: admin@example.com / admin123"
echo "User: user@example.com / user123"
echo