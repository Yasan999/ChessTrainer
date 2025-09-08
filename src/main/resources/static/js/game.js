document.addEventListener('DOMContentLoaded', () => {
    const uid = localStorage.getItem('uid');
    if (!uid) { window.location.href = '/index.html'; return; }

    const mBox = document.getElementById('mBox');
    const gBox = document.getElementById('gBox');
    const oBox = document.getElementById('oBox');
    const brd = document.getElementById('brd');
    const pov = document.getElementById('pov');
    const gInfo = document.getElementById('gInfo');
    const fScr = document.getElementById('fScr');
    const oTtl = document.getElementById('oTtl');
    const gTime = document.getElementById('gTime');
    const sldr = document.getElementById('tSldr');
    const tVal = document.getElementById('tVal');
    const mName = document.getElementById('mName');

    let seq = [], trn = false, gmd = '', scr = 0, tl = 10, tmr, eTs;
    let prc = false;
    const pcs = ['♙','♘','♗','♖','♕','♔'];
    let cls = [];

    function uMod() {
        const val = parseInt(sldr.value);
        if (val > 90) {
            tVal.textContent = '∞';
            gmd = 'Тренировка';
            tl = Infinity;
        } else {
            tVal.textContent = val;
            tl = val;
            if (val < 5) gmd = 'Пуля';
            else if (val <= 10) gmd = 'Блиц';
            else if (val <= 60) gmd = 'Быстрые';
            else gmd = 'Классика';
        }
        mName.textContent = gmd;
    }
    sldr.addEventListener('input', uMod);
    document.getElementById('pBtn').addEventListener('click', start);
    document.getElementById('aBtn').addEventListener('click', start);
    document.getElementById('cBtn').addEventListener('click', () => { oBox.classList.add('hid'); mBox.classList.remove('hid'); });

    function start() {
        mBox.classList.add('hid'); oBox.classList.add('hid'); gBox.classList.remove('hid');
        pov.classList.remove('hidden'); pov.innerHTML = '';
        scr = 0; seq = []; trn = false; prc = false;
        gInfo.textContent = `Счёт: 0`;
        gTime.textContent = '';
        if (brd.children.length === 0) genBrd();
        cls = Array.from({length: 100}, () => Math.random() < 0.5 ? 'black' : 'white');
        sTmr();
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
        pov.classList.remove('hidden'); pov.innerHTML = '';
        trn = false;
        let nPos;
        do { nPos = Math.floor(Math.random() * 100); } while (seq.includes(nPos));
        seq.push(nPos);
        const thm = localStorage.getItem('theme') || 'classic';

        for(let i=0; i < seq.length; i++){
            const pos = seq[i];
            const row = Math.floor(pos / 10) + 1; const col = (pos % 10) + 1;
            const clk = document.createElement('div');
            clk.className = 'clickable-sqr';
            clk.style.gridRow = row; clk.style.gridColumn = col;
            clk.dataset.id = pos;
            clk.addEventListener('click', hClk);
            const pc = document.createElement('span');
            pc.className = 'pcs'; pc.textContent = pcs[i % pcs.length];
            if(thm === 'alternative') { pc.classList.add(cls[i]); }
            clk.appendChild(pc);
            if(i === seq.length - 1 && seq.length <= 2) clk.classList.add('bnk');
            pov.appendChild(clk);
        }
        trn = true; prc = false;
        pov.classList.add('active');
        bTmr();
    }
    
    function hClk(e) {
        if (!trn || prc) return;
        const cSqr = e.currentTarget;
        const cId = parseInt(cSqr.dataset.id);
        const last = seq[seq.length - 1];
        if (cId === last) {
            prc = true; trn = false; pov.classList.remove('active');
            cSqr.classList.remove('bnk');
            sTmr();
            scr++; gInfo.textContent = `Счёт: ${scr}`;
            pov.classList.add('hidden');
            if (scr === 100) { gOver("ПОБЕДА!", `Максимальный счёт: 100`); } 
            else { setTimeout(next, 1000); }
        } else {
            prc = true; trn = false; pov.classList.remove('active');
            sTmr();
            const corPc = document.querySelector(`#pov [data-id="${last}"]`);
            const corSq = brd.children[last];
            if (corPc) corPc.classList.add('bnk');
            if (corSq) corSq.classList.add('correct-hl');
            setTimeout(() => {
                if (corSq) corSq.classList.remove('correct-hl');
                gOver("Ошибка!", `Ваш результат: ${scr}`);
            }, 4000);
        }
    }

    function bTmr() {
        sTmr();
        if (tl === Infinity) { gTime.textContent = 'Время: ∞'; return; }
        eTs = Date.now();
        gTime.textContent = `Время: ${tl.toFixed(2)}`;
        tmr = setInterval(() => {
            const elp = Date.now() - eTs;
            const rem = tl * 1000 - elp;
            if (rem <= 0) {
                sTmr();
                gOver("Время вышло!", `Ваш результат: ${scr}`);
                return;
            }
            const sec = rem / 1000;
            gTime.textContent = `Время: ${sec < 10 ? sec.toFixed(2) : Math.ceil(sec)}`;
        }, 50);
    }
    function sTmr() { clearInterval(tmr); }
    function gOver(ttl, st) {
        if (!prc) prc = true;
        trn = false; sTmr();
        pov.classList.remove('active');
        oTtl.textContent = ttl; fScr.textContent = st;
        svRes();
        oBox.classList.remove('hid'); gBox.classList.add('hid');
        setTimeout(() => { pov.innerHTML = ''; }, 500);
    }
    async function svRes() {
        try {
            await fetch('/api/res', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: parseInt(uid), scr: scr, mod: gmd }) });
        } catch (e) { console.error('Failed to save result'); }
    }
    uMod();
}); 