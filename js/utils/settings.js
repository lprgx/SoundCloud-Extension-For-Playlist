const defaultSettings = {
    enabled: true,
    autoPlayOnLaunch: true,
    timeoutInSeconds: 35,
    randomnessInSeconds: 5
}
const storage = chrome.storage.local

/**
 * @returns {Promise<typeof defaultSettings>}
 */
async function getSettings() {
    /**
     * @type {{settings: typeof defaultSettings}}
     */
    const storageContent = await storage.get();
    if(!storageContent?.settings) return setSettings(defaultSettings)
    
    const { settings } = storageContent
    const validSettingsKeys = Object.keys(defaultSettings);
    for(const key in settings) {
        if(
            !validSettingsKeys.includes(key)
            || typeof defaultSettings[key] !== typeof settings[key]
        ) {
            console.log("Settings has been invalidated. Reset to the default ones.");
            return setSettings(defaultSettings)
        }
    }

    return storageContent.settings
}
/**
 * @param {typeof defaultSettings} settings
 */
async function setSettings(settings) {
    await storage.set({ settings })
    return {...settings}
}
/**
 * @param {string} prop 
 * @param {any} value 
 */
async function setSettingsProperty(prop, value) {
    const current= await getSettings()
    current[prop] = value
    return setSettings(current)
}

/**
 * @param {(current: typeof defaultSettings) => any} handler 
 */
async function modifySettings(handler) {
    const current = await getSettings()
    handler(current)
    return setSettings(current)
}
