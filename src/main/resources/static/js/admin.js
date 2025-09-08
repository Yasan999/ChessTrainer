document.addEventListener('DOMContentLoaded', () => {
    const userList = document.getElementById('userList');
    const userDetail = document.getElementById('userDetail');
    const detailName = document.getElementById('detailName');
    let chartInstance = null;
    let allUsersData = [];

    function renderChart(userData) {
        if (chartInstance) chartInstance.destroy();
        userDetail.classList.remove('hid');
        detailName.textContent = userData.user.fio;
        
        const scores = userData.results.map(d => d.scr).reverse();
        const labels = scores.map((d, i) => `Игра ${i + 1}`);
        
        chartInstance = new Chart(document.getElementById('detailChart').getContext('2d'), {
            type: 'line', data: { labels: labels, datasets: [{ label: 'Счёт за игру', data: scores, backgroundColor: 'rgba(114, 137, 218, 0.2)', borderColor: 'rgba(114, 137, 218, 1)', borderWidth: 2, tension: 0.1, fill: true, }] }, options: { scales: { y: { beginAtZero: true } } }
        });
    }

    async function loadAllData() {
        try {
            const res = await fetch('/api/all');
            if (!res.ok) throw new Error('Не удалось загрузить данные');
            allUsersData = await res.json();
            
            userList.innerHTML = '';
            allUsersData.forEach((data, index) => {
                const userBtn = document.createElement('button');
                userBtn.className = 'btn';
                userBtn.textContent = `${data.user.fio} (${data.user.nick})`;
                userBtn.addEventListener('click', () => renderChart(data));
                userList.appendChild(userBtn);
            });
        } catch(e) {
            userList.textContent = 'Ошибка: ' + e.message;
        }
    }
    loadAllData();
});