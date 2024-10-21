// ==TeleModScript==
// @name            Tomarket
// @version         1.0.0
// @description     Tomarket Auto Clicker!!
// @icon            https://raw.githubusercontent.com/Zelegram/Scripts/main/Tomarket_ai_bot/icon.png
// @author          TeleMod
// @run-at          load-done
// ==/TeleModScript==

(async function () {
    // Keep the screen on while the bot auto-plays it.
    TeleMod.setKeepScreenOn(true);

    let GAME_SETTINGS = {
        bomb: 1,
        ice: 2,
        autoClickPlay: false,
    };

    let isGamePaused = true;
    let isSettingsOpen = false;

    try {
        const defaultGameStats = () => ({
            isGameOver: false,
            bombClicked: 0,
            iceClicked: 0,
            rewardClicked: 0
        });

        let gameStats = defaultGameStats();

        const originalPush = Array.prototype.push;
        Array.prototype.push = function (...items) {
            if (!isGamePaused) {
                items.forEach(item => handleGameElement(item));
            }
            return originalPush.apply(this, items);
        };

        function handleGameElement(element) {
            if (!element || !element.label || !["reward", "penalty", "time"].includes(element.label)) return;
            const delay = Math.random() * 500 + 1000; // Random delay between 1000 and 1500ms
            setTimeout(() => processElement(element), delay);
        }

        function processElement(element) {
            try {
                if (!element.x) return;
                switch (element.label) {
                    case "reward":
                        handleRewardClick(element);
                        break;
                    case "penalty":
                        handlePenaltyClick(element);
                        break;
                    case "time":
                        handleIceClick(element);
                        break;
                    default:
                        console.log(`Unknown element type: ${element}`);
                }
            } catch (error) {
                //
            }
        }

        // Function to handle reward clicks
        function handleRewardClick(element) {
            clickElement(element);
            gameStats.rewardClicked++;
        }

        // Function to handle penalty clicks
        function handlePenaltyClick(element) {
            console.log("BOMB Click", `Current = ${gameStats.bombClicked + 1}, Max = ${GAME_SETTINGS.bomb}`);
            if (gameStats.bombClicked < GAME_SETTINGS.bomb) {
                clickElement(element);
                gameStats.bombClicked++;
            } else {
                console.log("SKIP");
            }
        }

        // Function to handle ice clicks (time element)
        function handleIceClick(element) {
            console.log("ICE Click", `Current = ${gameStats.iceClicked + 1}, Max = ${GAME_SETTINGS.ice}`);
            if (gameStats.iceClicked < GAME_SETTINGS.ice) {
                clickElement(element);
                gameStats.iceClicked++;
            } else {
                console.log("SKIP");
            }
        }

        function clickElement(element) {
            // element.onpointerdown();
            element.onpointerover();
        }

        function checkGameCompletion() {
            const rewardElement = document.querySelector("#root > div > div");
            rewardElement.childElementCount
            if (rewardElement && rewardElement.className.includes("gameResult") && !gameStats.isGameOver) {
                gameStats.isGameOver = true;
            }
        }

        function getNewGameDelay() {
            return Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
        }

        function checkAndClickPlayButton() {
            // Start button
            const playButtons = [];
            const playButton = document.querySelector("div.absolute");
            if (playButton) playButtons.push(playButton);

            // Continues button
            document.querySelectorAll('div').forEach(e => {
                if (e.className.includes('btn') && /Play/.test(e.textContent) && e.childElementCount == 0) {
                    playButtons.push(e);
                }
            })

            playButtons.forEach(button => {
                if (!isGamePaused && GAME_SETTINGS.autoClickPlay) {
                    setTimeout(() => {
                        button.click();

                        console.log("Reset Stats!");
                        // Reset stats
                        gameStats = defaultGameStats();
                    }, getNewGameDelay());
                }
            });
        }

        function continuousPlayButtonCheck() {
            checkAndClickPlayButton();
            setTimeout(continuousPlayButtonCheck, 1000);
        }

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    checkGameCompletion();
                }
            }
        });

        const appElement = document.querySelector('#app');
        if (appElement) {
            observer.observe(appElement, { childList: true, subtree: true });
        }

        const controlsContainer = document.createElement('div');
        controlsContainer.style.position = 'fixed';
        controlsContainer.style.top = '0';
        controlsContainer.style.left = '50%';
        controlsContainer.style.transform = 'translateX(-50%)';
        controlsContainer.style.zIndex = '9999';
        controlsContainer.style.backgroundColor = 'black';
        controlsContainer.style.padding = '10px 20px';
        controlsContainer.style.borderRadius = '10px';
        document.body.appendChild(controlsContainer);

        const OutGamePausedTrue = document.createElement('a');
        OutGamePausedTrue.textContent = "Tomarket Clicker";
        OutGamePausedTrue.style.color = 'white';
        OutGamePausedTrue.style.display = 'block';
        OutGamePausedTrue.style.textAlign = 'center';
        OutGamePausedTrue.href = "https://t.me/ZelegramApp";
        OutGamePausedTrue.style.paddingBottom = '10px';
        controlsContainer.appendChild(OutGamePausedTrue);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'center';
        controlsContainer.appendChild(buttonsContainer);

        const pauseButton = document.createElement('button');
        pauseButton.textContent = '▶';
        pauseButton.style.padding = '4px 8px';
        pauseButton.style.backgroundColor = '#4CAF50';
        pauseButton.style.color = 'white';
        pauseButton.style.border = 'none';
        pauseButton.style.borderRadius = '10px';
        pauseButton.style.cursor = 'pointer';
        pauseButton.style.marginRight = '5px';
        pauseButton.onclick = () => {
            toggleGamePause();
        };
        buttonsContainer.appendChild(pauseButton);

        const settingsButton = document.createElement('button');
        settingsButton.textContent = '⛯';
        settingsButton.style.padding = '4px 8px';
        settingsButton.style.backgroundColor = '#4CAF50';
        settingsButton.style.color = 'white';
        settingsButton.style.border = 'none';
        settingsButton.style.borderRadius = '10px';
        settingsButton.style.cursor = 'pointer';
        settingsButton.onclick = toggleSettings;
        buttonsContainer.appendChild(settingsButton);

        const settingsContainer = document.createElement('div');
        settingsContainer.style.display = 'none';
        settingsContainer.style.marginTop = '10px';
        controlsContainer.appendChild(settingsContainer);

        function toggleSettings() {
            isSettingsOpen = !isSettingsOpen;
            if (isSettingsOpen) {
                settingsContainer.style.display = 'block';
                settingsContainer.innerHTML = '';

                const table = document.createElement('table');
                table.style.color = 'white';

                const items = [
                    { label: '💣 Bomb', settingName: 'bomb' },
                    { label: '🧊 Ice', settingName: 'ice' }
                ];

                items.forEach(item => {
                    const row = table.insertRow();

                    const labelCell = row.insertCell();
                    labelCell.textContent = item.label;

                    const inputCell = row.insertCell();
                    const inputElement = document.createElement('input');
                    inputElement.type = 'number';
                    inputElement.value = GAME_SETTINGS[item.settingName];
                    inputElement.min = 0;
                    inputElement.max = 100;
                    inputElement.style.width = '50px';
                    inputElement.addEventListener('input', () => {
                        GAME_SETTINGS[item.settingName] = parseInt(inputElement.value, 10);
                    });
                    inputCell.appendChild(inputElement);
                });

                settingsContainer.appendChild(table);
            } else {
                settingsContainer.style.display = 'none';
            }
        }

        function toggleGamePause() {
            isGamePaused = !isGamePaused;
            if (isGamePaused) {
                pauseButton.textContent = '▶';
                GAME_SETTINGS.autoClickPlay = false;
            } else {
                pauseButton.textContent = '❚❚';
                GAME_SETTINGS.autoClickPlay = true;
                continuousPlayButtonCheck();
            }
        }

    } catch (e) {
        console.error("!TomarketGame error:", e);
    }

})();