document.addEventListener('DOMContentLoaded', () => {
    const uid = localStorage.getItem('uid');
    if (!uid) { window.location.href = '/index.html'; return; }

    const mBox = document.getElementById('mBox'); const gBox = document.getElementById('gBox'); const oBox = document.getElementById('oBox');
    const brd = document.getElementById('brd'); const pov = document.getElementById('pov');
    const gInfo = document.getElementById('gInfo'); const fScr = document.getElementById('fScr'); const oTtl = document.getElementById('oTtl'); const gTime = document.getElementById('gTime');
    const sldr = document.getElementById('tSldr'); const tVal = document.getElementById('tVal'); const mName = document.getElementById('mName');
    const hintBtn = document.getElementById('hintBtn'); const rulesModal = document.getElementById('rulesModal'); const closeRulesBtn = document.getElementById('closeRulesBtn');
    
    let seq = [], trn = false, gmd = '', scr = 0, tl = 10, tmr, eTs, paused = false, remTime = 0, prc = false;
    const pcs = ['♙','♘','♗','♖','♕','♔']; let cls = [];

    function uMod() {
        const val = parseInt(sldr.value);
        if (val > 90) { tVal.textContent = '∞'; gmd = 'Тренировка'; tl = Infinity; } else {
            tVal.textContent = val; tl = val;
            if (val < 5) gmd = 'Пуля'; else if (val <= 10) gmd = 'Блиц'; else if (val <= 60) gmd = 'Быстрые'; else gmd = 'Классика';
        }
        mName.textContent = gmd;
    }
    
    function start() {
        mBox.classList.add('hid'); oBox.classList.add('hid'); gBox.classList.remove('hid');
        pov.innerHTML = ''; scr = 0; seq = []; trn = false; paused = false; prc = false;
        gInfo.textContent = `Счёт: 0`; gTime.textContent = '';
        if (brd.children.length === 0) { for (let i = 0; i < 100; i++) { const sqr = document.createElement('div'); const cl = (Math.floor(i / 10) + i) % 2 === 0 ? 'wht' : 'blk'; sqr.className = `sqr ${cl}`; brd.appendChild(sqr); } }
        cls = Array.from({length: 100}, () => Math.random() < 0.5 ? 'black' : 'white');
        sTmr(); setTimeout(showSeq, 500);
    }

    function showSeq() {
        prc = true; trn = false; pov.classList.add('active');
        let nPos; do { nPos = Math.floor(Math.random() * 100); } while (seq.includes(nPos));
        seq.push(nPos);
        
        if (scr < 3) { hintBtn.classList.remove('hid'); gTime.style.marginLeft = "auto"; } else { hintBtn.classList.add('hid'); gTime.style.marginLeft = "0"; }
        
        pov.innerHTML = '';
        for(let i=0; i < seq.length; i++){
            const pos = seq[i]; const row = Math.floor(pos / 10) + 1; const col = (pos % 10) + 1;
            const clk = document.createElement('div'); clk.className = 'clickable-sqr'; clk.style.gridRow = row; clk.style.gridColumn = col; clk.dataset.id = pos;
            clk.addEventListener('click', hClk);
            const pc = document.createElement('span'); pc.className = `pcs ${cls[i]}`; pc.textContent = pcs[i % pcs.length];
            clk.appendChild(pc);
            if(i === seq.length - 1 && scr < 2) { clk.classList.add('bnk'); }
            pov.appendChild(clk);
        }
        trn = true; prc = false; bTmr(tl * 1000);
    }
    
    function hClk(e) {
        if (!trn || prc || paused) return;
        prc = true; trn = false;
        const cId = parseInt(e.currentTarget.dataset.id); const target = seq[seq.length - 1];
        if (cId === target) {
            sTmr(); pov.classList.remove('active');
            scr++; gInfo.textContent = `Счёт: ${scr}`;
            if (scr === 100) { gOver("ПОБЕДА!", `Максимальный счёт: 100`); return; }
            pov.innerHTML = '';
            setTimeout(showSeq, 2000);
        } else {
            sTmr(); pov.classList.remove('active');
            const corPc = document.querySelector(`#pov [data-id="${target}"]`); const corSq = brd.children[target];
            if (corPc) corPc.classList.add('bnk'); if (corSq) corSq.classList.add('correct-hl');
            setTimeout(() => { if (corSq) corSq.classList.remove('correct-hl'); gOver("Ошибка!", `Ваш результат: ${scr}`); }, 4000);
        }
    }

    function bTmr(duration) {
        sTmr(); if (tl === Infinity) { gTime.textContent = 'Время: ∞'; return; }
        eTs = Date.now();
        tmr = setInterval(() => {
            const elp = Date.now() - eTs; const rem = duration - elp; remTime = rem;
            if (rem <= 0) { sTmr(); gOver("Время вышло!", `Ваш результат: ${scr}`); return; }
            const sec = rem / 1000; gTime.textContent = `Время: ${sec < 10 ? sec.toFixed(2) : Math.ceil(sec)}`;
        }, 50);
    }
    function sTmr() { clearInterval(tmr); }
    function gOver(ttl, st) { prc = true; trn = false; sTmr(); pov.classList.remove('active'); oTtl.textContent = ttl; fScr.textContent = st; svRes(); oBox.classList.remove('hid'); gBox.classList.add('hid'); setTimeout(() => { pov.innerHTML = ''; }, 500); }
    async function svRes() { try { await fetch('/api/res', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: parseInt(uid), scr: scr, mod: gmd }) }); } catch (e) { console.error('Failed to save result'); } }

    sldr.addEventListener('input', uMod);
    document.getElementById('pBtn').addEventListener('click', start);
    document.getElementById('aBtn').addEventListener('click', start);
    document.getElementById('cBtn').addEventListener('click', () => { oBox.classList.add('hid'); mBox.classList.remove('hid'); });
    hintBtn.addEventListener('click', () => { if(trn) { paused = true; sTmr(); rulesModal.classList.remove('hid'); } });
    closeRulesBtn.addEventListener('click', () => { paused = false; rulesModal.classList.add('hid'); bTmr(remTime); });
    uMod();
});