/**
 * Renderer process
 * "Main" view
 */
var ipc = require('ipc'),
    lokijs = require('lokijs'),
    menu = require('../../common/menu');

// create desktop menu
menu.create();
