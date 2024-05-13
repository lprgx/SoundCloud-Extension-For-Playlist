function isUserLoginIn() {
    return !!document.querySelector(".header__userNavButton.header__userNavUsernameButton");
}

/**
 * @type {SoundCloudAutoSkipper | null}
 */
let Skipper = null;
class SoundCloudAutoSkipper {
    /**
     * @param {number} min 
     * @param {number} max 
     */
    static generateTimeoutNumber(min, max) {
        return (Math.floor(
            Math.random() * (max - min)
        ) + min)
    }
    static Debug(...messages) {
        console.log("[SOUNDCLOUD-SKIPPER]> ", ...messages)
    }

    /**
     * @type {Controls | null}
     */
    playerControls;
    #skippingActive = false;
    /**
     * @type {number | null}
     */
    #skippingWhenReachedSeconds = null;
    #timelineObserver;
    #playPauseObserver;
    constructor() {
        this.createPlayer();
        this.settings = null;

        if(!this.playerControls) throw new Error("Controls has not been found.");
        
        this.#timelineObserver = new MutationObserver(() => {
            if(
                !this.#skippingActive
                || typeof this.#skippingWhenReachedSeconds !== "number"
            ) return;
            if(this.playerControls.timeElapsed >= this.#skippingWhenReachedSeconds) {
                this.playerControls.skipTrack()
                SoundCloudAutoSkipper.Debug(`Track has been skipped after ${this.#skippingWhenReachedSeconds} seconds.`)
                this.#newTimeout()
            }
        })
        this.#timelineObserver.observe(this.playerControls.timeline, {
            attributes: true
        });

        this.#playPauseObserver = new MutationObserver(() => {
            if(!this.#skippingActive) return
            ExtentionContent.changeIcon(this.playerControls.playerStatus === "playing" ? "active" : "pause")
        })
        this.#playPauseObserver.observe(this.playerControls.playPauseButton, {
            attributes: true
        })
        this.playerControls.repeatButton.addEventListener("click", (ev) => {
            if(
                ev.isTrusted
                && this.#skippingActive
                && this.playerControls.repeatType !== "playlist"
            ) this.resetToRepeatPlaylist();
        })

        SoundCloudAutoSkipper.Debug("Skipper Created. Waiting for settings to be loaded.")
    }

    createPlayer() {
        if(this.playerControls) return
        const element = document.querySelector(".playControls.m-visible")
        if(Controls.isPlayerElement(element)) this.playerControls = new Controls(element)
        return this.playerControls
    }
    async reloadSettings() {
        this.settings= await getSettings();
        SoundCloudAutoSkipper.Debug("Settings has been (re)loaded.")
        if(this.settings.enabled) await this.startAutoSkipping()
        else this.stopAutoSkipping()
    }

    #newTimeout() {
        if(!this.settings) throw new Error("Settings has been fetched.")
        this.#skippingWhenReachedSeconds= Math.max(
            5, SoundCloudAutoSkipper.generateTimeoutNumber(
                this.settings.timeoutInSeconds - this.settings.randomnessInSeconds,
                this.settings.timeoutInSeconds + this.settings.randomnessInSeconds
            )
        )
        SoundCloudAutoSkipper.Debug("Timeout has been changed.")
    }

    stopAutoSkipping() {
        this.#skippingActive= false;
        SoundCloudAutoSkipper.Debug("Auto-Skipping has been stopped.");
        ExtentionContent.changeIcon("icon");
    }
    async startAutoSkipping() {
        this.resetToRepeatPlaylist();
        this.#skippingActive= true;
        this.#newTimeout();
        ExtentionContent.changeIcon(this.playerControls.playerStatus === "playing" ? "active" : "pause")
        SoundCloudAutoSkipper.Debug("Starting Auto-Skipping...");
    }

    resetToRepeatPlaylist() {
        while(this.playerControls.repeatType !== "playlist") this.playerControls.repeatButton.click();
        SoundCloudAutoSkipper.Debug("Ajusted the repeat settings to set it as 'repeat all'.")
    }

    destroy() {
        this.#timelineObserver.disconnect()
        this.#playPauseObserver.disconnect()
        delete this;
        SoundCloudAutoSkipper.Debug("An instance of Auto-Skipper has been destroyed.")
    }
}

function createSkipper() {
    if(Skipper) deleteSkipper();
    Skipper = new SoundCloudAutoSkipper();
    return Skipper.reloadSettings();
}
function deleteSkipper() {
    Skipper?.destroy();
    Skipper = null;
    ExtentionContent.changeIcon("icon");
    SoundCloudAutoSkipper.Debug("Auto-Skipper has been disabled.")
}
function tryCreateSkipper() {
    if(!isUserLoginIn()) return deleteSkipper() || null;
    
    try { createSkipper().then(() => {}) } 
    catch (e) { deleteSkipper() }
    return Skipper
}

const observer = new MutationObserver((records) => {
    for(const record of records) {
        if(
            Array.from(record.removedNodes)
            .find(isElementPlayControls)
            || !isUserLoginIn()
        ) deleteSkipper();
        
        const playerAdded = Array.from(record.addedNodes).find(Controls.isPlayerElement);
        if(playerAdded) tryCreateSkipper()
    }
})

ExtentionContent.onMessage(async (message) => {
    const { id, data, from } = message
    SoundCloudAutoSkipper.Debug(`Received message ${id} from ${from}. Data:`, data)

    switch (id) {
        case "reloadSettings":
            SoundCloudAutoSkipper.Debug("[SOUNDCLOUD-SKIPPER]> Settings has been updated. Reloading...");
            await Skipper?.reloadSettings()
            break;
        default:
            break;
    }
})
observer.observe(document.getElementById("app"), {childList: true});
if(isUserLoginIn()) tryCreateSkipper()