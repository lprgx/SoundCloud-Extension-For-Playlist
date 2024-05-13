
class Extention {
    /**
     * @param {string} id
     * @param {{[key: string]: any} | undefined} data 
     * @param {"content" | "popup" | "worker"} from
     */
    static async message(id, data, from) {
        const message = {id, data: data || {}, from}
        
        const tabs = await chrome.tabs?.query({
            url: "*://*.soundcloud.com/*"
        })
        if(tabs) await Promise.all(
            tabs.map((tab) => chrome.tabs.sendMessage(tab.id, message))
        ).catch(() => {})
        await chrome.runtime.sendMessage(message).catch(() => {})

        return message
    }
    /**
     * 
     * @param {(message: Awaited<ReturnType<Extention.message>>) => any} handler 
     */
    static onMessage(handler) {
        chrome.runtime.onMessage.addListener(m => handler(m))
    }
}

class ExtentionPopup extends Extention {
    /**
     * @param {Parameters<ExtentionWorker.changeIcon>[0]} icon 
     */
    static changeIcon(icon) {
        return Extention.message("changeIcon", { icon }, "content")
    }

    /**
     * @param {Parameters<Extention.message>[0]} id 
     * @param {Parameters<Extention.message>[1]} data 
     */
    static message(id, data) {
        return Extention.message(id, data, "popup")
    }
}

class ExtentionContent extends Extention {
    /**
     * @param {Parameters<ExtentionWorker.changeIcon>[0]} icon 
     */
    static changeIcon(icon) {
        return Extention.message("changeIcon", { icon }, "content")
    }

    /**
     * @param {Parameters<Extention.message>[0]} id 
     * @param {Parameters<Extention.message>[1]} data 
     */
    static message(id, data) {
        return Extention.message(id, data, "content")
    }
}

class ExtentionWorker extends Extention {
    /**
     * @param {"active" | "icon" | "pause"} icon 
     */
    static changeIcon(icon) {
        chrome.action.setIcon({
            path: `/assets/icons/${icon}_128.png`
        })
    }

    /**
     * @param {Parameters<Extention.message>[0]} id 
     * @param {Parameters<Extention.message>[1]} data 
     */
    static message(id, data) {
        return Extention.message(id, data, "worker")
    }
}
