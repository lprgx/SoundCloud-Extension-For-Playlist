const form = document.querySelector("form");
const enabledInput = form.querySelector("input#active");
const timeoutInput = form.querySelector("input#skipTm");
const randomnessInput = form.querySelector("input#randomness");

/**
 * 
 * @param {ReturnType<typeof getSettings>} settings 
 */
async function changeSettings(settings) {
    await setSettings(settings);
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
    timeoutInput.value = settings.timeoutInSeconds
    randomnessInput.value = settings.randomnessInSeconds

    isSync(true)
}

form.addEventListener("input", () => {
    const timeoutInSeconds = parseInt(timeoutInput.value);
    const randomnessInSeconds = parseInt(randomnessInput.value);
    if(
        isNaN(timeoutInSeconds)
        || isNaN(randomnessInSeconds)
    ) return;

    /**
     * @type {typeof defaultSettings}
     */
    const newSettings = {
        enabled: enabledInput.checked,
        timeoutInSeconds, randomnessInSeconds
    }
    changeSettings(newSettings)
    isSync(false)
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
        case "changeIcon":
            ExtentionPopup.changeIcon(data.icon);
        default:
            break;
    }
})
syncFormWithSettings();
