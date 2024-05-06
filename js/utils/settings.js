const defaultSettings = {
    enabled: true,
    timeoutInSeconds: 30
}
const storage = chrome.storage.local

/**
 * @returns {Promise<typeof defaultSettings>}
 */
async function getSettings() {
    const storageContent = await storage.get();
    if(!storageContent?.settings) setSettings(defaultSettings)
    return storage.get().then(s => s.settings);
}
/**
 * @param {<typeof defaultSettings>} settings
 */
async function setSettings(settings) {
    await storage.set({ settings })
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
