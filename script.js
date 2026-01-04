// Global variables
let currentQRCode = null;
let generatedQRCode = null;

// Initialize the application
function initApp() {
    // Set up event listeners
    document.getElementById('size').addEventListener('change', updateQRCode);
    document.getElementById('color').addEventListener('input', updateQRCode);
    
    // Show home section by default
    showSection('home');
    
    // Check for saved text
    const savedText = localStorage.getItem('qrText');
    if (savedText) {
        document.getElementById('text').value = savedText;
    }
    
    console.log('QRGen Pro initialized');
}

// Show specific section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.main-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionId}-section`).classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.style.background = 'transparent';
        link.style.color = '';
    });
    
    // Optional: Highlight active nav link
    const activeLink = Array.from(document.querySelectorAll('.nav-links a'))
        .find(link => link.textContent.includes(
            sectionId === 'home' ? 'Accueil' : 
            sectionId === 'about' ? 'À Propos' : 'Utilisation'
        ));
    
    if (activeLink) {
        activeLink.style.background = 'var(--accent-color)';
        activeLink.style.color = 'white';
    }
}

// Generate QR Code
function generateQRCode() {
    const textInput = document.getElementById('text');
    const text = textInput.value.trim();
    
    // Save text to localStorage
    localStorage.setItem('qrText', text);
    
    // Validate input
    if (!text) {
        showNotification('Veuillez entrer un texte ou une URL', 'error');
        return;
    }
    
    // Clear previous QR code
    const qrcodeDiv = document.getElementById('qrcode');
    qrcodeDiv.innerHTML = '';
    
    // Hide placeholder
    document.getElementById('qr-placeholder').style.display = 'none';
    
    // Show info
    const qrInfo = document.getElementById('qr-info');
    const qrContentInfo = document.getElementById('qr-content-info');
    
    // Determine content type
    let contentType = 'Texte';
    if (text.startsWith('http')) {
        contentType = 'URL';
    } else if (text.startsWith('mailto:')) {
        contentType = 'Email';
    } else if (text.startsWith('TEL:')) {
        contentType = 'Téléphone';
    }
    
    qrContentInfo.textContent = `${contentType}: ${text.length > 50 ? text.substring(0, 50) + '...' : text}`;
    qrInfo.style.display = 'block';
    
    // Get options
    const size = parseInt(document.getElementById('size').value);
    const color = document.getElementById('color').value;
    
    try {
        // Generate QR code
        currentQRCode = new QRCode(qrcodeDiv, {
            text: text,
            width: size,
            height: size,
            colorDark: color,
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Store the generated QR code
        generatedQRCode = qrcodeDiv.querySelector('canvas');
        
        // Show QR code
        qrcodeDiv.style.display = 'block';
        
        // Enable download button
        document.getElementById('download-btn').disabled = false;
        
        showNotification('QR Code généré avec succès!', 'success');
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        showNotification('Erreur lors de la génération du QR code', 'error');
    }
}

// Update existing QR code with new options
function updateQRCode() {
    if (currentQRCode && document.getElementById('text').value.trim()) {
        generateQRCode();
    }
}

// Download QR Code
function downloadQRCode() {
    if (!generatedQRCode) {
        showNotification('Veuillez générer un QR code d\'abord', 'error');
        return;
    }
    
    try {
        const link = document.createElement('a');
        link.download = `qrcode-${Date.now()}.png`;
        link.href = generatedQRCode.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('QR Code téléchargé avec succès!', 'success');
    } catch (error) {
        console.error('Error downloading QR code:', error);
        showNotification('Erreur lors du téléchargement', 'error');
    }
}

// Clear input field
function clearInput() {
    document.getElementById('text').value = '';
    document.getElementById('text').focus();
    
    // Clear QR code display
    document.getElementById('qrcode').innerHTML = '';
    document.getElementById('qrcode').style.display = 'none';
    document.getElementById('qr-info').style.display = 'none';
    document.getElementById('qr-placeholder').style.display = 'flex';
    
    // Disable download button
    document.getElementById('download-btn').disabled = true;
    
    currentQRCode = null;
    generatedQRCode = null;
}

// Set example text
function setExample(text) {
    document.getElementById('text').value = text;
    showNotification('Exemple chargé, cliquez sur "Générer"', 'info');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    
    // Set color based on type
    switch(type) {
        case 'success':
            notification.style.background = 'var(--success-color)';
            break;
        case 'error':
            notification.style.background = 'var(--danger-color)';
            break;
        case 'info':
            notification.style.background = 'var(--accent-color)';
            break;
    }
    
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to generate QR code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generateQRCode();
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
        clearInput();
    }
});