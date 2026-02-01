// ==========================================
// 1. STRUKTURA KRYESORE DHE THEMA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("ShortenIt JS e ngarkuar saktë!");

    // Kontrollo Dark Mode nga memorja
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }

    // Ngarko linqet
    const savedLinks = JSON.parse(localStorage.getItem('myShortLinks')) || [];
    savedLinks.forEach(link => addResultToUI(link.original, link.short, false, link.date));

    // AKTIVIZO EVENTET (Kjo rregullon klikimet)
    initEventListeners();
});

function initEventListeners() {
    // 1. Butoni i Dark Mode
    const dmBtn = document.getElementById('darkModeBtn');
    if (dmBtn) {
        dmBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', isDark);
            updateDarkModeIcon(isDark);
        });
    }

    // 2. Formulari i Auth (Login/Register)
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }

    // 3. Formulari i Shkurtimit
    const shortenForm = document.getElementById('shortenForm');
    if (shortenForm) {
        shortenForm.addEventListener('submit', handleShortenSubmit);
    }
}

function updateDarkModeIcon(isDark) {
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
// 2. AUTH LOGIC (LOGIN/REGISTER)
// ==========================================

function setAuthMode(mode) {
    const title = document.getElementById('authTitle');
    const nameField = document.getElementById('nameField');
    const submitBtn = document.getElementById('authSubmitBtn');
    const footerText = document.getElementById('authFooterText');
    const regNameInput = document.getElementById('regName');

    if (mode === 'register') {
        title.innerText = 'Krijo një Llogari të Re';
        nameField.style.display = 'block';
        if(regNameInput) regNameInput.required = true;
        submitBtn.innerText = 'Krijo Llogarinë';
        footerText.innerHTML = 'Keni llogari? <a href="javascript:void(0)" onclick="setAuthMode(\'login\')" class="fw-bold text-primary">Hyr këtu</a>';
    } else {
        title.innerText = 'Hyr në Llogari';
        nameField.style.display = 'none';
        if(regNameInput) regNameInput.required = false;
        submitBtn.innerText = 'Vazhdo';
        footerText.innerHTML = 'Nuk keni llogari? <a href="javascript:void(0)" onclick="setAuthMode(\'register\')" class="fw-bold text-primary">Regjistrohu këtu</a>';
    }
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const nameInput = document.getElementById('regName').value;
    const submitBtn = document.getElementById('authSubmitBtn');

    const name = nameInput || email.split('@')[0];

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Duke u procesuar...';

    setTimeout(() => {
        loginUserUI(name, email);
        const modalEl = document.getElementById('authModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.hide();
        
        submitBtn.disabled = false;
        submitBtn.innerText = "Vazhdo";
    }, 1200);
}

function loginUserUI(name, email) {
    document.getElementById('guest-zone').style.setProperty('display', 'none', 'important');
    document.getElementById('user-zone').style.setProperty('display', 'flex', 'important');
    
    document.getElementById('logged-user-name').innerText = name;
    document.getElementById('logged-user-email').innerText = email;
    
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('user-initials').innerText = initials || "U";

    showToast(`Mirëseerdhe, ${name}! 👋`, 'success');
}

// ==========================================
// 3. SHKURTIMI DHE TOOLS
// ==========================================

function handleShortenSubmit(e) {
    e.preventDefault();
    const urlInput = document.getElementById('urlInput');
    const originalUrl = urlInput.value;
    const randomCode = Math.random().toString(36).substring(2, 7);
    const shortUrl = `short.it/${randomCode}`;
    const currentDate = new Date().toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' });

    addResultToUI(originalUrl, shortUrl, true, currentDate);
    saveLinkToStorage(originalUrl, shortUrl, currentDate);
    urlInput.value = ''; 
    showToast("Linku u gjenerua! ✨", "primary");
}

function addResultToUI(original, short, animate, date) {
    const resultsList = document.getElementById('resultsList');
    if (!resultsList) return;

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

// UTILS
function showToast(message, type) {
    const toastEl = document.getElementById('liveToast');
    document.getElementById('toastMessage').innerText = message;
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    bootstrap.Toast.getOrCreateInstance(toastEl).show();
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const icon = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        showToast("U kopjua! ✅", "success");
        setTimeout(() => btn.innerHTML = icon, 2000);
    });
}

function generateQR(link) {
    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, { text: link, width: 180, height: 180 });
    bootstrap.Modal.getOrCreateInstance(document.getElementById('qrModal')).show();
}

function saveLinkToStorage(original, short, date) {
    let links = JSON.parse(localStorage.getItem('myShortLinks')) || [];
    links.push({ original, short, date });
    localStorage.setItem('myShortLinks', JSON.stringify(links));
}

function deleteLink(shortUrl, btn) {
    if(confirm("Fshije këtë link?")) {
        let links = JSON.parse(localStorage.getItem('myShortLinks')) || [];
        links = links.filter(l => l.short !== shortUrl);
        localStorage.setItem('myShortLinks', JSON.stringify(links));
        btn.closest('.result-item').remove();
    }
}

function logoutUser() {
    if(confirm("Dëshironi të dilni?")) location.reload();
}
