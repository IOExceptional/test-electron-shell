const app = require("app");
const autoUpdater = require("autoUpdater");
const os = require("os");

const UPDATE_SERVER_HOST = "localhost:";


function applyUpdater(window) {
    var version = app.getVersion();
    autoUpdater.addListener("update-available", (event) => {
        console.log("A new update is available");
    });
    autoUpdater.addListener("update-downloaded", (event, releaseNotes, releaseName, releaseDate, updateURL) => {
        console.log("A new update is ready to install", `Version ${releaseName} is downloaded and will be automatically installed on Quit`);
    });
    autoUpdater.addListener("error", (error) => {
        console.error(error);
    });
    autoUpdater.addListener("checking-for-update", (event) => {
        console.log("checking-for-update");
    });
    autoUpdater.addListener("update-not-available", () => {
        console.log("update-not-available");
    });
    autoUpdater.setFeedURL(`https://${UPDATE_SERVER_HOST}/update/${os.platform()}_${os.arch()}/${version}`);

    window.webContents.once("did-frame-finish-load", (event) => {
        autoUpdater.checkForUpdates();
    });
}

module.exports = applyUpdater;
