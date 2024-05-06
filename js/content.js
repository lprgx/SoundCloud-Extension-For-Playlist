console.log("Soundcloud Track Skipper is ready to use!");

chrome.runtime.onMessage.addListener((message, _, answer) => {
    const { id, data } = message
    if(id === "settingsUpdated") settings[data.name] = data.value;
})

const isLogedIn = !!document.querySelector(".header__userNavButton.header__userNavUsernameButton");
console.log(isLogedIn);

async function main() {
    console.log(await getSettings());
}

main()