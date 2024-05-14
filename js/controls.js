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
        this.skippingButton = player.querySelector(".skipControl__next")
        /**
         * @type {HTMLButtonElement}
         */
        this.playPauseButton = player.querySelector(".playControl")
        /**
         * @type {HTMLButtonElement}
         */
        this.repeatButton = player.querySelector(".repeatControl")
        /**
         * @type {HTMLDivElement}
         */
        this.timeline = player.querySelector(".playbackTimeline__progressWrapper")
        /**
         * @type {HTMLDivElement}
         */
        this.soungBadge = player.querySelector(".playbackSoundBadge")
        /**
         * @type {HTMLDivElement}
         */
        this.panel = player.querySelector(".playControls__panel")

        this.#player = player;
    }
    get timeElapsed() {
        return parseInt(this.timeline.getAttribute("aria-valuenow"))
    }
    get maxTime() {
        return parseInt(this.timeline.getAttribute("aria-valuemax"))
    }
    get playerStatus() {
        return this.playPauseButton.classList.contains("playing") ? "playing" : "paused"
    }
    get repeatType() {
        return (
            this.repeatButton.classList.contains("m-none") ? "none" :
            this.repeatButton.classList.contains("m-one") ? "song" : "playlist"
        )
    }
    get isAdPlaying() {
        return this.soungBadge.classList.contains("is-adPlaying");
    }
    skipTrack() {
        this.skippingButton.click()
    }
    destroy() {
        delete this;
    }
}