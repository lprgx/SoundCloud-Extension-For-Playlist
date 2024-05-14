const form = document.querySelector("form");
const enabledInput = form.querySelector("input#active");
const autoStartInput = form.querySelector("input#autoStart");
const timeoutInput = form.querySelector("input#skipTm");
const randomnessInput = form.querySelector("input#randomness");
const randomnessValue = document.querySelector(".currentRandomness");

/**
 * 
 * @param {ReturnType<typeof getSettings>} settings 
 */
async function changeSettings(settings) {
    await setSettings(settings);
    syncFormWithSettings();
    return ExtentionPopup.message("reloadSettings");
}

/**
 * 
 * @param {boolean} value 
 */
function isSync(value) {
    document.body.setAttribute("data-sync", value)
}
async function syncFormWithSettings() {
    const settings = await getSettings()
    
    enabledInput.checked = settings.enabled
    autoStartInput.checked = settings.autoPlayOnLaunch
    timeoutInput.value = settings.timeoutInSeconds
    randomnessInput.value = settings.randomnessInSeconds
    randomnessValue.innerText = randomnessInput.value

    isSync(true)
}

form.addEventListener("input", () => {
    isSync(false)
    const timeoutInSeconds = parseInt(timeoutInput.value);
    const randomnessInSeconds = parseInt(randomnessInput.value);
    if(
        isNaN(timeoutInSeconds)
        || isNaN(randomnessInSeconds)
        || timeoutInSeconds < parseInt(timeoutInput.getAttribute("min"))
        || timeoutInSeconds > parseInt(timeoutInput.getAttribute("max"))
    ) return;

    /**
     * @type {typeof defaultSettings}
     */
    const newSettings = {
        enabled: enabledInput.checked,
        autoPlayOnLaunch: autoStartInput.checked,
        timeoutInSeconds, randomnessInSeconds
    }
    changeSettings(newSettings)
})
form.addEventListener("reset", () => {
    isSync(false)
    changeSettings({...defaultSettings})
})

ExtentionPopup.onMessage((message) => {
    const { id, data, from } = message
    console.log(`Received message ${id} from ${from}. Data:`, data)

    switch (id) {
        case "reloadSettings":
            syncFormWithSettings()
            break;
        case "skippingStatusUpdate":
            changeState(data.active);
            break;
        default:
            break;
    }
})
syncFormWithSettings();
