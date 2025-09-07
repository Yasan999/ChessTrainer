const noStat = document.getElementById('noStat');
const uid = localStorage.getItem('uid');
const chartBox = document.getElementById('chartBox');
const statGrid = document.getElementById('statGrid');
const avgFirstEl = document.getElementById('avgFirst');
const avgLastEl = document.getElementById('avgLast');
const filterBtns = document.querySelectorAll('#modeFilters .btn');
let chartInstance = null;
let allData = [];

if (!uid) window.location.href = '/index.html';

function renderStats(data) {
    if (chartInstance) chartInstance.destroy();
    statGrid.classList.add('hid');
    noStat.classList.add('hid');
    
    if (data.length < 4) {
        noStat.classList.remove('hid');
        chartBox.classList.add('hid');
        return;
    }
    
    chartBox.classList.remove('hid');
    const scores = data.map(d => d.scr);
    const mid = Math.floor(scores.length / 2);
    
    const firstHalf = scores.slice(0, mid);
    const lastHalf = scores.slice(mid);

    const avgFirst = (firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length).toFixed(1);
    const avgLast = (lastHalf.reduce((a, b) => a + b, 0) / lastHalf.length).toFixed(1);

    avgFirstEl.textContent = avgFirst;
    avgLastEl.textContent = avgLast;
    statGrid.classList.remove('hid');
    
    const labels = scores.map((d, i) => `Игра ${i + 1}`);
    
    chartInstance = new Chart(document.getElementById('myChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Счёт за игру',
                data: scores,
                backgroundColor: 'rgba(114, 137, 218, 0.2)',
                borderColor: 'rgba(114, 137, 218, 1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true,
            }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });
}

async function load() {
    try {
        const res = await fetch(`/api/prof/${uid}`);
        if (!res.ok) throw new Error('Error');
        allData = await res.json();
        allData.reverse(); 
        renderStats(allData);
    } catch (e) {
        noStat.textContent = 'Не удалось загрузить статистику.';
        noStat.classList.remove('hid');
    }
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode === 'all') {
            renderStats(allData);
        } else {
            const filteredData = allData.filter(d => d.mod === mode);
            renderStats(filteredData);
        }
    });
});
window.addEventListener('load', load);