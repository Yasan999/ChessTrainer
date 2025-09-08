document.addEventListener('DOMContentLoaded', () => {
    const wBox = document.getElementById('wBox');
    const lBox = document.getElementById('lBox');
    const rBox = document.getElementById('rBox');
    const err = document.getElementById('err');

    document.getElementById('sLBtn').addEventListener('click', () => {
        wBox.classList.add('hid'); lBox.classList.remove('hid'); err.textContent = '';
    });
    document.getElementById('sRBtn').addEventListener('click', () => {
        wBox.classList.add('hid'); rBox.classList.remove('hid'); err.textContent = '';
    });
    document.getElementById('bW1').addEventListener('click', (e) => {
        e.preventDefault(); wBox.classList.remove('hid'); lBox.classList.add('hid');
    });
    document.getElementById('bW2').addEventListener('click', (e) => {
        e.preventDefault(); wBox.classList.remove('hid'); rBox.classList.add('hid');
    });

    document.getElementById('lForm').addEventListener('submit', async (e) => {
        e.preventDefault(); err.textContent = '';
        const n = document.getElementById('lN').value;
        const p = document.getElementById('lP').value;
        
        if (n === 'admin' && p === 'MasterY2008') {
            const frm = document.createElement('form');
            frm.method = 'POST'; frm.action = '/login';
            const iN = document.createElement('input');
            iN.type = 'hidden'; iN.name = 'username'; iN.value = n;
            const iP = document.createElement('input');
            iP.type = 'hidden'; iP.name = 'password'; iP.value = p;
            frm.appendChild(iN); frm.appendChild(iP);
            document.body.appendChild(frm);
            frm.submit();
            return;
        }

        try {
            const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nick: n, pwd: p }) });
            if (res.status === 401) throw new Error('Неверный логин или пароль');
            if (!res.ok) throw new Error('Ошибка сервера');
            const usr = await res.json();
            localStorage.setItem('uid', usr.id);
            if (usr.bg) localStorage.setItem('bg', usr.bg);
            window.location.href = '/game.html';
        } catch (error) { err.textContent = error.message; }
    });

    document.getElementById('rForm').addEventListener('submit', async (e) => {
        e.preventDefault(); err.textContent = '';
        const fio = document.getElementById('rF').value;
        const yob = document.getElementById('rY').value;
        const n = document.getElementById('rN').value;
        const p = document.getElementById('rP').value;
        const a = document.getElementById('rA').checked;

        if (!fio || !yob || !n || !p || !a) { err.textContent = 'Пожалуйста, заполните все поля.'; return; }

        try {
            const res = await fetch('/api/reg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fio, yob: parseInt(yob), nick: n, pwd: p }) });
            if (res.status === 409) throw new Error('Этот логин уже занят');
            if (!res.ok) throw new Error('Ошибка сервера');
            const usr = await res.json();
            localStorage.setItem('uid', usr.id);
            window.location.href = '/game.html';
        } catch (error) { err.textContent = error.message; }
    });

    if (new URLSearchParams(window.location.search).has('error')) {
        wBox.classList.add('hid'); lBox.classList.remove('hid');
        err.textContent = 'Неверный логин или пароль';
    }
});