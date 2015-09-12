var remote = require('remote'),
    Menu = remote.require('menu');

module.exports = {
    create: function() {
        var appMenu = Menu.buildFromTemplate([
            {
                label: 'Electron',
                submenu: [{
                    label: 'Credits',
                    click: function() {
                        alert('Built with Electron & Loki.js.');
                    }
                }]
            },
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Create Password',
                        accelerator: 'CmdOrCtrl+N',
                        click: function() {
                            // alert('Create new password');
                            ipc.send('toggle-insert-view');
                        }
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Quit',
                        accelerator: 'CmdOrCtrl+Q',
                        selector: 'terminate:' //osx only
                    }
                ]
            }
        ]);

        Menu.setApplicationMenu(appMenu);
    }
};
