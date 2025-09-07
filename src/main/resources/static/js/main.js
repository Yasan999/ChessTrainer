const welcomeBox = document.getElementById('welcomeBox');
const loginBox = document.getElementById('loginBox');
const regBox = document.getElementById('regBox');
const err = document.getElementById('err');

document.getElementById('showLoginBtn').addEventListener('click', () => {
    welcomeBox.classList.add('hid');
    loginBox.classList.remove('hid');
    err.textContent = '';
});

document.getElementById('showRegBtn').addEventListener('click', () => {
    welcomeBox.classList.add('hid');
    regBox.classList.remove('hid');
    err.textContent = '';
});

document.getElementById('backToWelcome1').addEventListener('click', () => {
    welcomeBox.classList.remove('hid');
    loginBox.classList.add('hid');
});

document.getElementById('backToWelcome2').addEventListener('click', () => {
    welcomeBox.classList.remove('hid');
    regBox.classList.add('hid');
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    err.textContent = '';
    const nick = document.getElementById('loginNick').value;
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nick })
        });
        if (res.status === 404) throw new Error('Пользователь не найден');
        if (!res.ok) throw new Error('Ошибка сервера');
        const usr = await res.json();
        localStorage.setItem('uid', usr.id);
        window.location.href = '/game.html';
    } catch (error) {
        err.textContent = error.message;
    }
});

document.getElementById('regForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    err.textContent = '';
    const fio = document.getElementById('regFio').value;
    const yob = document.getElementById('regYob').value;
    const nick = document.getElementById('regNick').value;
    const agr = document.getElementById('regAgr').checked;

    if (!fio || !yob || !nick || !agr) {
        err.textContent = 'Пожалуйста, заполните все поля.';
        return;
    }

    try {
        const res = await fetch('/api/reg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fio, yob: parseInt(yob), nick })
        });
        if (res.status === 409) throw new Error('Этот ник уже занят');
        if (!res.ok) throw new Error('Ошибка сервера');
        const usr = await res.json();
        localStorage.setItem('uid', usr.id);
        window.location.href = '/game.html';
    } catch (error) {
        err.textContent = error.message;
    }
});