// CONFIGURACIÓN DE LA RONDA
const TOTAL_DUCKS_PER_ROUND = 20;
const WINNING_SCORE = 12; // Meta para cortar la partida

// Variables de Estado
let ducksRemaining = TOTAL_DUCKS_PER_ROUND;
let ducksHitCount = 0;
let isPlaying = false;

// Elementos del DOM
const container = document.getElementById('game-container');
const introScreen = document.getElementById('intro-screen');
const gameUI = document.getElementById('game-ui');
const counterElement = document.getElementById('duck-counter');
const gameLayer = document.getElementById('ducks-layer');
const progressFill = document.getElementById('progress-fill');
const bonusPopup = document.getElementById('bonus-popup');
const startBtn = document.getElementById('start-btn');
const rifleContainer = document.querySelector('.rifle-container');

// --- INICIALIZACIÓN ---
if(rifleContainer) {
    rifleContainer.style.opacity = '0';
}

// --- FUNCIÓN DE INICIO ---
function startGame() {
    // 1. Ocultar Intro
    introScreen.style.opacity = '0';
    setTimeout(() => { introScreen.style.display = 'none'; }, 500);

    // 2. Abrir Cortinas
    container.classList.add('curtains-open');
    
    // 3. Mostrar Interfaz y Rifles
    gameUI.style.display = 'block';
    
    setTimeout(() => {
        gameUI.style.opacity = '1';
        if(rifleContainer) rifleContainer.style.opacity = '1'; 
    }, 100);

    // 4. Reiniciar Variables
    ducksRemaining = TOTAL_DUCKS_PER_ROUND;
    ducksHitCount = 0;
    if(counterElement) counterElement.innerText = ducksRemaining;
    updateProgressBar();
    
    // 5. Iniciar Juego
    isPlaying = true;
    setTimeout(spawnDuck, 1000);
}

// --- ACTUALIZAR BARRA ---
function updateProgressBar() {
    let percentage = (ducksHitCount / WINNING_SCORE) * 100;
    if (percentage > 100) percentage = 100;
    if (progressFill) progressFill.style.width = percentage + '%';
}

// --- MOSTRAR BONO (POPUP) ---
function showBonus(text) {
    if(!bonusPopup) return;
    bonusPopup.innerText = text;
    bonusPopup.classList.remove('bonus-anim');
    void bonusPopup.offsetWidth;
    bonusPopup.classList.add('bonus-anim');
}

// --- CALCULAR RESULTADO FINAL ---
function getResultText() {
    if (ducksHitCount >= 12) return "¡GANASTE!<br><span style='color:#76ff03'>BONO 200%</span>";
    if (ducksHitCount >= 9) return "CASI...<br><span style='color:#ffca28'>BONO 150%</span>";
    if (ducksHitCount >= 6) return "BIEN<br><span style='color:#ffca28'>BONO 100%</span>";
    if (ducksHitCount >= 3) return "REGULAR<br><span style='color:#ffca28'>BONO 50%</span>";
    return "¡INTENTA DE NUEVO!<br><span style='color:#ff5252'>SIN BONO</span>";
}

// --- FIN DE RONDA ---
function endGame(customMessage) {
    isPlaying = false; // Detiene la salida de nuevos patos
    
    // Limpiar patos restantes en pantalla
    const remainingDucks = document.querySelectorAll('.duck-container');
    remainingDucks.forEach(duck => duck.remove());
    
    // 1. Cerrar Cortinas
    container.classList.remove('curtains-open');

    // 2. Ocultar Interfaz y Rifles
    gameUI.style.opacity = '0';
    if(rifleContainer) rifleContainer.style.opacity = '0';

    setTimeout(() => {
        gameUI.style.display = 'none';
    }, 500);

    // 3. Mostrar Intro con el Resultado
    setTimeout(() => {
        introScreen.style.display = 'flex';
        setTimeout(() => { introScreen.style.opacity = '1'; }, 50);
        
        // Usamos el mensaje personalizado o calculamos según los aciertos
        const finalMsg = customMessage || getResultText();
        
        startBtn.innerHTML = `${finalMsg}<br><span style='font-size:1.2rem; margin-top:10px; display:block; color: white;'>JUGAR OTRA</span>`;
    }, 1500);
}

// --- GENERAR PATOS ---
function spawnDuck() {
    if (!isPlaying) return;

    // Si se acabaron los patos y no ganaste
    if (ducksRemaining <= 0) {
        // Esperamos un poco a que el último pato termine su recorrido antes de cerrar
        setTimeout(() => {
            if(isPlaying) endGame(); // Si sigue jugando (no ganó antes), termina
        }, 2000);
        return;
    }

    ducksRemaining--;
    if(counterElement) counterElement.innerText = ducksRemaining;

    // Crear Pato
    const duckContainer = document.createElement('div');
    duckContainer.classList.add('duck-container');
    const randomHeight = Math.floor(Math.random() * 40) + 160;
    duckContainer.style.bottom = randomHeight + 'px';
    const randomSpeed = Math.random() * 4 + 3;
    duckContainer.style.animationDuration = randomSpeed + 's';

    // Dibujo CSS
    const stick = document.createElement('div'); stick.classList.add('duck-stick');
    const duckBody = document.createElement('div'); duckBody.classList.add('duck-wrapper');
    const head = document.createElement('div'); head.classList.add('duck-head');
    const beak = document.createElement('div'); beak.classList.add('duck-beak');
    const eye = document.createElement('div'); eye.classList.add('duck-eye');
    const torso = document.createElement('div'); torso.classList.add('duck-torso');
    const wing = document.createElement('div'); wing.classList.add('duck-wing');

    head.appendChild(beak); head.appendChild(eye);
    torso.appendChild(wing);
    duckBody.appendChild(torso); duckBody.appendChild(head);
    duckContainer.appendChild(stick); duckContainer.appendChild(duckBody);

    // --- LOGICA DE IMPACTO ---
    duckBody.addEventListener('mousedown', function (e) {
        if (!duckBody.classList.contains('duck-hit')) {
            ducksHitCount++;
            updateProgressBar();

            // Mensajes intermedios
            if (ducksHitCount === 3) showBonus('¡BONO 50%!');
            if (ducksHitCount === 6) showBonus('¡BONO 100%!');
            if (ducksHitCount === 9) showBonus('¡BONO 150%!');

            // --- VICTORIA INMEDIATA (CORTAR PARTIDA) ---
            if (ducksHitCount === 12) {
                showBonus('¡BONO 200%!');
                // Efecto visual antes de cortar
                const boom = createExplosion(e.clientX, e.clientY);
                duckBody.classList.add('duck-hit');
                setTimeout(() => duckContainer.remove(), 300);
                
                // Cortamos inmediatamente
                endGame("¡GANASTE!<br><span style='color:#76ff03'>BONO 200%</span>");
                return; // Salimos para evitar lógica extra
            }

            // Efecto Explosión normal
            createExplosion(e.clientX, e.clientY);

            duckBody.classList.add('duck-hit');
            setTimeout(() => { duckContainer.remove(); }, 300);
        }
        e.stopPropagation();
    });

    gameContainer.appendChild(duckContainer);

    setTimeout(() => {
        if (duckContainer.parentNode) duckContainer.remove();
    }, (randomSpeed + 0.5) * 1000);

    // Siguiente pato
    if (ducksRemaining > 0) {
        const nextSpawnTime = Math.random() * 1000 + 500;
        setTimeout(spawnDuck, nextSpawnTime);
    } 
    // Si ducksRemaining es 0, el loop se detiene y el timeout del principio de la función se encargará de cerrar
}

// Helper para explosión
function createExplosion(x, y) {
    const boom = document.createElement('div');
    boom.classList.add('explosion');
    boom.innerText = '💥';
    boom.style.left = x + 'px';
    boom.style.top = y + 'px';
    document.body.appendChild(boom);
    setTimeout(() => boom.remove(), 500);
    return boom;
}
