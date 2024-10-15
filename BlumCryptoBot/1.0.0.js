// ==TeleModScript==
// @name            Blum
// @version         1.0.0
// @description     Blum Auto Clicker!!
// @icon            https://raw.githubusercontent.com/Zelegram/Scripts/main/BlumCryptoBot/icon.png
// @author          TeleMod
// @run-at          load-done
// ==/TeleModScript==

(async function () {
    // Keep the screen on while the bot auto-plays it.
    // TeleMod.setKeepScreenOn(true);

    let GAME_SETTINGS = {
        BombHits: 0,
        IceHits: 2,
        FlowerSkipPercentage: Math.floor(Math.random() * 11) + 15,
        MinDelayMs: 2000,
        MaxDelayMs: 5000
    };
    
    let gameState = {
        isGamePaused: true,
        isGameOver: false,
        bombHits: 0,
        bombHits: 0
    }
    
    // Initial game setup
    const BOMB_COLOR = hexToRgb("#b8b6b0");
    const CLOVER_COLOR = hexToRgb("#3ddb04");
    const ICE_COLOR = hexToRgb("#5ebbd2");
    
    function findAndClickObjects(canvas) {
        const ctx = canvas.getContext('2d');  // Get the canvas 2D context
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
    
        for (let y = 0; y < canvas.height; y += 5) {  // Increment by 5 for performance optimization
            for (let x = 0; x < canvas.width; x += 5) {
                const i = (y * canvas.width + x) * 4;
                const pixelColor = [data[i], data[i + 1], data[i + 2]];
    
                if (colorMatch(pixelColor, CLOVER_COLOR)) {
                    processClover(canvas, x, y);
                } else if (colorMatch(pixelColor, ICE_COLOR)) {
                    processIce(canvas, x, y);
                    return;
                } else if (colorMatch(pixelColor, BOMB_COLOR)) {
                    processBomb(canvas, x, y);
                }
            }
        }
    }
    
    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }
    
    function colorMatch(c1, c2, tolerance = 5) {
        return Math.abs(c1[0] - c2[0]) <= tolerance &&
            Math.abs(c1[1] - c2[1]) <= tolerance &&
            Math.abs(c1[2] - c2[2]) <= tolerance;
    }
    
    function processClover(element, x, y) {
        console.log(`Flower found at (${x}, ${y})`);
        const shouldSkip = Math.random() < (GAME_SETTINGS.FlowerSkipPercentage / 100);
        if (!shouldSkip) {
            clickXY(element, x, y);
        }
    }
    
    function processBomb(element, x, y) {
        console.log(`Bomb found at (${x}, ${y})`);
        if (gameState.bombHits < GAME_SETTINGS.BombHits) {
            clickXY(element, x, y);
            gameState.bombHits++;
        }
    
    }
    
    function processIce(element, x, y) {
        console.log(`Ice found at (${x}, ${y})`);
        if (gameState.iceHits < GAME_SETTINGS.IceHits) {
            clickXY(element, x, y);
            gameState.iceHits++;
        }
    }
    
    function clickXY(element, x, y) {
        if (!element) return;
    
        // Simulate touch events for mobile browsers
        const touch = new Touch({
            identifier: Date.now(),
            target: element,
            clientX: x,
            clientY: y,
            pageX: x,
            pageY: y,
            screenX: x,
            screenY: y
        });
    
        const touchList = [touch];
    
        ['touchstart', 'touchend'].forEach(eventType => {
            const touchEvent = new TouchEvent(eventType, {
                bubbles: true,
                cancelable: true,
                touches: touchList,
                targetTouches: touchList,
                changedTouches: touchList,
                shiftKey: true
            });
            element.dispatchEvent(touchEvent);
        });
    
        // Simulate pointer events for both desktop and mobile browsers
        ['pointerdown', 'pointerup', 'click'].forEach(eventType => {
            const pointerEvent = new PointerEvent(eventType, {
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y,
                pointerType: "touch"
            });
            element.dispatchEvent(pointerEvent);
        });
    
        // Simulate mouse events for desktop browsers
        ['mousedown', 'mouseup', 'click'].forEach(eventType => {
            const mouseEvent = new MouseEvent(eventType, {
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y
            });
            element.dispatchEvent(mouseEvent);
        });
    }
    
    function checkGameCompletion() {
        const rewardElement = document.querySelector('#app > div > div > div.content > div.reward');
        if (rewardElement && !gameState.isGameOver) {
            gameState.isGameOver = true;
            if (!gameState.isGamePaused) {
                startNewGame();
            }
        }
    }
    
    function startNewGame() {
        setTimeout(() => {
            const newGameButton = document.querySelector("#app > div > div > div.buttons > button:nth-child(2)");
            if (newGameButton) {
                const playPasses = window.__NUXT__.state.$s$0olocQZxou.playPasses || parseInt(newGameButton.textContent.replace(/\D+/g, ""));
                if (playPasses > 0) newGameButton.click();
            }
            gameState.isGameOver = false;
        }, getRandomDelay());
    }
    
    function getRandomDelay() {
        return Math.random() * (GAME_SETTINGS.MaxDelayMs - GAME_SETTINGS.MinDelayMs) + GAME_SETTINGS.MinDelayMs;
    }
    
    function startWatch() {
        const canvas = document.querySelector('.canvas-wrapper canvas');
        if (canvas) {
            findAndClickObjects(canvas);
        }
    }
    
    // Mutation Observer to detect game state changes (e.g., game over)
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                checkGameCompletion();
            }
        }
    });
    
    let gameInterval = null;
    function toggleGame() {
        // Observe the #app element for changes
        const appElement = document.querySelector('#app');
        if (appElement) {
            if (gameState.isGamePaused) {
                observer.disconnect();
            } else {
                observer.observe(appElement, { childList: true, subtree: true });
            }
        }
    
        if (gameState.isGamePaused) {
            clearTimeout(gameInterval);
        } else {
            const playButton = document.querySelector('.play-btn');
            if (playButton) {
                playButton.click();
            }
            gameInterval = setInterval(startWatch, 500);
        }
    }
    
    function createMenu() {
        const controlsContainer = document.createElement('div');
        controlsContainer.style.position = 'fixed';
        controlsContainer.style.bottom = '0';
        controlsContainer.style.right = '0';
        controlsContainer.style.zIndex = '9999';
        controlsContainer.style.backgroundColor = 'black';
        controlsContainer.style.padding = '10px 20px';
        controlsContainer.style.borderRadius = '10px';
        controlsContainer.style.cursor = 'move';
        document.body.appendChild(controlsContainer);
    
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'center';
        controlsContainer.appendChild(buttonsContainer);
    
        const hiddenLink = document.createElement('div');
        hiddenLink.id = 'logDisplay';
        hiddenLink.style.color = 'white';
        hiddenLink.style.marginBottom = '10px';
        controlsContainer.prepend(hiddenLink);
        hiddenLink.innerHTML = `<a href="https://t.me/ZelegramApp" target="_blank" style="color: white; text-decoration: none;">Blum by TeleMod</a>`;
    
        const pauseButton = document.createElement('button');
        pauseButton.textContent = gameState.isGamePaused ? '▶' : '❚❚';
        pauseButton.style.padding = '4px 8px';
        pauseButton.style.backgroundColor = '#5d2a8f';
        pauseButton.style.color = 'white';
        pauseButton.style.border = 'none';
        pauseButton.style.borderRadius = '10px';
        pauseButton.style.cursor = 'pointer';
        pauseButton.style.marginRight = '5px';
        pauseButton.onclick = togglePause;
        buttonsContainer.appendChild(pauseButton);
    
        function togglePause() {
            gameState.isGamePaused = !gameState.isGamePaused;
            pauseButton.textContent = gameState.isGamePaused ? '▶' : '❚❚';
            toggleGame();
        }
    }
    
    createMenu();

})();