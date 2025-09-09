document.addEventListener('DOMContentLoaded', () => {
    const uBody = document.getElementById('uBody');
    const uDet = document.getElementById('uDet');
    const dName = document.getElementById('dName');
    const srh = document.getElementById('srh');
    const tblH = document.querySelectorAll('#uTbl th');
    let cht = null, dat = [], srt = { key: 'fio', asc: true };
    const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    function calc(d) {
        const scrs = d.results.map(r => r.scr).reverse(); const len = scrs.length; let growth = 0;
        if (len >= 10) { const fAvg = avg(scrs.slice(0, 5)); const lAvg = avg(scrs.slice(-5)); growth = lAvg - fAvg; }
        return { ...d.user, games: len, avg: avg(scrs).toFixed(1), growth: growth.toFixed(1), results: d.results };
    }
    function renderChart(u) {
        if (cht) cht.destroy(); uDet.classList.remove('hid'); dName.textContent = u.fio;
        if (!u.results || u.results.length === 0) { document.getElementById('dCh').getContext('2d').clearRect(0,0,1000,1000); return; }
        const scrs = u.results.map(d => d.scr).reverse(); const lbls = scrs.map((d, i) => `Игра ${i + 1}`);
        cht = new Chart(document.getElementById('dCh').getContext('2d'), { type: 'line', data: { labels: lbls, datasets: [{ label: 'Счёт', data: scrs, borderColor: '#7289da', tension: 0.1 }] }, options: { scales: { y: { beginAtZero: true } } }});
    }
    function render() {
        const q = srh.value.toLowerCase(); const fDat = dat.map(calc).filter(u => u.fio.toLowerCase().includes(q) || u.nick.toLowerCase().includes(q));
        fDat.sort((a, b) => { let vA = a[srt.key], vB = b[srt.key]; if (typeof vA === 'string') { return vA.localeCompare(vB) * (srt.asc ? 1 : -1); } return (vA - vB) * (srt.asc ? 1 : -1); });
        uBody.innerHTML = ''; fDat.forEach(u => { const row = document.createElement('tr'); row.innerHTML = `<td>${u.fio}</td><td>${u.yob}</td><td>${u.nick}</td><td>${u.games}</td><td>${u.avg}</td><td>${u.growth > 0 ? '+' : ''}${u.growth}</td>`; row.addEventListener('click', () => renderChart(u)); uBody.appendChild(row); });
    }
    srh.addEventListener('input', render);
    tblH.forEach(th => { th.addEventListener('click', () => { const key = th.dataset.sort; if (srt.key === key) { srt.asc = !srt.asc; } else { srt.key = key; srt.asc = true; } render(); }); });
    async function load() { try { const res = await fetch('/api/all'); if (!res.ok) throw new Error('Не удалось загрузить данные'); dat = await res.json(); render(); } catch(e) { uBody.innerHTML = `<tr><td colspan="6">Ошибка: ${e.message}</td></tr>`; } }
    load();
});