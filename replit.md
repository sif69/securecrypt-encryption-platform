# SecureCrypt - File & Text Encryption Platform

## Overview
A web-based file and text encryption/decryption platform that wraps a C++ multiprocessing encryption engine with a modern web interface. Users can encrypt and decrypt files or text messages using custom encryption keys.

## Project Architecture

### Backend (Node.js + Express)
- **Location**: `server/index.js`
- **Port**: 5000
- **Endpoints**:
  - `POST /api/encrypt-text` - Encrypts text messages
  - `POST /api/decrypt-text` - Decrypts encrypted text messages
  - `POST /api/encrypt-file` - Encrypts uploaded files
  - `POST /api/decrypt-file` - Decrypts encrypted files
  - `GET /health` - Health check endpoint

### Frontend (HTML/CSS/JavaScript)
- **Location**: `public/`
- **Features**:
  - Dual input modes: text and file upload
  - Drag-and-drop file upload
  - Custom encryption key input
  - Copy to clipboard functionality
  - Download encrypted/decrypted files
  - Responsive Bootstrap 5 UI

### C++ Encryption Engine
- **Location**: `cpp-backend/`
- **Binary**: `cpp-backend/web_cryption`
- **Algorithm**: Caesar cipher-like encryption with modulo 256
- **Usage**: `./web_cryption <input_file> <output_file> <encrypt|decrypt> <key>`

## Key Features
1. **Custom Encryption Keys**: Users provide their own numeric keys
2. **Text & File Support**: Encrypt/decrypt both text messages and files
3. **Secure Sharing**: Users can share encrypted data and keys separately
4. **Modern UI**: Clean, responsive interface with visual feedback
5. **C++ Multiprocessing**: Leverages the original C++ engine for encryption

## Dependencies
- **Node.js**: Runtime environment
- **Express**: Web server framework
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing
- **Bootstrap 5**: Frontend UI framework
- **Font Awesome**: Icons
- **C++ (Clang 14)**: Encryption engine compiler

## How It Works
1. User enters text or uploads a file
2. User provides a custom encryption key (any number)
3. Frontend sends data to Express backend
4. Backend saves data to temporary file
5. Backend executes C++ binary with custom key
6. C++ binary encrypts/decrypts the file
7. Backend returns result to frontend
8. User downloads encrypted file or copies encrypted text
9. Temporary files are automatically cleaned up

## Recent Changes
- 2025-10-31: Initial project setup
  - Cloned C++ encryption code from GitHub
  - Created web-friendly C++ binary accepting command-line keys
  - Built Express backend with file upload and text encryption endpoints
  - Designed modern frontend with Bootstrap 5
  - Configured workflow for production deployment

## File Structure
```
.
├── cpp-backend/           # C++ encryption engine
│   ├── src/              # Original C++ source code
│   ├── web_cryption.cpp  # Web-optimized encryption binary
│   └── web_cryption      # Compiled binary
├── server/               # Node.js backend
│   └── index.js          # Express server
├── public/               # Frontend files
│   ├── index.html        # Main UI
│   ├── style.css         # Custom styles
│   └── app.js            # Frontend logic
├── uploads/              # Temporary file uploads
├── temp/                 # Temporary processing files
└── package.json          # Node.js dependencies
```

## Deployment
- Platform: Replit
- Deployment Type: Autoscale (stateless web application)
- Public URL: Available after publishing
- Server binds to: 0.0.0.0:5000
