document.addEventListener('DOMContentLoaded', () => {
    const uid = localStorage.getItem('uid');
    if (!uid) { window.location.href = '/index.html'; return; }

    const nSt = document.getElementById('nStat');
    const cBox = document.getElementById('cBox');
    const sGrd = document.getElementById('sGrid');
    const avgF = document.getElementById('avgF');
    const avgL = document.getElementById('avgL');
    const fBtn = document.querySelectorAll('#mFlt .btn');
    const uBox = document.getElementById('uInf');
    const uName = document.getElementById('uName');
    const uYob = document.getElementById('uYob');

    let cht = null, dat = [];

    async function lInf() {
        try { const res = await fetch(`/api/usr/${uid}`); if (!res.ok) return; const usr = await res.json(); uName.textContent = usr.fio; uYob.textContent = usr.yob; uBox.classList.remove('hid'); } catch(e) { console.error('Failed to load user info'); }
    }

    function ren(d) {
        if (cht) cht.destroy();
        sGrd.classList.add('hid'); nSt.classList.add('hid');
        if (d.length < 4) { nSt.classList.remove('hid'); cBox.classList.add('hid'); return; }
        cBox.classList.remove('hid');
        const scrs = d.map(i => i.scr); const mid = Math.floor(scrs.length / 2);
        const fH = scrs.slice(0, mid); const lH = scrs.slice(mid);
        const aF = (fH.reduce((a, b) => a + b, 0) / fH.length).toFixed(1); const aL = (lH.reduce((a, b) => a + b, 0) / lH.length).toFixed(1);
        avgF.textContent = aF; avgL.textContent = aL; sGrd.classList.remove('hid');
        const lbls = scrs.map((s, i) => `Игра ${i + 1}`);
        cht = new Chart(document.getElementById('mCh').getContext('2d'), { type: 'line', data: { labels: lbls, datasets: [{ data: scrs, backgroundColor: 'rgba(114, 137, 218, 0.2)', borderColor: 'rgba(114, 137, 218, 1)', borderWidth: 2, tension: 0.1, fill: true, }] }, options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } } });
    }

    async function load() {
        await lInf();
        try { const res = await fetch(`/api/prof/${uid}`); if (!res.ok) throw new Error('Error'); dat = await res.json(); dat.reverse(); ren(dat); } catch (e) { nSt.textContent = 'Не удалось загрузить статистику.'; nSt.classList.remove('hid'); }
    }

    fBtn.forEach(b => {
        b.addEventListener('click', () => {
            fBtn.forEach(b2 => b2.classList.remove('active')); b.classList.add('active');
            const mod = b.dataset.mode;
            if (mod === 'all') ren(dat); else ren(dat.filter(d => d.mod === mod));
        });
    });
    load();
});