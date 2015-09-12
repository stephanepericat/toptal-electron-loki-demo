var ipc = require('ipc');

var form = document.getElementById('insert-form'),
    genBtn = document.getElementById('generate-btn'),
    closeBtn = document.getElementById('close-btn'),
    saveBtn = document.getElementById('save-btn');

genBtn.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('generate');
});

closeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    ipc.send('toggle-insert-view');
});

saveBtn.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('save', form);
});
