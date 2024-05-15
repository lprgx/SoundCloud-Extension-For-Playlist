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
    #adMode = false;
    /**
     * @param {HTMLDivElement} player 
     */
    constructor(player) {
        if(Controls.isPlayerElement(player)) this.playerControls = new Controls(player)
        else throw new Error("Invalid player given.");
        this.settings = null;
        
        this.#timelineObserver = new MutationObserver(() => {
            if(
                !this.#skippingActive
                || typeof this.#skippingWhenReachedSeconds !== "number"
            ) return;

            if(this.#adMode) {
                if(!this.playerControls.isAdPlaying) {
                    SoundCloudAutoSkipper.Debug("Ad finished. Stopping the 'Ad Mode'...")
                    this.#adMode= false
                    this.autoSetIcon();
                }
                return
            }else if(this.playerControls.isAdPlaying) {
                SoundCloudAutoSkipper.Debug("Ad detected. Setting the extension in 'Ad Mode'...")
                this.#adMode= true
                ExtentionContent.changeIcon("ad")
                return
            }

            if(this.playerControls.timeElapsed >= this.#skippingWhenReachedSeconds) {
                this.playerControls.skipTrack()
                SoundCloudAutoSkipper.Debug(`Track has been skipped after ${this.#skippingWhenReachedSeconds} seconds.`)
                this.#newTimeout()
            }
        })
        this.#timelineObserver.observe(this.playerControls.timeline, {
            attributes: true
        });

        this.#playPauseObserver = new MutationObserver(() => this.autoSetIcon());
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
        this.autoSetIcon();
        SoundCloudAutoSkipper.Debug("Starting Auto-Skipping...");
    }

    resetToRepeatPlaylist() {
        while(this.playerControls.repeatType !== "playlist") this.playerControls.repeatButton.click();
        SoundCloudAutoSkipper.Debug("Ajusted the repeat settings to set it as 'repeat all'.")
    }

    /**
     * @returns {Parameters<typeof ExtentionContent["changeIcon"]>[0]}
     */
    #getRequiredIcon() {
        return (
            this.settings.enabled && this.#skippingActive ? (
                this.playerControls.playerStatus === "playing" ? (
                    this.#adMode ? "ad" : "active"
                ) : "pause"
            ) : "icon"
        )
    }
    autoSetIcon() {
        return ExtentionContent.changeIcon(this.#getRequiredIcon());
    }

    destroy() {
        this.#timelineObserver.disconnect()
        this.#playPauseObserver.disconnect()
        delete this;
        SoundCloudAutoSkipper.Debug("An instance of Auto-Skipper has been destroyed.")
    }
}

/**
 * 
 * @param {HTMLDivElement?} player 
 */
async function createSkipper(player) {
    if(Skipper) deleteSkipper();
    Skipper = new SoundCloudAutoSkipper(
        player ?? document.querySelector(".playControls.m-visible")
    );
    await Skipper.reloadSettings();

    if(Skipper.settings.autoPlayOnLaunch) {
        SoundCloudAutoSkipper.Debug("Auto Playing is active. Playing will start automaticly...")
        if(Skipper.playerControls.playerStatus !== "playing") Skipper.playerControls.playPauseButton.click()
    }
}
function deleteSkipper() {
    Skipper?.destroy();
    Skipper = null;
    ExtentionContent.changeIcon("icon");
    SoundCloudAutoSkipper.Debug("Auto-Skipper has been disabled.")
}
/**
 * @param {Parameters<typeof createSkipper>[0]} player
 */
function tryCreateSkipper(player) {
    if(!isUserLoginIn()) return deleteSkipper() || null;
    createSkipper(player).then(() => {}).catch(() => deleteSkipper())
    return Skipper
}

const observer = new MutationObserver((records) => {
    for(const record of records) {
        if(
            Array.from(record.removedNodes)
            .find(Controls.isPlayerElement)
            || !isUserLoginIn()
        ) deleteSkipper();
        
        const playerAdded = Array.from(record.addedNodes).find(Controls.isPlayerElement);
        if(playerAdded) tryCreateSkipper(playerAdded)
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
window.addEventListener("beforeunload", () => {
    deleteSkipper();
})
window.addEventListener("load", () => {
    if(isUserLoginIn()) tryCreateSkipper()
})