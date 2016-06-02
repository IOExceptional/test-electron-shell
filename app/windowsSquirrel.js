const app = require('app');

module.exports = function () {
    const ChildProcess = require('child_process');
    const path = require('path');
    const regedit = require('regedit');
    const fs = require('fs');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = process.execPath;
    const debugFile = path.resolve(rootAtomFolder, "init.txt");

    fs.writeFileSync(debugFile, '1');

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
        } catch (err) {
            console.error(`There was a problem during process spawning. Please report to CommonTime: ${err}`);
        }

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    function uninstallWindows () {
        fs.appendFileSync(debugFile, '5');
        regedit.deleteKey([
            "HKEY_CLASSES_ROOT\\.mdesign",
            "HKEY_CLASSES_ROOT\\.mdesign\\DefaultIcon",
            "HKEY_CLASSES_ROOT\\.mdesign\\Shell",
            "HKEY_CLASSES_ROOT\\.mdesign\\Shell\\Open",
            "HKEY_CLASSES_ROOT\\.mdesign\\Shell\\Open\\command",
            "HKEY_CLASSES_ROOT\\mdesign",
            "HKEY_CLASSES_ROOT\\mdesign\\DefaultIcon",
            "HKEY_CLASSES_ROOT\\mdesign\\Shell",
            "HKEY_CLASSES_ROOT\\mdesign\\Shell\\Open",
            "HKEY_CLASSES_ROOT\\mdesign\\Shell\\Open\\command"
        ], function(err) {
            console.error("Error createing registry keys", err);
        });

        // Remove desktop and start menu shortcuts
        var removeChildProcess = spawnUpdate(['--removeShortcut=' + exeName]);
        removeChildProcess.on("close", function () {
            app.quit();
        });
    }

    function installWindows() {
        fs.appendFileSync(debugFile, '4');
        regedit.createKey([
            "HKEY_CLASSES_ROOT\\.mdesign",
            "HKEY_CLASSES_ROOT\\.mdesign\\DefaultIcon",
            "HKEY_CLASSES_ROOT\\.mdesign\\Shell",
            "HKEY_CLASSES_ROOT\\.mdesign\\Shell\\Open",
            "HKEY_CLASSES_ROOT\\.mdesign\\Shell\\Open\\command",
            "HKEY_CLASSES_ROOT\\mdesign",
            "HKEY_CLASSES_ROOT\\mdesign\\DefaultIcon",
            "HKEY_CLASSES_ROOT\\mdesign\\Shell",
            "HKEY_CLASSES_ROOT\\mdesign\\Shell\\Open",
            "HKEY_CLASSES_ROOT\\mdesign\\Shell\\Open\\command"
        ], function(err) {
            console.error("Error createing registry keys", err);
        });

        regedit.putValue({
            "HKEY_CLASSES_ROOT\\.mdesign": {
                '@': {
                    value: ".mdesign",
                    type: 'REG_SZ'
                },
                "mDesign File Association": {
                    value: '',
                    type: 'REG_SZ'
                }
            },
            "HKEY_CLASSES_ROOT\\.mdesign\\DefaultIcon": {
                '@': {
                    value: process.execPath,
                    type: 'REG_SZ'
                }
            },
            "HKEY_CLASSES_ROOT\\.mdesign\\Shell\\Open\\command": {
                '@': {
                    value: process.execPath,
                    type: 'REG_SZ'
                }
            },
            "HKEY_CLASSES_ROOT\\mdesign": {
                '@': {
                    value: "URL:mdesign Protocol",
                    type: 'REG_SZ'
                },
                'URL Protocol': {
                    value: '',
                    type: 'REG_SZ'
                }
            },
            "HKEY_CLASSES_ROOT\\mdesign\\DefaultIcon": {
                '@': {
                    value: process.execPath,
                    type: 'REG_SZ'
                }
            },
            "HKEY_CLASSES_ROOT\\mdesign\\Shell\\Open\\command": {
                '@': {
                    value: process.execPath,
                    type: 'REG_SZ'
                }
            }
        }, function(err) {
            console.error("Error saving value to keys", err);
        });
    }

    function updatedWindows () {
        fs.appendFileSync(debugFile, '6');
        // Install desktop and start menu shortcuts
        var createChildProcess = spawnUpdate(['--createShortcut=' + exeName, "Desktop"]);
        createChildProcess.on("close", function () {
            app.quit();
        });
    }

    function handleSquirrelEvent() {
        fs.appendFileSync(debugFile, '2');
        if (process.argv.length !== 1) {
            fs.appendFileSync(debugFile, '3');
            return false;
        }

        const squirrelEvent = process.argv[1];
        switch (squirrelEvent) {
            case '--squirrel-install':
                installWindows();
            case '--squirrel-updated':
                // Optionally do things such as:
                // - Add your .exe to the PATH
                // - Write to the registry for things like file associations and
                //   explorer context menus
                updatedWindows();
                break;
            case '--squirrel-uninstall':
                // Undo anything you did in the --squirrel-install and
                // --squirrel-updated handlers
                uninstallWindows();
                break;
            case '--squirrel-obsolete':
                // This is called on the outgoing version of your app before
                // we update to the new version - it's the opposite of
                // --squirrel-updated

                app.quit();
                break;
        }
        return true;
    }

    // this should be placed at top of main.js to handle setup events quickly
    if (handleSquirrelEvent()) {
        fs.appendFileSync(debugFile, 'end');
        // squirrel event handled and app will exit in 1000ms, so don't do anything else
        return true;
    }
};
