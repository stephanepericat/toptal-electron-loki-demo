var ipc = require('ipc');

var closeBtn = document.getElementById('close-btn');

closeBtn.addEventListener('click', function() {
    ipc.send('toggle-insert-view');
});
