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

    fs.appendFileSync(debugFile, '1');

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
            "HKCR\\.mdesign",
            "HKCR\\.mdesign\\DefaultIcon",
            "HKCR\\.mdesign\\Shell",
            "HKCR\\.mdesign\\Shell\\Open",
            "HKCR\\.mdesign\\Shell\\Open\\command",
            "HKCR\\mdesign",
            "HKCR\\mdesign\\DefaultIcon",
            "HKCR\\mdesign\\Shell",
            "HKCR\\mdesign\\Shell\\Open",
            "HKCR\\mdesign\\Shell\\Open\\command"
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
            "HKCR\\.mdesign",
            "HKCR\\.mdesign\\DefaultIcon",
            "HKCR\\.mdesign\\Shell",
            "HKCR\\.mdesign\\Shell\\Open",
            "HKCR\\.mdesign\\Shell\\Open\\command",
            "HKCR\\mdesign",
            "HKCR\\mdesign\\DefaultIcon",
            "HKCR\\mdesign\\Shell",
            "HKCR\\mdesign\\Shell\\Open",
            "HKCR\\mdesign\\Shell\\Open\\command"
        ], function(err) {
			if(err) {				
				console.error("Error createing registry keys", err);
				fs.appendFileSync(debugFile, '\r\n7' + err);
			} else {
				regedit.putValue({
					"HKCR\\.mdesign": {
						'@': {
							value: ".mdesign",
							type: 'REG_DEFAULT'
						},
						"mDesign File Association": {
							value: '',
							type: 'REG_SZ'
						}
					},
					"HKCR\\.mdesign\\DefaultIcon": {
						'@': {
							value: process.execPath,
							type: 'REG_DEFAULT'
						}
					},
					"HKCR\\.mdesign\\Shell\\Open\\command": {
						'@': {
							value: process.execPath,
							type: 'REG_DEFAULT'
						}
					},
					"HKCR\\mdesign": {
						'@': {
							value: "URL:mdesign Protocol",
							type: 'REG_DEFAULT'
						},
						'URL Protocol': {
							value: '',
							type: 'REG_SZ'
						}
					},
					"HKCR\\mdesign\\DefaultIcon": {
						'@': {
							value: process.execPath,
							type: 'REG_DEFAULT'
						}
					},
					"HKCR\\mdesign\\Shell\\Open\\command": {
						'@': {
							value: process.execPath,
							type: 'REG_DEFAULT'
						}
					}
				}, function(err) {
					if(err) {
						console.error("Error saving value to keys", err);
						fs.appendFileSync(debugFile, '\r\n8' + err);
					}
				});
			}
        });

        
    }

    function updatedWindows () {
        fs.appendFileSync(debugFile, '6');
        // Install desktop and start menu shortcuts
        var createChildProcess = spawnUpdate(['--createShortcut=' + exeName]);
        createChildProcess.on("close", function () {
            app.quit();
        });
    }

    function handleSquirrelEvent() {
        fs.appendFileSync(debugFile, '2');

        const squirrelEvent = process.argv[1];
		var handled = false;
        switch (squirrelEvent) {
            case '--squirrel-install':
                installWindows();
            case '--squirrel-updated':
                // Optionally do things such as:
                // - Add your .exe to the PATH
                // - Write to the registry for things like file associations and
                //   explorer context menus
				handled = true;
                updatedWindows();
                break;
            case '--squirrel-uninstall':
                // Undo anything you did in the --squirrel-install and
                // --squirrel-updated handlers
				handled = true;
                uninstallWindows();
                break;
            case '--squirrel-obsolete':
                // This is called on the outgoing version of your app before
                // we update to the new version - it's the opposite of
                // --squirrel-updated
				handled = true;
                app.quit();
                break;
        }
        return handled;
    }

    return handleSquirrelEvent();
};
