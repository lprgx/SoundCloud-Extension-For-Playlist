class Controls {
    #player

    /**
     * @param {HTMLDivElement | null} e 
     */
    static isPlayerElement(e) {
        return (
            e?.classList.contains("playControls")
            && e?.classList.contains("m-visible")
        )
    }
    /**
     * @param {HTMLDivElement} player 
     */
    constructor(player) {
        if(!player) throw new Error("Invalid player given.")

        /**
         * @type {HTMLButtonElement}
         */
        this.skippingButton = player.querySelector(".skipControl")
        /**
         * @type {HTMLButtonElement}
         */
        this.playPauseButton = player.querySelector(".playControl")
        /**
         * @type {HTMLDivElement}
         */
        this.timeline = player.querySelector(".playbackTimeline__progressWrapper")

        this.#player = player;
    }
    get timeElapsed() {
        return parseInt(this.timeline.getAttribute("aria-valuenow"))
    }
    get playerStatus() {
        return this.playPauseButton.classList.contains("playing") ? "playing" : "paused"
    }
    skipTrack() {
        this.skippingButton.click()
    }
    destroy() {
        delete this;
    }
}