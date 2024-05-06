console.log("Soundcloud Track Skipper is ready to use!");

const isLogedIn = !!document.querySelector(".header__userNavButton.header__userNavUsernameButton");
console.log(isLogedIn);

/**
 * @param {HTMLElement} e 
 */
function isElementPlayControls(e) {
    return e.classList.contains("playControls")
}

/**
 * 
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
function generateTimoutNumber(min, max) {
    return Math.floor(
        Math.random() * (max - min)
    ) + min
}

/**
 * @param {HTMLDivElement} player 
 */
function skipTrack(player) {
    const btn = player.querySelector(".skipControl");
    if(btn) btn.click();
}

/**
 * @param {HTMLDivElement} player 
 * @returns {() => void} A function to stop the auto-skipping process
 */
async function startAutoSkipping(player) {
    let active = true;
    const settings = await getSettings();
    if(!settings.enabled) return;

    const desactive = () => active = false;
    const tick = () => {
        if(!active) return
        skipTrack(player)
        setTimeout(() => tick(), generateTimoutNumber(
            settings.timeoutInSeconds - settings.randomnessInSeconds,
            settings.timeoutInSeconds + settings.randomnessInSeconds
        ))
    }

    tick()
    return desactive
}

async function main() {
    /**
     * @type {null | () => null}
     */
    let desactivateSkipping = null;

    /**
     * @type {null | HTMLDivElement}
     */
    let existingPlayer = document.querySelector(".playControls");
    if(existingPlayer) desactivateSkipping = startAutoSkipping(existingPlayer);

    chrome.runtime.onMessage.addListener(async (message, _, answer) => {
        const { id, data } = message
        switch (id) {
            case "settingsUpdated":
            case "reloadSettings":
                settings= await getSettings();
                break;
            default:
                break;
        }
    })

    const observer = new MutationObserver((records) => {
        for(const record of records) {
            if(
                Array.from(record.removedNodes)
                .find(isElementPlayControls)
            ) {
                playerElement = null
                desactivateSkipping?.()
            };
            
            const playerAdded = Array.from(record.addedNodes).find(isElementPlayControls);
            if(playerAdded) {
                playerElement= playerAdded
                desactivateSkipping = startAutoSkipping(playerAdded)
            };
        }
    })
    observer.observe(document.getElementById("app"), {childList: true});
}

main()