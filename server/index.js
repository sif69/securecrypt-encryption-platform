const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

// Define a temporary directory that is writable
const tempDir = process.env.NODE_ENV === 'production' ? '/tmp' : 'temp';

// Ensure required directories exist
const requiredDirs = ['uploads', tempDir];
requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
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
    const args = [inputFile, outputFile, action, String(key)];

    execFile(binaryPath, args, (error, stdout, stderr) => {
      if (error) {
        console.error('Encryption error:', error);
        console.error('stderr:', stderr);
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
});