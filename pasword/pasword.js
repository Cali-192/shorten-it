// ==========================================
// 1. STRUKTURA DHE TEMA (DARK MODE)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Ngarko temën
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }

    // Ngarko linqet e ruajtura
    const savedLinks = JSON.parse(localStorage.getItem('myShortLinks')) || [];
    savedLinks.forEach(link => addResultToUI(link.original, link.short, false, link.date));

    // Kontrollo nëse përdoruesi ishte i kyçur
    const user = JSON.parse(localStorage.getItem('loggedUser'));
    if (user) {
        loginUserUI(user.name, user.email);
    }
});

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateDarkModeIcon(isDark);
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
// 2. NAVIGIMI DHE SEKSIONET
// ==========================================
function showSection(sectionName) {
    // ID-të reale në HTML
    const sections = {
        'hero': 'hero-section',
        'analytics': 'analytics-section',
        'settings': 'settings-section'
    };
    
    // Fshih të gjitha seksionet
    Object.values(sections).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.setProperty('display', 'none', 'important');
    });

    // Shfaq seksionin e kërkuar
    const activeId = sections[sectionName];
    const activeSection = document.getElementById(activeId);
    if (activeSection) {
        activeSection.style.setProperty('display', 'block', 'important');
        window.scrollTo(0, 0);
    }

    // Përditëso të dhënat nëse është Analitika
    if (sectionName === 'analytics') {
        const links = JSON.parse(localStorage.getItem('myShortLinks')) || [];
        const countEl = document.getElementById('active-links-count');
        if (countEl) countEl.innerText = links.length;
    }

    // MBYLL MENUNË NË MOBIL
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) bsCollapse.hide();
    }
}

// ==========================================
// 3. IDENTIFIKIMI (AUTH)
// ==========================================
function setAuthMode(mode) {
    const title = document.getElementById('authTitle');
    const nameField = document.getElementById('nameField');
    const submitBtn = document.getElementById('authSubmitBtn');
    const footerText = document.getElementById('authFooterText');

    if (mode === 'register') {
        title.innerText = 'Krijo një Llogari të Re';
        nameField.style.display = 'block';
        submitBtn.innerText = 'Krijo Llogarinë';
        footerText.innerHTML = 'Keni llogari? <a href="javascript:void(0)" onclick="setAuthMode(\'login\')" class="text-primary fw-bold">Hyr këtu</a>';
    } else {
        title.innerText = 'Hyr në Llogari';
        nameField.style.display = 'none';
        submitBtn.innerText = 'Vazhdo';
        footerText.innerHTML = 'Nuk keni llogari? <a href="javascript:void(0)" onclick="setAuthMode(\'register\')" class="text-primary fw-bold">Regjistrohu këtu</a>';
    }
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
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Duke u procesuar...';

        setTimeout(() => {
            const userData = { name: name, email: email };
            localStorage.setItem('loggedUser', JSON.stringify(userData));
            loginUserUI(name, email);
            
            const modalEl = document.getElementById('authModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            btn.disabled = false;
            btn.innerText = 'Vazhdo';
            authForm.reset();
        }, 1200);
    });
}

function loginUserUI(name, email) {
    const guestZone = document.getElementById('guest-zone');
    const userZone = document.getElementById('user-zone');

    if(guestZone) guestZone.style.setProperty('display', 'none', 'important');
    if(userZone) userZone.style.setProperty('display', 'block', 'important');
    
    document.getElementById('logged-user-name').innerText = name;
    document.getElementById('logged-user-email').innerText = email;
    
    const settingsName = document.getElementById('settingsName');
    const settingsEmail = document.getElementById('settingsEmail');
    if(settingsName) settingsName.value = name;
    if(settingsEmail) settingsEmail.value = email;
    
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('user-initials').innerText = initials.substring(0, 2) || "U";
}

function logoutUser() {
    if(confirm("A jeni i sigurt që dëshironi të dilni?")) {
        localStorage.removeItem('loggedUser');
        location.reload();
    }
}

// ==========================================
// 4. SHKURTIMI DHE REZULTATET
// ==========================================
const shortenForm = document.getElementById('shortenForm');
if(shortenForm) {
    shortenForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const urlInput = document.getElementById('urlInput');
        const originalUrl = urlInput.value;
        
        // Gjenero kodin unik
        const randomCode = Math.random().toString(36).substring(2, 7);
        const shortUrl = `short.it/${randomCode}`;
        
        const currentDate = new Date().toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' });

        addResultToUI(originalUrl, shortUrl, true, currentDate);
        saveLinkToStorage(originalUrl, shortUrl, currentDate);
        
        urlInput.value = ''; 
    });
}

function addResultToUI(original, short, animate, date) {
    const resultsList = document.getElementById('resultsList');
    if(!resultsList) return;

    const div = document.createElement('div');
    div.className = `result-item shadow-sm p-3 mb-3 bg-white rounded-3 d-flex justify-content-between align-items-center ${animate ? 'animate-in' : ''}`;
    
    div.innerHTML = `
        <div class="text-start overflow-hidden me-2" style="flex: 1;">
            <div class="d-flex align-items-center gap-2">
                <p class="mb-0 text-truncate small text-secondary" style="max-width: 150px;">${original}</p>
                <span class="badge bg-light text-dark fw-normal" style="font-size: 0.7rem;">${date || 'Sot'}</span>
            </div>
            <a href="${original}" target="_blank" class="short-link fs-5 fw-bold text-decoration-none text-primary">${short}</a>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-dark" onclick="generateQR('${original}')" title="QR Code"><i class="fa-solid fa-qrcode"></i></button>
            <button class="btn btn-sm btn-primary" onclick="copyToClipboard('${short}', this)" title="Kopjo"><i class="fa-regular fa-copy"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteLink('${short}', this)" title="Fshij"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;
    resultsList.prepend(div);
}

function saveLinkToStorage(original, short, date) {
    let links = JSON.parse(localStorage.getItem('myShortLinks')) || [];
    links.push({ original, short, date });
    localStorage.setItem('myShortLinks', JSON.stringify(links));
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.classList.replace('btn-primary', 'btn-success');
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.classList.replace('btn-success', 'btn-primary');
        }, 2000);
    });
}

// ==========================================
// 5. QR CODE DHE SHKARKIMI
// ==========================================
function generateQR(link) {
    const qrContainer = document.getElementById("qrcode");
    if(!qrContainer) return;
    
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
        text: link,
        width: 180,
        height: 180,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
    
    const qrModal = new bootstrap.Modal(document.getElementById('qrModal'));
    qrModal.show();
}

function downloadQR() {
    const qrImg = document.querySelector('#qrcode img');
    if (qrImg) {
        const link = document.createElement('a');
        link.href = qrImg.src;
        link.download = 'shortenit-qr.png';
        link.click();
    } else {
        // Për canvas (disa browsera e bëjnë render si canvas)
        const canvas = document.querySelector('#qrcode canvas');
        if(canvas) {
            const link = document.createElement('a');
            link.href = canvas.toDataURL("image/png");
            link.download = 'shortenit-qr.png';
            link.click();
        }
    }
}

// ==========================================
// 6. MIRËMBAJTJA (DELETE & FILTER)
// ==========================================
function deleteLink(short, btn) {
    if(confirm("A jeni i sigurt që dëshironi ta fshini këtë link?")) {
        let links = JSON.parse(localStorage.getItem('myShortLinks')) || [];
        links = links.filter(l => l.short !== short);
        localStorage.setItem('myShortLinks', JSON.stringify(links));
        
        const item = btn.closest('.result-item');
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 300);
    }
}

function filterLinks() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.result-item');
    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.setProperty('display', text.includes(search) ? 'flex' : 'none', 'important');
    });
}
