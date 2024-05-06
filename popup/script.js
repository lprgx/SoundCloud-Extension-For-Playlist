const form = document.querySelector("form");
const enabledInput = form.querySelector("input#active");
const timeoutInput = form.querySelector("input#skipTm");
const randomnessInput = form.querySelector("input#randomness")

/**
 * @param {keyof ReturnType<typeof getSettings>} name 
 */
async function changeSettingsProp(name, value) {
    await setSettingsProperty(name, value);

    return chrome.runtime.sendMessage({id: "settingsUpdated", data: {
        name, value
    }})
}
function settingsHasBeenUpdated() {
    return chrome.runtime.sendMessage({id: "reloadSettings"})
}
/**
 * 
 * @param {ReturnType<typeof getSettings>} settings 
 */
async function changeSettings(settings) {
    console.log(settings);
    await setSettings(settings);
    return settingsHasBeenUpdated();
}

chrome.runtime.onMessage.addListener(async (message, _, answer) => {
    const { id, data } = message

    switch (id) {
        case "settingsUpdated":
        case "reloadSettings":
            syncFormWithSettings()
            break;
        default:
            break;
    }
})

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

form.addEventListener("change", () => {
    /**
     * @type {typeof defaultSettings}
     */
    const newSettings = {
        enabled: enabledInput.checked,
        timeoutInSeconds: parseInt(timeoutInput.value),
        randomnessInSeconds: parseInt(randomnessInput.value)
    }
    changeSettings(newSettings)
    isSync(false)
})

syncFormWithSettings();
