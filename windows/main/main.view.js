var ipc = require('ipc'),
    remote = require('remote');
// insert button
var insertBtn = document.getElementById('insert-button');
insertBtn.addEventListener('click', function(e) {
    e.preventDefault();

    // console.log(remote.getCurrentWindow());

    ipc.send('toggle-insert-view');
});
