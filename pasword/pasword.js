// --- 1. INITIALIZATION & THEME ---
document.addEventListener('DOMContentLoaded', () => {
    // Kontrollo temën menjëherë
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('darkModeIcon');
        if (icon) {
            icon.classList.replace('fa-moon', 'fa-sun');
            icon.style.color = "#ffca28";
        }
    }
    
    // Ngarko linqet
    const savedLinks = JSON.parse(localStorage.getItem('myShortLinks')) || [];
    savedLinks.forEach(link => addResultToUI(link.original, link.short, false, link.date));

    // Lidhu me eventet
    setupMobileEvents();
});

// Fix për Dark Mode në telefon
function setupMobileEvents() {
    const dmBtn = document.getElementById('darkModeBtn');
    if (dmBtn) {
        // Përdorim 'click' por sigurohemi që kapet në çdo pajisje
        dmBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDarkMode();
        });
    }
}

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

// --- 2. AUTH LOGIC (FIXED FOR MOBILE) ---

function setAuthMode(mode) {
    const title = document.getElementById('authTitle');
    const nameField = document.getElementById('nameField');
    const submitBtn = document.getElementById('authSubmitBtn');
    const footerText = document.getElementById('authFooterText');
    const regNameInput = document.getElementById('regName');

    // Pastrojmë inputet kur ndërrojmë mode
    document.getElementById('authForm').reset();

    if (mode === 'register') {
        title.innerText = 'Krijo një Llogari të Re';
        nameField.style.display = 'block';
        regNameInput.setAttribute('required', 'required');
        submitBtn.innerText = 'Krijo Llogarinë';
        footerText.innerHTML = 'Keni llogari? <a href="javascript:void(0)" onclick="setAuthMode(\'login\')" class="text-primary fw-bold text-decoration-none">Hyr këtu</a>';
    } else {
        title.innerText = 'Hyr në Llogari';
        nameField.style.display = 'none';
        regNameInput.removeAttribute('required');
        submitBtn.innerText = 'Vazhdo';
        footerText.innerHTML = 'Nuk keni llogari? <a href="javascript:void(0)" onclick="setAuthMode(\'register\')" class="text-primary fw-bold text-decoration-none">Regjistrohu këtu</a>';
    }
}

// Eventi i Submit të Formës
const authForm = document.getElementById('authForm');
if(authForm) {
    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('authEmail').value;
        const nameInput = document.getElementById('regName').value;
        const submitBtn = document.getElementById('authSubmitBtn');
        
        // Emri: nëse është login, merr pjesën para @ të emailit
        const displayName = nameInput || email.split('@')[0];

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Duke u procesuar...';

        setTimeout(() => {
            loginUserUI(displayName, email);
            
            // Mbyll modalin në mënyrë të sigurt për telefonin
            const modalEl = document.getElementById('authModal');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
            modalInstance.hide();
            
            // Reset butonin
            submitBtn.disabled = false;
            submitBtn.innerText = nameInput ? 'Krijo Llogarinë' : 'Vazhdo';
            authForm.reset();
        }, 1500);
    });
}

function loginUserUI(name, email) {
    const guestZone = document.getElementById('guest-zone');
    const userZone = document.getElementById('user-zone');
    
    if(guestZone) guestZone.setAttribute('style', 'display: none !important');
    if(userZone) userZone.setAttribute('style', 'display: flex !important');
    
    document.getElementById('logged-user-name').innerText = name;
    document.getElementById('logged-user-email').innerText = email;
    
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('user-initials').innerText = initials || "U";

    showToast(`Mirëseerdhe, ${name}! 👋`, 'success');
}

// --- 3. SHKURTIMI & STRUKTURA ---

const shortenForm = document.getElementById('shortenForm');
if(shortenForm) {
    shortenForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const urlInput = document.getElementById('urlInput');
        if(!urlInput.value) return;

        const randomCode = Math.random().toString(36).substring(2, 7);
        const shortUrl = `short.it/${randomCode}`;
        const currentDate = new Date().toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' });

        addResultToUI(urlInput.value, shortUrl, true, currentDate);
        saveLinkToStorage(urlInput.value, shortUrl, currentDate);
        urlInput.value = ''; 
        showToast("Linku u krijua! ✨", "primary");
    });
}

function addResultToUI(original, short, animate = false, date = 'Sot') {
    const resultsList = document.getElementById('resultsList');
    if(!resultsList) return;

    const div = document.createElement('div');
    div.className = 'result-item shadow-sm mb-3 d-flex justify-content-between align-items-center p-3 rounded-3 bg-white';
    div.innerHTML = `
        <div class="text-start overflow-hidden me-2" style="flex: 1;">
            <p class="mb-0 text-truncate small text-secondary">${original}</p>
            <a href="${original}" target="_blank" class="short-link fw-bold text-decoration-none">${short}</a>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-sm btn-light border" onclick="generateQR('${original}')"><i class="fa-solid fa-qrcode"></i></button>
            <button class="btn btn-sm btn-primary" onclick="copyToClipboard('${short}', this)"><i class="fa-regular fa-copy"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteLink('${short}', this)"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;
    resultsList.prepend(div);
}

// --- UTILS ---
function showToast(message, type = 'primary') {
    const toastEl = document.getElementById('liveToast');
    const toastMsg = document.getElementById('toastMessage');
    if(!toastEl) return;
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toastMsg.innerText = message;
    bootstrap.Toast.getOrCreateInstance(toastEl).show();
}

function saveLinkToStorage(original, short, date) {
    let links = JSON.parse(localStorage.getItem('myShortLinks')) || [];
    links.push({ original, short, date });
    localStorage.setItem('myShortLinks', JSON.stringify(links));
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const old = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        showToast("U kopjua! ✅", "success");
        setTimeout(() => btn.innerHTML = old, 2000);
    });
}

function generateQR(link) {
    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, { text: link, width: 180, height: 180 });
    bootstrap.Modal.getOrCreateInstance(document.getElementById('qrModal')).show();
}

function logoutUser() {
    if(confirm("Dëshironi të dilni?")) location.reload();
}
