document.addEventListener('DOMContentLoaded', () => {
    const uBody = document.getElementById('uBody');
    const sMod = document.getElementById('statModal');
    const dName = document.getElementById('dName');
    const cBtn = document.getElementById('cModBtn');
    const srh = document.getElementById('srh');
    const tblH = document.querySelectorAll('#uTbl th');
    const editBtn = document.getElementById('editBtn');
    const delBtn = document.getElementById('delBtn');
    const clearBtn = document.getElementById('clearBtn');

    let cht = null, dat = [], srt = { key: 'fio', asc: true }, curUid = null;

    const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    function calc(d) {
        const scrs = d.results.map(r => r.scr).reverse();
        const len = scrs.length;
        let growth = 0;
        if (len >= 2) { const mid = Math.ceil(len / 2); const fH = scrs.slice(0, mid); const lH = scrs.slice(mid); if (lH.length > 0) { growth = avg(lH) - avg(fH); } }
        return { ...d.user, games: len, avg: avg(scrs).toFixed(1), growth: growth.toFixed(1), results: d.results };
    }

    function renderChart(u) {
        if (cht) cht.destroy();
        curUid = u.id; dName.textContent = u.fio; sMod.classList.remove('hid');
        const scrs = u.results.map(d => d.scr).reverse(); const lbls = scrs.map((d, i) => `Игра ${i + 1}`);
        cht = new Chart(document.getElementById('dCh').getContext('2d'), { type: 'line', data: { labels: lbls, datasets: [{ data: scrs, borderColor: '#7289da', tension: 0.1, fill: true, backgroundColor: 'rgba(114, 137, 218, 0.2)' }] }, options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }});
    }

    function close() { sMod.classList.add('hid'); curUid = null; }
    cBtn.addEventListener('click', close);
    sMod.addEventListener('click', (e) => { if (e.target === sMod) close(); });

    async function handleEdit() {
        if (!curUid) return;
        const nFio = prompt("Введите новое ФИО:", dat.find(d => d.user.id === curUid).user.fio);
        if (nFio) { try { await fetch(`/api/usr/${curUid}/fio`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fio: nFio }) }); } catch (e) { alert('Ошибка изменения ФИО'); } }
        const nPwd = prompt("Введите новый пароль (оставьте пустым, чтобы не менять):");
        if (nPwd) { try { await fetch(`/api/usr/${curUid}/pwd`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pwd: nPwd }) }); } catch (e) { alert('Ошибка смены пароля'); } }
        await load(); close();
    }

    async function handleDelete() {
        if (!curUid || !confirm('Вы уверены, что хотите удалить этого пользователя и все его данные?')) return;
        try { await fetch(`/api/usr/${curUid}`, { method: 'DELETE' }); dat = dat.filter(d => d.user.id !== curUid); render(); close(); } catch (e) { alert('Ошибка удаления'); }
    }

    async function handleClearAll() {
        if (!confirm('ВНИМАНИЕ! Это удалит ВСЕХ пользователей и их статистику. Вы уверены?')) return;
        if (!confirm('ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ. Данные будут стёрты навсегда. Продолжить?')) return;
        try { await fetch(`/api/admin/clear-all`, { method: 'DELETE' }); await load(); } catch (e) { alert('Ошибка при очистке данных.'); }
    }
    editBtn.addEventListener('click', handleEdit);
    delBtn.addEventListener('click', handleDelete);
    clearBtn.addEventListener('click', handleClearAll);

    function render() {
        const q = srh.value.toLowerCase();
        const fDat = dat.map(calc).filter(u => u.fio.toLowerCase().includes(q) || u.nick.toLowerCase().includes(q));
        fDat.sort((a, b) => { let vA = a[srt.key], vB = b[srt.key]; if (typeof vA === 'string') { return vA.localeCompare(vB) * (srt.asc ? 1 : -1); } return (vA - vB) * (srt.asc ? 1 : -1); });
        uBody.innerHTML = '';
        fDat.forEach(u => { const row = document.createElement('tr'); row.innerHTML = `<td>${u.fio}</td><td>${u.yob}</td><td>${u.nick}</td><td>${u.games}</td><td>${u.avg}</td><td>${u.growth > 0 ? '+' : ''}${u.growth}</td>`; row.addEventListener('click', () => renderChart(u)); uBody.appendChild(row); });
    }

    srh.addEventListener('input', render);
    tblH.forEach(th => { th.addEventListener('click', () => { const key = th.dataset.sort; if (srt.key === key) { srt.asc = !srt.asc; } else { srt.key = key; srt.asc = true; } render(); }); });

    async function load() { try { const res = await fetch('/api/all'); if (!res.ok) throw new Error('Не удалось загрузить данные'); dat = await res.json(); render(); } catch(e) { uBody.innerHTML = `<tr><td colspan="6">Ошибка: ${e.message}</td></tr>`; } }
    load();
});