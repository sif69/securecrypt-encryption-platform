# SecureCrypt - File & Text Encryption Platform

A web-based encryption/decryption platform that uses a C++ multiprocessing engine with custom encryption keys.

## Features

- **Text & File Encryption**: Encrypt messages or files with custom numeric keys
- **Custom Keys**: Users provide their own encryption keys for secure sharing
- **Modern UI**: Clean, responsive interface with drag-and-drop support
- **C++ Engine**: Powered by a C++ multiprocessing encryption engine
- **Secure**: Fixed command injection vulnerabilities, uses safe `execFile` API

## Tech Stack

- **Frontend**: HTML5, Bootstrap 5, JavaScript
- **Backend**: Node.js, Express.js
- **Encryption**: C++ (Caesar cipher with modulo 256)
- **Deployment**: Vercel-ready

## Local Development

### Prerequisites
- Node.js 18+ 
- G++ compiler with C++17 support (for C++ binary)

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <repo-name>
```

2. Install dependencies:
```bash
npm install
```

3. Compile the C++ encryption binary:
```bash
cd cpp-backend
g++ -std=c++17 -o web_cryption web_cryption.cpp
cd ..
```

4. Start the development server:
```bash
npm start
```

5. Open http://localhost:5000 in your browser

## Deployment on Vercel

### Option 1: Quick Deploy (Recommended)

1. Push your code to a GitHub repository
2. Visit [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Vercel will auto-detect settings from `vercel.json`
6. Click "Deploy"

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel
```

**Note**: You'll need to compile the C++ binary before deploying. The `package.json` includes a build script that handles this automatically.

## How It Works

1. User enters text or uploads a file
2. User provides a custom encryption key (numeric)
3. Backend saves data to temporary file
4. C++ binary encrypts/decrypts using the key
5. Result is returned to user
6. Temporary files are cleaned up

## Project Structure

```
.
├── cpp-backend/           # C++ encryption engine
│   ├── web_cryption.cpp  # Encryption binary source
│   └── web_cryption      # Compiled binary
├── server/               # Node.js backend
│   └── index.js          # Express API server
├── public/               # Frontend static files
│   ├── index.html        # Main UI
│   ├── style.css         # Styles
│   └── app.js            # Client-side JavaScript
├── uploads/              # Temporary uploads
├── temp/                 # Temporary processing
├── package.json          # Node.js dependencies
└── vercel.json           # Vercel configuration
```

## API Endpoints

- `POST /api/encrypt-text` - Encrypt text message
- `POST /api/decrypt-text` - Decrypt text message  
- `POST /api/encrypt-file` - Encrypt uploaded file
- `POST /api/decrypt-file` - Decrypt uploaded file
- `GET /health` - Health check

## Security

- Uses `execFile` instead of `exec` to prevent command injection
- Arguments passed as arrays, not string interpolation
- Temporary files automatically cleaned after processing
- Input validation on all endpoints

## License

MIT License

## Author

Created as a portfolio project demonstrating full-stack development and C++ integration.
