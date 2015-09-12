/**
 * Main process
 */
var app = require('app'),
    ipc = require('ipc'),
    BrowserWindow = require('browser-window');

var mainWindow = null,
    insertWindow = null;

function createInsertWindow() {
    insertWindow = new BrowserWindow({
        width: 500,
        height: 350,
        show: false
    });

    insertWindow.loadUrl('file://' + __dirname + '/windows/insert/insert.html');

    insertWindow.on('closed',function() {
        insertWindow = null;
    });
}

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768
    });

    mainWindow.loadUrl('file://' + __dirname + '/windows/main/main.html');
    mainWindow.openDevTools();

    ipc.on('toggle-insert-view', function() {
        if(!insertWindow) {
            createInsertWindow();
        }

        return (!insertWindow.isClosed() && insertWindow.isVisible()) ? insertWindow.hide() : insertWindow.show();
    });
});
