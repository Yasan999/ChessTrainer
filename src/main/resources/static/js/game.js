document.addEventListener('DOMContentLoaded', () => {
    const uid = localStorage.getItem('uid');
    if (!uid) { window.location.href = '/index.html'; return; }

    const mBox = document.getElementById('modeBox');
    const gBox = document.getElementById('gameBox');
    const oBox = document.getElementById('overBox');
    const brd = document.getElementById('brd');
    const overlay = document.getElementById('pieces-overlay');
    const gInfo = document.getElementById('gInfo');
    const fScore = document.getElementById('fScore');
    const overTitle = document.getElementById('overTitle');
    const tBarFill = document.getElementById('tBarFill');
    const timeSlider = document.getElementById('timeSlider');
    const timeVal = document.getElementById('timeVal');
    const modeName = document.getElementById('modeName');
    const playBtn = document.getElementById('playBtn');

    let seq = [], hTurn = false, gMode = '', score = 0, timeLimit = 10, turnTimer;
    let isProcessing = false;
    const pcs = ['♙','♘','♗','♖','♕','♔'];

    function updateMode() {
        const val = parseInt(timeSlider.value);
        timeVal.textContent = val;
        timeLimit = val;
        if (val < 5) gMode = 'Пуля';
        else if (val <= 10) gMode = 'Блиц';
        else if (val <= 60) gMode = 'Быстрые';
        else gMode = 'Классика';
        modeName.textContent = gMode;
    }
    timeSlider.addEventListener('input', updateMode);
    playBtn.addEventListener('click', start);
    document.getElementById('againBtn').addEventListener('click', start);
    document.getElementById('chModeBtn').addEventListener('click', () => {
        oBox.classList.add('hid');
        mBox.classList.remove('hid');
    });

    function start() {
        mBox.classList.add('hid');
        oBox.classList.add('hid');
        gBox.classList.remove('hid');
        overlay.classList.remove('hidden');
        overlay.innerHTML = '';
        score = 0;
        seq = [];
        hTurn = false;
        isProcessing = false;
        gInfo.textContent = `Счёт: 0`;
        if (brd.children.length === 0) genBrd();
        stopTurnTimer();
        setTimeout(next, 500);
    }

    function genBrd() {
        for (let i = 0; i < 100; i++) {
            const sqr = document.createElement('div');
            sqr.className = (Math.floor(i / 10) + i) % 2 === 0 ? 'sqr wht' : 'sqr blk';
            brd.appendChild(sqr);
        }
    }
    function next() {
        overlay.classList.remove('hidden');
        overlay.innerHTML = '';
        hTurn = false;
        let nPos;
        do { nPos = Math.floor(Math.random() * 100); } while (seq.includes(nPos));
        seq.push(nPos);
        
        const pieceStyle = localStorage.getItem('pieceStyle') || 'classic';

        for(let i=0; i < seq.length; i++){
            const pos = seq[i];
            const row = Math.floor(pos / 10) + 1;
            const col = (pos % 10) + 1;

            const clickable = document.createElement('div');
            clickable.className = 'clickable-sqr';
            clickable.style.gridRow = row;
            clickable.style.gridColumn = col;
            clickable.dataset.id = pos;
            clickable.addEventListener('click', hClick);

            const pc = document.createElement('span');
            pc.className = 'pcs';
            pc.textContent = pcs[i % pcs.length];
            if(pieceStyle === 'random') {
                pc.style.color = Math.random() < 0.5 ? '#000000' : '#ffffff';
            }

            clickable.appendChild(pc);
            
            if(i === seq.length - 1 && seq.length <= 2) {
                clickable.classList.add('bnk');
            }
            overlay.appendChild(clickable);
        }
        hTurn = true;
        isProcessing = false;
        overlay.classList.add('active');
        startTurnTimer();
    }
    function hClick(e) {
        if (!hTurn || isProcessing) return;
        
        const clickedSqr = e.currentTarget;
        const cId = parseInt(clickedSqr.dataset.id);
        const last = seq[seq.length - 1];
        if (cId === last) {
            isProcessing = true;
            hTurn = false;
            overlay.classList.remove('active');
            clickedSqr.classList.remove('bnk');
            stopTurnTimer();
            score++;
            gInfo.textContent = `Счёт: ${score}`;
            overlay.classList.add('hidden');
            if (score === 100) {
                gameOver("ВЫ ПОБЕДИЛИ!", `Максимальный счёт: 100`);
            } else {
                setTimeout(next, 2000);
            }
        } else {
            isProcessing = true;
            hTurn = false;
            overlay.classList.remove('active');
            stopTurnTimer();
            const correctPiece = document.querySelector(`#pieces-overlay [data-id="${last}"]`);
            if (correctPiece) correctPiece.classList.add('bnk');
            setTimeout(() => {
                gameOver("Ошибка!", `Ваш результат: ${score}`);
            }, 4000);
        }
    }
    function startTurnTimer() {
        stopTurnTimer();
        tBarFill.style.transition = 'none';
        tBarFill.style.width = '100%';
        setTimeout(() => {
            tBarFill.style.transition = `width ${timeLimit}s linear`;
            tBarFill.style.width = '0%';
        }, 50);
        turnTimer = setTimeout(() => {
            gameOver("Время вышло!", `Ваш результат: ${score}`);
        }, timeLimit * 1000);
    }
    function stopTurnTimer() { 
        clearTimeout(turnTimer);
        if(tBarFill.getAnimations) {
            tBarFill.getAnimations().forEach(anim => anim.cancel());
        }
    }
    function gameOver(title, scoreText) {
        if (!isProcessing) isProcessing = true;
        hTurn = false;
        stopTurnTimer();
        overlay.classList.remove('active');
        overTitle.textContent = title;
        fScore.textContent = scoreText;
        saveRes();
        oBox.classList.remove('hid');
        gBox.classList.add('hid');
        setTimeout(() => { overlay.innerHTML = ''; }, 500);
    }
    async function saveRes() {
        try {
            await fetch('/api/res', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: parseInt(uid), scr: score, mod: gMode })
            });
        } catch (e) { console.error('Failed to save result'); }
    }

    const bg = localStorage.getItem('bg');
    if (bg) document.body.style.backgroundImage = `url('${bg}')`;
    const boardStyle = localStorage.getItem('boardStyle');
    if (boardStyle) document.body.classList.add(`board-style-${boardStyle}`);
    
    updateMode();
});