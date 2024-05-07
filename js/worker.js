importScripts(
    "./utils/extention.js"
);

ExtentionWorker.onMessage((message) => {
    const { id, data, from } = message
    console.log(`Received message ${id} from ${from}. Data:`, data);

    switch (id) {
        case "changeIcon":
            ExtentionWorker.changeIcon(data.icon);
        default:
            break;
    }
})