// ==========================================
// 1. INICIALIZIMI DHE DARK MODE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Kontrollo preferencën e temës sapo ngarkohet faqja
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        updateDarkModeUI(true);
    }

    // Ngarko linqet e ruajtura
    const savedLinks = JSON.parse(localStorage.getItem('myShortLinks')) || [];
    savedLinks.forEach(link => addResultToUI(link.original, link.short, false, link.date));
    
    // Setup event listeners
    setupEventListeners();
});

function toggleDarkMode() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateDarkModeUI(isDark);
}

function updateDarkModeUI(isDark) {
    const icon = document.getElementById('darkModeIcon');
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

// ==========================================
// 2. NAVIGIMI I DASHBOARD-IT
// ==========================================
function showSection(sectionName) {
    const hero = document.getElementById('hero-section');
    const analytics = document.getElementById('analytics-section');
    const settings = document.getElementById('settings-section');
    const savedLinks = JSON.parse(localStorage.getItem('myShortLinks')) || [];

    // Fshih të gjitha
    if(hero) hero.style.display = 'none';
    if(analytics) analytics.style.display = 'none';
    if(settings) settings.style.display = 'none';

    // Shfaq seksionin përkatës
    if (sectionName === 'analytics' && analytics) {
        analytics.style.display = 'block';
        const countEl = document.getElementById('active-links-count');
        if(countEl) countEl.innerText = savedLinks.length;
    } else if (sectionName === 'settings' && settings) {
        settings.style.display = 'block';
        const nameDisplay = document.getElementById('logged-user-name');
        if(nameDisplay && document.getElementById('settingsName')) {
            document.getElementById('settingsName').value = nameDisplay.innerText;
        }
    } else if(hero) {
        hero.style.display = 'block';
    }
}

// ==========================================
// 3. IDENTIFIKIMI (AUTH) - FIXED PËR MOBILE
// ==========================================
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
        if(footerText) footerText.innerHTML = 'Keni llogari? <a href="javascript:void(0)" id="switchToLogin" class="text-decoration-none">Hyr këtu</a>';
        
        document.getElementById('switchToLogin')?.addEventListener('click', () => setAuthMode('login'));
    } else {
        if(title) title.innerText = 'Hyr në Llogari';
        if(nameField) nameField.style.display = 'none';
        if(regNameInput) regNameInput.required = false;
        if(submitBtn) submitBtn.innerText = 'Vazhdo';
        if(footerText) footerText.innerHTML = 'Nuk keni llogari? <a href="javascript:void(0)" id="switchToRegister" class="text-decoration-none">Regjistrohu këtu</a>';
        
        document.getElementById('switchToRegister')?.addEventListener('click', () => setAuthMode('register'));
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

function logoutUser() {
    if(confirm("A jeni i sigurt që dëshironi të dilni?")) {
        localStorage.removeItem('userLoggedIn'); // Opcionale nese do te ruash login
        location.reload();
    }
}

// ==========================================
// 4. SHKURTIMI, KERKIMI DHE QR
// ==========================================
function setupEventListeners() {
    // Formularit i shkurtimit
    const shortenForm = document.getElementById('shortenForm');
    if(shortenForm) {
        shortenForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const urlInput = document.getElementById('urlInput');
            const originalUrl = urlInput.value;
            const randomCode = Math.random().toString(36).substring(2, 7);
            const shortUrl = `short.it/${randomCode}`;
            const currentDate = new Date().toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' });

            addResultToUI(originalUrl, shortUrl, true, currentDate);
            saveLinkToStorage(originalUrl, shortUrl, currentDate);
            urlInput.value = ''; 
            showToast("Linku u krijua! ✨", "primary");
        });
    }

    // Formulari i Auth
    const authForm = document.getElementById('authForm');
    if(authForm) {
        authForm.addEventListener('submit', (e) => {
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
                bootstrap.Modal.getOrCreateInstance(modalElement).hide();
                btn.disabled = false;
                btn.innerText = "Vazhdo";
                e.target.reset();
            }, 1200);
        });
    }

    // Dark Mode Button (Mobile Fix)
    document.getElementById('darkModeBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleDarkMode();
    });
}

function addResultToUI(original, short, animate = false, date = 'Sot') {
    const resultsList = document.getElementById('resultsList');
    if(!resultsList) return;

    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-item shadow-sm mb-3 d-flex justify-content-between align-items-center p-3 rounded-3 bg-white';
    
    resultDiv.innerHTML = `
        <div class="text-start overflow-hidden me-3" style="flex: 1;">
            <div class="d-flex align-items-center gap-2 mb-1">
                <p class="mb-0 text-truncate small text-secondary" style="max-width: 150px;">${original}</p>
                <span class="badge bg-light text-dark fw-normal" style="font-size: 0.65rem;">${date}</span>
            </div>
            <a href="${original}" target="_blank" class="short-link fs-5 fw-bold text-decoration-none">${short}</a>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-outline-dark btn-sm" onclick="generateQR('${original}')"><i class="fa-solid fa-qrcode"></i></button>
            <button class="btn btn-outline-primary btn-sm" onclick="copyToClipboard('${short}', this)"><i class="fa-regular fa-copy"></i></button>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteLink('${short}', this)"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;

    resultsList.prepend(resultDiv);
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const icon = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.classList.replace('btn-outline-primary', 'btn-success');
        showToast("U kopjua! ✅", "success");
        setTimeout(() => {
            btn.innerHTML = icon;
            btn.classList.replace('btn-success', 'btn-outline-primary');
        }, 2000);
    });
}

function deleteLink(shortUrl, btn) {
    if(confirm("Ta fshijmë këtë link?")) {
        let links = JSON.parse(localStorage.getItem('myShortLinks')) || [];
        links = links.filter(link => link.short !== shortUrl);
        localStorage.setItem('myShortLinks', JSON.stringify(links));
        btn.closest('.result-item').remove();
        showToast("Linku u fshi.", "danger");
    }
}

function generateQR(link) {
    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, { text: link, width: 200, height: 200 });
    bootstrap.Modal.getOrCreateInstance(document.getElementById('qrModal')).show();
}

// ==========================================
// 5. SISTEMI I NJOFTIMEVE (TOAST) & EXTRA
// ==========================================
function showToast(message, type = 'primary') {
    const toastEl = document.getElementById('liveToast');
    const toastMsg = document.getElementById('toastMessage');
    if(!toastEl) return;

    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toastMsg.innerText = message;
    bootstrap.Toast.getOrCreateInstance(toastEl).show();
}

// Kerko linqet
function filterLinks() {
    const filter = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.result-item');
    items.forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(filter) ? "flex" : "none";
    });
}

// Ruajtja ne Storage
function saveLinkToStorage(original, short, date) {
    let links = JSON.parse(localStorage.getItem('myShortLinks')) || [];
    links.push({ original, short, date });
    localStorage.setItem('myShortLinks', JSON.stringify(links));
}
