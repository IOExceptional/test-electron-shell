var app = require('app');
var BrowserWindow = require('browser-window');
var path = require('path');
var Menu = require("menu");
var fs = require('fs');
var MenuItem = require('menu-item');
var os = require('os');
// var autoUpdate = require("./autoUpdate");
var windowsSquirrel = require("./windowsSquirrel");


// Report crashes to our server.
require('crash-reporter').start();

if(os.platform() === "win32") {

    if (windowsSquirrel()) {
        return;
    }
}

var mainWindow = null;

var urlIn = null;

var readyCompleted = false;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function() {
    var protocol = require('protocol');
    var name = app.getName();
    protocol.interceptStringProtocol('mdesign', function(request, callback) {
        var url = request.url.substr(7);
        console.log(url);
    }, function(error) {
        if (error)
            console.error('Failed to register protocol');
    });
    createWindow();
    // Create the Application's main menu
    var template = [{
        label: name,
        submenu: [{
            label: 'About ' + name,
            role: 'about'
        }, {
            type: "separator"
        }, {
            label: "Quit",
            accelerator: "Command+Q",
            click: function() {
                app.quit();
            }
        }]
    }, {
        label: "Edit",
        submenu: [{
            label: "Undo",
            accelerator: "CmdOrCtrl+Z",
            role: "undo"
        }, {
            label: "Redo",
            accelerator: "Shift+CmdOrCtrl+Z",
            role: "redo"
        }, {
            type: "separator"
        }, {
            label: "Cut",
            accelerator: "CmdOrCtrl+X",
            role: "cut"
        }, {
            label: "Copy",
            accelerator: "CmdOrCtrl+C",
            role: 'copy'
        }, {
            label: "Paste",
            accelerator: "CmdOrCtrl+V",
            role: "paste"
        }, {
            label: "Select All",
            accelerator: "CmdOrCtrl+A",
            role: "selectAl"
        }]
    }, {
        label: 'View',
        submenu: [{
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click: function(item, focusedWindow) {
                if (focusedWindow) focusedWindow.reload();
            }
        }, {
            label: 'Toggle Full Screen',
            accelerator: (function() {
                if (process.platform == 'darwin') return 'Ctrl+Command+F';
                else return 'F11';
            })(),
            click: function(item, focusedWindow) {
                if (focusedWindow) focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
            }
        }, {
            label: 'Toggle Developer Tools',
            accelerator: (function() {
                if (process.platform == 'darwin') return 'Alt+Command+J';
                else return 'Ctrl+Shift+J';
            })(),
            click: function(item, focusedWindow) {
                if (focusedWindow) focusedWindow.toggleDevTools();
            }
        }, ]
    }, {
        label: 'Window',
        role: 'window',
        submenu: [{
            label: 'Minimize',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
        }, {
            label: 'Close',
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
        }, ]
    }];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

    mainWindow.webContents.on('did-finish-load', function() {
        if (mainWindow.webContents.getURL().indexOf("index.html") > -1) {
            mainWindow.webContents.executeJavaScript("setPlatformManually('osx')");
            mainWindow.webContents.executeJavaScript("setAssetsPath()");
        }
        if (urlIn !== null) {
            mainWindow.webContents.executeJavaScript("handleOpenURL(\"" + urlIn + "\");");
            urlIn = null;
        }
    });
    readyCompleted = true;
});

app.on('open-url', function(event, url) {
    event.preventDefault();
    if (readyCompleted === true) {
        mainWindow.webContents.executeJavaScript("handleOpenURL(\"" + url + "\");");
    } else {
        urlIn = url;
    }
});

app.on('open-file', function(event, url) {
    event.preventDefault();
    if (readyCompleted === true) {
        mainWindow.webContents.executeJavaScript("handleOpenURL(\"" + url + "\");");
    } else {
        urlIn = url;
    }
});

var createWindow = function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        title: "mDesign 10",
        width: 1100,
        height: 800,
        "web-preferences": {
            "web-security": false
        }
    });

    // autoUpdate(mainWindow);

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/www/index.html');

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
};
