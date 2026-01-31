// --- 1. LOGJIKA E DARK MODE ---

function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('darkModeIcon');
    const isDark = body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark);

    if (icon) {
        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
            icon.style.color = "#ffca28";
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            icon.style.color = ""; 
        }
    }
}

// --- 2. LOGJIKA E NAVIGIMIT (DASHBOARD TOGGLE) ---

function showSection(sectionName) {
    const hero = document.getElementById('hero-section');
    const analytics = document.getElementById('analytics-section');
    const settings = document.getElementById('settings-section');
    const savedLinks = JSON.parse(localStorage.getItem('myShortLinks')) || [];

    if(hero) hero.style.display = 'none';
    if(analytics) analytics.style.display = 'none';
    if(settings) settings.style.display = 'none';

    if (sectionName === 'analytics' && analytics) {
        analytics.style.display = 'block';
        const countEl = document.getElementById('active-links-count');
        if(countEl) countEl.innerText = savedLinks.length;
    } else if (sectionName === 'settings' && settings) {
        settings.style.display = 'block';
        const nameDisplay = document.getElementById('logged-user-name');
        const emailDisplay = document.getElementById('logged-user-email');
        if(nameDisplay) document.getElementById('settingsName').value = nameDisplay.innerText;
        if(emailDisplay) document.getElementById('settingsEmail').value = emailDisplay.innerText;
    } else if(hero) {
        hero.style.display = 'block';
    }
}

// --- 3. LOGJIKA E IDENTIFIKIMIT (AUTH) ---

function setAuthMode(mode) {
    const title = document.getElementById('authTitle');
    const nameField = document.getElementById('nameField');
    const submitBtn = document.getElementById('authSubmitBtn');
    const footerText = document.getElementById('authFooterText');
    const regNameInput = document.getElementById('regName');

    if (mode === 'register') {
        if(title) title.innerText = 'Krijo një Llogari të Re';
        if(nameField) nameField.style.display = 'block';
        if(regNameInput) regNameInput.required = true;
        if(submitBtn) submitBtn.innerText = 'Krijo Llogarinë';
        if(footerText) footerText.innerHTML = 'Keni llogari? <a href="javascript:void(0)" onclick="setAuthMode(\'login\')" class="text-decoration-none">Hyr këtu</a>';
    } else {
        if(title) title.innerText = 'Hyr në Llogari';
        if(nameField) nameField.style.display = 'none';
        if(regNameInput) regNameInput.required = false;
        if(submitBtn) submitBtn.innerText = 'Vazhdo';
        if(footerText) footerText.innerHTML = 'Nuk keni llogari? <a href="javascript:void(0)" onclick="setAuthMode(\'register\')" class="text-decoration-none">Regjistrohu këtu</a>';
    }
}

function loginUserUI(name, email) {
    const guestZone = document.getElementById('guest-zone');
    const userZone = document.getElementById('user-zone');
    if(guestZone) guestZone.style.display = 'none';
    if(userZone) userZone.style.display = 'block';
    
    const nameEl = document.getElementById('logged-user-name');
    const emailEl = document.getElementById('logged-user-email');
    if(nameEl) nameEl.innerText = name;
    if(emailEl) emailEl.innerText = email;
    
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const initialsEl = document.getElementById('user-initials');
    if(initialsEl) initialsEl.innerText = initials || "U";

    showToast(`Mirëseerdhe, ${name}! 👋`, 'success');
}

const authForm = document.getElementById('authForm');
if(authForm) {
    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('authEmail').value;
        const nameInput = document.getElementById('regName').value;
        const name = nameInput || email.split('@')[0];
        const btn = document.getElementById('authSubmitBtn');
        btn.disabled = true;
        btn.innerText = "Duke u procesuar...";

        setTimeout(() => {
            loginUserUI(name, email);
            const modalElement = document.getElementById('authModal');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.hide();
            btn.disabled = false;
            btn.innerText = "Vazhdo";
            e.target.reset();
        }, 1200);
    });
}

function logoutUser() {
    if(confirm("A jeni i sigurt që dëshironi të dilni?")) {
        location.reload();
    }
}

// --- 4. LOGJIKA E SHKURTIMIT DHE KËRKIMIT ---

document.addEventListener('DOMContentLoaded', () => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('darkModeIcon');
        if (icon) {
            icon.classList.replace('fa-moon', 'fa-sun');
            icon.style.color = "#ffca28";
        }
    }
    const savedLinks = JSON.parse(localStorage.getItem('myShortLinks')) || [];
    savedLinks.forEach(link => addResultToUI(link.original, link.short, false, link.date));
});

function filterLinks() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const resultsList = document.getElementById('resultsList');
    const items = resultsList.getElementsByClassName('result-item');

    for (let i = 0; i < items.length; i++) {
        const textContent = items[i].textContent || items[i].innerText;
        if (textContent.toLowerCase().indexOf(filter) > -1) {
            items[i].style.display = "";
        } else {
            items[i].style.display = "none";
        }
    }
}

const shortenForm = document.getElementById('shortenForm');
if(shortenForm) {
    shortenForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const urlInput = document.getElementById('urlInput');
        const originalUrl = urlInput.value;
        const randomCode = Math.random().toString(36).substring(2, 7);
        const shortUrl = `short.it/${randomCode}`;
        const currentDate = new Date().toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' });

        addResultToUI(originalUrl, shortUrl, true, currentDate);
        saveLinkToStorage(originalUrl, shortUrl, currentDate);
        urlInput.value = ''; 
        showToast("Linku i ri u gjenerua! ✨", "primary");
    });
}

function addResultToUI(original, short, animate = false, date = 'Sot') {
    const resultsList = document.getElementById('resultsList');
    if(!resultsList) return;

    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-item shadow-sm max-width-900 mx-auto mb-3 d-flex justify-content-between align-items-center p-3 rounded-3 bg-white';
    
    resultDiv.innerHTML = `
        <div class="text-start overflow-hidden me-3" style="flex: 1;">
            <div class="d-flex align-items-center gap-2 mb-1">
                <p class="mb-0 text-truncate small text-secondary" style="max-width: 80%;">${original}</p>
                <span class="badge bg-light text-dark fw-normal" style="font-size: 0.65rem;">${date}</span>
            </div>
            <a href="${original}" target="_blank" class="short-link fs-5 fw-bold text-decoration-none">${short}</a>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-outline-dark btn-sm" onclick="generateQR('${original}')" title="Gjenero QR">
                <i class="fa-solid fa-qrcode"></i>
            </button>
            <button class="btn btn-outline-primary btn-sm" onclick="copyToClipboard('${short}', this)">
                <i class="fa-regular fa-copy"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteLink('${short}', this)">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    resultsList.prepend(resultDiv);

    if(animate) {
        resultDiv.style.opacity = '0';
        resultDiv.style.transform = 'translateY(-20px)';
        resultDiv.style.transition = '0.3s all ease';
        setTimeout(() => {
            resultDiv.style.opacity = '1';
            resultDiv.style.transform = 'translateY(0)';
        }, 10);
    }
}

function deleteLink(shortUrl, btn) {
    if(confirm("A jeni i sigurt që dëshironi ta fshini këtë link?")) {
        let links = JSON.parse(localStorage.getItem('myShortLinks')) || [];
        links = links.filter(link => link.short !== shortUrl);
        localStorage.setItem('myShortLinks', JSON.stringify(links));
        
        const row = btn.closest('.result-item');
        row.style.opacity = '0';
        row.style.transform = 'scale(0.9)';
        setTimeout(() => {
            row.remove();
            showToast("Linku u fshi përgjithmonë.", "danger");
        }, 300);

        const countEl = document.getElementById('active-links-count');
        if(countEl) countEl.innerText = links.length;
    }
}

function saveLinkToStorage(original, short, date) {
    let links = JSON.parse(localStorage.getItem('myShortLinks')) || [];
    links.push({ original, short, date });
    localStorage.setItem('myShortLinks', JSON.stringify(links));
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.classList.replace('btn-outline-primary', 'btn-success');
        showToast("Linku u kopjua në clipboard! ✅", "success");
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.classList.replace('btn-success', 'btn-outline-primary');
        }, 2000);
    });
}

function generateQR(link) {
    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = "";
    
    new QRCode(qrContainer, {
        text: link,
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    const qrModal = new bootstrap.Modal(document.getElementById('qrModal'));
    qrModal.show();
}

function downloadQR() {
    const img = document.querySelector('#qrcode img');
    const canvas = document.querySelector('#qrcode canvas');
    let imageSource;
    
    if (img && img.src) {
        imageSource = img.src;
    } else if (canvas) {
        imageSource = canvas.toDataURL("image/png");
    }

    if (imageSource) {
        const link = document.createElement('a');
        link.href = imageSource;
        link.download = 'qrcode-shortenit.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("QR Kodi u shkarkua! 📥", "success");
    } else {
        showToast("Pritni pak sa të gjenerohet kodi...", "danger");
    }
}

// --- 5. SISTEMI I NJOFTIMEVE (TOAST) ---

function showToast(message, type = 'primary') {
    const toastEl = document.getElementById('liveToast');
    const toastMsg = document.getElementById('toastMessage');
    
    if(!toastEl || !toastMsg) return;

    // Pastro klasat e vjetra të ngjyrave
    toastEl.classList.remove('bg-primary', 'bg-success', 'bg-danger', 'bg-warning');
    // Shto klasën e re
    toastEl.classList.add(`bg-${type}`);
    
    toastMsg.innerText = message;
    
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}
// Kur klikohet emri në footer
document.querySelector('footer a.text-primary').addEventListener('click', () => {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });
});