document.addEventListener('DOMContentLoaded', async () => {
    const uid = localStorage.getItem('uid');
    if (!uid && !['/index.html', '/'].includes(window.location.pathname)) {
        window.location.href = '/index.html'; return;
    }
    if (!uid) return;

    const dd = document.getElementById('uDd');
    const btn = document.getElementById('uBtn');
    const menu = document.getElementById('dMenu');
    const sBtn = document.getElementById('sBtn');
    const sMod = document.getElementById('sMod');
    const cBtn = document.getElementById('cModBtn');
    const lBtn = document.getElementById('lBtn');

    try {
        const res = await fetch(`/api/usr/${uid}`);
        if (!res.ok) throw new Error();
        const usr = await res.json();
        btn.textContent = usr.nick;
    } catch (e) { btn.textContent = 'Профиль'; }

    dd.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('show'); });
    if(sBtn) sBtn.addEventListener('click', (e) => { e.preventDefault(); sMod.classList.remove('hid'); });
    if(cBtn) cBtn.addEventListener('click', () => sMod.classList.add('hid'));

    window.addEventListener('click', (e) => {
        if (dd && !dd.contains(e.target)) menu.classList.remove('show');
        if (e.target === sMod) sMod.classList.add('hid');
    });

    if(lBtn) lBtn.addEventListener('click', () => { localStorage.clear(); window.location.href = '/index.html'; });

    const abg = (url) => { if (url) document.body.style.backgroundImage = `url('${url}')`; };
    const sbg = async (url) => {
        const rgx = /^https?:\/\/[^\s$.?#].[^\s]*\.(?:jpg|jpeg|gif|png|webp)$/i;
        if (!rgx.test(url)) { alert('Неверный формат URL.'); return; }
        abg(url); localStorage.setItem('bg', url);
        try { await fetch(`/api/usr/${uid}/bg`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bg: url }) });
        } catch (e) { console.error('Failed to save background'); }
    };
    if (document.getElementById('bgForm')) {
        document.getElementById('bgForm').addEventListener('submit', (e) => { e.preventDefault(); const url = document.getElementById('bgUrl').value; if (url) sbg(url); });
    }
    
    document.querySelectorAll('input[name="theme"]').forEach(r => {
        r.addEventListener('change', () => {
            const thm = r.value;
            localStorage.setItem('theme', thm);
            document.body.className = `theme-${thm}`;
            const bg = localStorage.getItem('bg'); if (bg) abg(bg);
        });
    });

    const thm = localStorage.getItem('theme') || 'classic';
    document.querySelector(`input[name="theme"][value="${thm}"]`).checked = true;
    document.body.className = `theme-${thm}`;
    const bg = localStorage.getItem('bg');
    if (bg) abg(bg);
});