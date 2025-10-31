
/**
 * Pure Node.js implementation of the encryption algorithm
 * Replaces the C++ binary for serverless compatibility
 */

const fs = require('fs');

/**
 * Encrypt or decrypt a file using Caesar cipher with modulo 256
 * @param {string} inputFile - Path to input file
 * @param {string} outputFile - Path to output file
 * @param {string} action - 'encrypt' or 'decrypt'
 * @param {number} key - Encryption key (will be converted to 0-255)
 * @returns {Promise<string>} - Success message
 */
function processFile(inputFile, outputFile, action, key) {
  return new Promise((resolve, reject) => {
    try {
      // Validate action
      if (action !== 'encrypt' && action !== 'decrypt') {
        throw new Error("Invalid action. Use 'encrypt' or 'decrypt'");
      }

      // Parse and normalize key to 0-255 range
      let normalizedKey = parseInt(key, 10);
      if (isNaN(normalizedKey)) {
        throw new Error(`Invalid encryption key (not a number): ${key}`);
      }
      normalizedKey = normalizedKey % 256;
      if (normalizedKey < 0) normalizedKey += 256;

      // Read input file
      if (!fs.existsSync(inputFile)) {
        throw new Error(`Failed to open input file: ${inputFile}`);
      }
      const inputBuffer = fs.readFileSync(inputFile);

      // Process each byte
      const outputBuffer = Buffer.alloc(inputBuffer.length);
      for (let i = 0; i < inputBuffer.length; i++) {
        if (action === 'encrypt') {
          outputBuffer[i] = (inputBuffer[i] + normalizedKey) % 256;
        } else {
          outputBuffer[i] = (inputBuffer[i] - normalizedKey + 256) % 256;
        }
      }

      // Write output file
      fs.writeFileSync(outputFile, outputBuffer);

      resolve('Operation completed successfully');
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { processFile };
