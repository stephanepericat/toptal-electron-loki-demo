/**
 * Main process
 */
var app = require('app'),
    ipc = require('ipc'),
    BrowserWindow = require('browser-window');

var mainWindow = null,
    insertWindow = null;

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600
    });

    mainWindow.loadUrl('file://' + __dirname + '/windows/main/main.html');

    insertWindow = new BrowserWindow({
        width: 400,
        height: 400,
        show: false
    });

    insertWindow.loadUrl('file://' + __dirname + '/windows/insert/insert.html');

    ipc.on('toggle-insert-view', function() {
        return (insertWindow.isVisible()) ? insertWindow.hide() : insertWindow.show();
    });
});
