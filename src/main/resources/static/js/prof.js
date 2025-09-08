document.addEventListener('DOMContentLoaded', () => {
    const uid = localStorage.getItem('uid');
    if (!uid) { window.location.href = '/index.html'; return; }

    const noStat = document.getElementById('noStat');
    const chartBox = document.getElementById('chartBox');
    const statGrid = document.getElementById('statGrid');
    const avgFirstEl = document.getElementById('avgFirst');
    const avgLastEl = document.getElementById('avgLast');
    const filterBtns = document.querySelectorAll('#modeFilters .btn');
    const userInfoBox = document.getElementById('userInfo');
    const userNameEl = document.getElementById('userName');
    const userYobEl = document.getElementById('userYob');
    const logoutBtn = document.getElementById('logoutBtn');
    const bgForm = document.getElementById('bgForm');
    const bgUrlInput = document.getElementById('bgUrl');
    const bgThumbs = document.querySelectorAll('.bg-thumb');

    let chartInstance = null;
    let allData = [];
    
    const applyBg = (url) => {
        if (url) document.body.style.backgroundImage = `url('${url}')`;
    };

    const saveBg = async (url) => {
        const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*\.(?:jpg|jpeg|gif|png|webp))$/i;
        if (!urlRegex.test(url)) {
            alert('Неверный формат URL изображения. Убедитесь, что ссылка ведет на картинку (jpg, png и т.д.).');
            return;
        }
        applyBg(url);
        localStorage.setItem('bg', url);
        try {
            await fetch(`/api/usr/${uid}/bg`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bg: url })
            });
        } catch (e) { console.error('Failed to save background'); }
    };

    bgForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = bgUrlInput.value;
        if (url) saveBg(url);
    });

    bgThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            saveBg(thumb.src);
        });
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('uid');
        localStorage.removeItem('bg');
        window.location.href = '/index.html';
    });

    async function loadUserInfo() {
        try {
            const res = await fetch(`/api/usr/${uid}`);
            if (!res.ok) return;
            const usr = await res.json();
            userNameEl.textContent = usr.fio;
            userYobEl.textContent = usr.yob;
            userInfoBox.classList.remove('hid');
            if (usr.bg) {
                applyBg(usr.bg);
                localStorage.setItem('bg', usr.bg);
            }
        } catch(e) { console.error('Failed to load user info'); }
    }

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
            type: 'line', data: { labels: labels, datasets: [{ label: 'Счёт за игру', data: scores, backgroundColor: 'rgba(114, 137, 218, 0.2)', borderColor: 'rgba(114, 137, 218, 1)', borderWidth: 2, tension: 0.1, fill: true, }] }, options: { scales: { y: { beginAtZero: true } } }
        });
    }

    async function load() {
        await loadUserInfo();
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
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.dataset.mode;
            if (mode === 'all') renderStats(allData);
            else renderStats(allData.filter(d => d.mod === mode));
        });
    });

    const bg = localStorage.getItem('bg');
    if (bg) applyBg(bg);
    load();
});