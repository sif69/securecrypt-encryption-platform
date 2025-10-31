const API_URL = '';

function setupDropZone(dropZoneId, fileInputId, fileNameDisplayId) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(fileInputId);
    const fileNameDisplay = document.getElementById(fileNameDisplayId);

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            fileNameDisplay.textContent = `Selected: ${files[0].name}`;
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = `Selected: ${fileInput.files[0].name}`;
        }
    });
}

setupDropZone('encryptDropZone', 'encryptFileInput', 'encryptFileName');
setupDropZone('decryptDropZone', 'decryptFileInput', 'decryptFileName');

function showLoading(buttonElement) {
    buttonElement.disabled = true;
    buttonElement.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
}

function hideLoading(buttonElement, originalText) {
    buttonElement.disabled = false;
    buttonElement.innerHTML = originalText;
}

async function encryptText() {
    const text = document.getElementById('encryptTextInput').value;
    const key = document.getElementById('encryptTextKey').value;
    const resultDiv = document.getElementById('encryptTextResult');
    const button = event.target;
    const originalText = button.innerHTML;

    if (!text.trim()) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter some text to encrypt</div>';
        return;
    }

    if (!key || key.trim() === '') {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter an encryption key</div>';
        return;
    }

    showLoading(button);
    resultDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_URL}/api/encrypt-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, key })
        });

        const data = await response.json();

        if (data.success) {
            resultDiv.innerHTML = `
                <div class="result-box success">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <strong><i class="fas fa-check-circle"></i> Encrypted Message:</strong>
                        <button class="btn btn-sm btn-outline-success" onclick="copyToClipboard('${data.encrypted}')">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <div style="max-height: 200px; overflow-y: auto; word-break: break-all; font-family: monospace; font-size: 0.9em;">
                        ${data.encrypted}
                    </div>
                    <small class="text-muted d-block mt-2">Share this encrypted text and the key (${key}) with the receiver</small>
                </div>
            `;
        } else {
            throw new Error(data.error || 'Encryption failed');
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> ${error.message}</div>`;
    } finally {
        hideLoading(button, originalText);
    }
}

async function decryptText() {
    const encryptedText = document.getElementById('decryptTextInput').value;
    const key = document.getElementById('decryptTextKey').value;
    const resultDiv = document.getElementById('decryptTextResult');
    const button = event.target;
    const originalText = button.innerHTML;

    if (!encryptedText.trim()) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please paste the encrypted message</div>';
        return;
    }

    if (!key || key.trim() === '') {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter the decryption key</div>';
        return;
    }

    showLoading(button);
    resultDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_URL}/api/decrypt-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ encryptedText, key })
        });

        const data = await response.json();

        if (data.success) {
            resultDiv.innerHTML = `
                <div class="result-box success">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <strong><i class="fas fa-check-circle"></i> Decrypted Message:</strong>
                        <button class="btn btn-sm btn-outline-success" onclick="copyToClipboard(\`${data.decrypted.replace(/`/g, '\\`')}\`)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <div style="max-height: 200px; overflow-y: auto; white-space: pre-wrap;">
                        ${data.decrypted}
                    </div>
                </div>
            `;
        } else {
            throw new Error(data.error || 'Decryption failed');
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> ${error.message}</div>`;
    } finally {
        hideLoading(button, originalText);
    }
}

async function encryptFile() {
    const fileInput = document.getElementById('encryptFileInput');
    const key = document.getElementById('encryptFileKey').value;
    const resultDiv = document.getElementById('encryptFileResult');
    const button = event.target;
    const originalText = button.innerHTML;

    if (!fileInput.files || fileInput.files.length === 0) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please select a file to encrypt</div>';
        return;
    }

    if (!key || key.trim() === '') {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter an encryption key</div>';
        return;
    }

    showLoading(button);
    resultDiv.innerHTML = '';

    try {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('key', key);

        const response = await fetch(`${API_URL}/api/encrypt-file`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `encrypted-${fileInput.files[0].name}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            resultDiv.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i> File encrypted successfully! Download started.
                    <br><small class="text-muted">Share the encrypted file and the key (${key}) with the receiver</small>
                </div>
            `;
        } else {
            let errorMessage = 'File encryption failed';
            try {
                const data = await response.json();
                errorMessage = data.error || errorMessage;
            } catch (e) {
                const text = await response.text();
                errorMessage = text || `Server error (${response.status})`;
            }
            throw new Error(errorMessage);
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> ${error.message}</div>`;
    } finally {
        hideLoading(button, originalText);
    }
}

async function decryptFile() {
    const fileInput = document.getElementById('decryptFileInput');
    const key = document.getElementById('decryptFileKey').value;
    const resultDiv = document.getElementById('decryptFileResult');
    const button = event.target;
    const originalText = button.innerHTML;

    if (!fileInput.files || fileInput.files.length === 0) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please select an encrypted file</div>';
        return;
    }

    if (!key || key.trim() === '') {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter the decryption key</div>';
        return;
    }

    showLoading(button);
    resultDiv.innerHTML = '';

    try {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('key', key);

        const response = await fetch(`${API_URL}/api/decrypt-file`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const originalName = fileInput.files[0].name.replace(/^encrypted-/, '');
            a.download = `decrypted-${originalName}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            resultDiv.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i> File decrypted successfully! Download started.
                </div>
            `;
        } else {
            let errorMessage = 'File decryption failed';
            try {
                const data = await response.json();
                errorMessage = data.error || errorMessage;
            } catch (e) {
                const text = await response.text();
                errorMessage = text || `Server error (${response.status})`;
            }
            throw new Error(errorMessage);
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-circle"></i> ${error.message}</div>`;
    } finally {
        hideLoading(button, originalText);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.createElement('div');
        toast.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
        toast.style.zIndex = '9999';
        toast.innerHTML = '<i class="fas fa-check"></i> Copied to clipboard!';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }).catch(err => {
        alert('Failed to copy to clipboard');
    });
}
