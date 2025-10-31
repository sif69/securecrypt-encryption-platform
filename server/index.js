const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

// Detect if we're in a serverless/deployment environment
// Replit deployments use /var/task, and filesystem is read-only except /tmp
const isDeployment = process.env.REPLIT_DEPLOYMENT === '1' || 
                      process.cwd().startsWith('/var/task') ||
                      process.env.NODE_ENV === 'production';

// Define temporary directories that are writable
const tempDir = isDeployment ? '/tmp' : 'temp';
const uploadsDir = isDeployment ? '/tmp/uploads' : 'uploads';

// Ensure required directories exist
const requiredDirs = [tempDir, uploadsDir];
requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use(cors());
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Invalid JSON received:', e.message);
      console.error('Body:', buf.toString());
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

function executeEncryption(inputFile, outputFile, action, key) {
  return new Promise((resolve, reject) => {
    const binaryPath = path.join(__dirname, '..', 'cpp-backend', 'web_cryption');
    
    // Check if binary exists
    if (!fs.existsSync(binaryPath)) {
      const error = `C++ binary not found at: ${binaryPath}. Please ensure it's compiled.`;
      console.error(error);
      reject(new Error(error));
      return;
    }
    
    const args = [inputFile, outputFile, action, String(key)];
    console.log('Executing binary:', binaryPath, 'with args:', args);

    execFile(binaryPath, args, (error, stdout, stderr) => {
      if (error) {
        console.error('Encryption error:', error);
        console.error('stderr:', stderr);
        console.error('Binary path:', binaryPath);
        console.error('Args:', args);
        reject(new Error(stderr || error.message));
        return;
      }
      resolve(stdout);
    });
  });
}

app.post('/api/encrypt-text', async (req, res) => {
  try {
    const { text, key } = req.body;

    if (!text || key === undefined || key === null || key === '') {
      return res.status(400).json({ error: 'Text and encryption key are required' });
    }

    const inputFile = path.join(tempDir, `input-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.txt`);
    const outputFile = path.join(tempDir, `output-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.txt`);

    fs.writeFileSync(inputFile, text, 'utf8');

    await executeEncryption(inputFile, outputFile, 'encrypt', key);

    const encryptedData = fs.readFileSync(outputFile);
    const base64Encrypted = encryptedData.toString('base64');

    fs.unlinkSync(inputFile);
    fs.unlinkSync(outputFile);

    res.json({ 
      success: true, 
      encrypted: base64Encrypted,
      message: 'Text encrypted successfully'
    });

  } catch (error) {
    console.error('Error encrypting text:', error);
    res.status(500).json({ error: 'Failed to encrypt text: ' + error.message });
  }
});

app.post('/api/decrypt-text', async (req, res) => {
  try {
    const { encryptedText, key } = req.body;

    if (!encryptedText || key === undefined || key === null || key === '') {
      return res.status(400).json({ error: 'Encrypted text and decryption key are required' });
    }

    const inputFile = path.join(tempDir, `input-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.txt`);
    const outputFile = path.join(tempDir, `output-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.txt`);

    const encryptedBuffer = Buffer.from(encryptedText, 'base64');
    fs.writeFileSync(inputFile, encryptedBuffer);

    await executeEncryption(inputFile, outputFile, 'decrypt', key);

    const decryptedText = fs.readFileSync(outputFile, 'utf8');

    fs.unlinkSync(inputFile);
    fs.unlinkSync(outputFile);

    res.json({ 
      success: true, 
      decrypted: decryptedText,
      message: 'Text decrypted successfully'
    });

  } catch (error) {
    console.error('Error decrypting text:', error);
    res.status(500).json({ error: 'Failed to decrypt text: ' + error.message });
  }
});

app.post('/api/encrypt-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { key } = req.body;

    if (key === undefined || key === null || key === '') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Encryption key is required' });
    }

    const outputFile = path.join(tempDir, `encrypted-${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${req.file.originalname}`);

    await executeEncryption(req.file.path, outputFile, 'encrypt', key);

    const encryptedData = fs.readFileSync(outputFile);

    fs.unlinkSync(req.file.path);
    fs.unlinkSync(outputFile);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="encrypted-${req.file.originalname}"`,
      'Content-Length': encryptedData.length
    });

    res.send(encryptedData);

  } catch (error) {
    console.error('Error encrypting file:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to encrypt file: ' + error.message });
  }
});

app.post('/api/decrypt-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { key } = req.body;

    if (key === undefined || key === null || key === '') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Decryption key is required' });
    }

    const originalName = req.file.originalname.replace(/^encrypted-/, '');
    const outputFile = path.join(tempDir, `decrypted-${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${originalName}`);

    await executeEncryption(req.file.path, outputFile, 'decrypt', key);

    const decryptedData = fs.readFileSync(outputFile);

    fs.unlinkSync(req.file.path);
    fs.unlinkSync(outputFile);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="decrypted-${originalName}"`,
      'Content-Length': decryptedData.length
    });

    res.send(decryptedData);

  } catch (error) {
    console.error('Error decrypting file:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to decrypt file: ' + error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the application at http://0.0.0.0:${PORT}`);
  
  // Check if C++ binary exists
  const binaryPath = path.join(__dirname, '..', 'cpp-backend', 'web_cryption');
  if (fs.existsSync(binaryPath)) {
    console.log('✓ C++ encryption binary found at:', binaryPath);
  } else {
    console.error('✗ WARNING: C++ encryption binary NOT found at:', binaryPath);
    console.error('  Encryption/decryption will fail until binary is compiled.');
    console.error('  Run: cd cpp-backend && g++ -std=c++17 -o web_cryption web_cryption.cpp');
  }
});