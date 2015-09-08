var remote = require('remote'),
Menu = remote.require('menu');

var menu = Menu.buildFromTemplate([
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
                label: 'Add Task',
                click: function() {

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

Menu.setApplicationMenu(menu);
