document.addEventListener('DOMContentLoaded', async () => {
    const uid = localStorage.getItem('uid');
    if (!uid) return;

    const userDropdown = document.getElementById('userDropdown');
    const userNickBtn = document.getElementById('userNickBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    try {
        const res = await fetch(`/api/usr/${uid}`);
        if (!res.ok) throw new Error();
        const usr = await res.json();
        userNickBtn.textContent = usr.nick;
    } catch (e) {
        userNickBtn.textContent = 'Профиль';
    }

    userDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    if(settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            settingsModal.classList.remove('hid');
        });
    }

    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            settingsModal.classList.add('hid');
        });
    }

    window.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
        if (e.target === settingsModal) {
            settingsModal.classList.add('hid');
        }
    });

    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/index.html';
        });
    }

    const applyBg = (url) => { if (url) document.body.style.backgroundImage = `url('${url}')`; };
    const saveBg = async (url) => {
        const urlRegex = /^https?:\/\/[^\s$.?#].[^\s]*\.(?:jpg|jpeg|gif|png|webp)$/i;
        if (!urlRegex.test(url)) { alert('Неверный формат URL.'); return; }
        applyBg(url);
        localStorage.setItem('bg', url);
        try { await fetch(`/api/usr/${uid}/bg`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bg: url }) });
        } catch (e) { console.error('Failed to save background'); }
    };
    document.getElementById('bgForm').addEventListener('submit', (e) => { e.preventDefault(); const url = document.getElementById('bgUrl').value; if (url) saveBg(url); });
    
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const theme = radio.value;
            localStorage.setItem('theme', theme);
            document.body.className = `theme-${theme}`;
            const bg = localStorage.getItem('bg'); if (bg) applyBg(bg);
        });
    });

    const theme = localStorage.getItem('theme') || 'classic';
    document.querySelector(`input[name="theme"][value="${theme}"]`).checked = true;
    document.body.className = `theme-${theme}`;

    const bg = localStorage.getItem('bg');
    if (bg) applyBg(bg);
});