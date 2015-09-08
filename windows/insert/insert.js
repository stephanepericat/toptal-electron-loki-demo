var remote = require('remote'),
    ipc = require('ipc');

var closeBtn = document.querySelector("input[name='close']");

closeBtn.addEventListener('click', function() {
    ipc.send('toggle-insert-view');
});
