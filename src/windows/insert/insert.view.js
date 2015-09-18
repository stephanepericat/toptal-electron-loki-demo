var remote = require('remote'),
    remoteIpc = remote.require('ipc');

angular
    .module('InsertView', ['Utils'])
    .controller('InsertCtrl', ['Storage', '$scope', function(Storage, scope) {
        var vm = this;

        vm.loaded = false;
        vm.formData = {};

        function init() {
            // disable formfields if db is not ready
            vm.loaded = false;
            // init the Storage so we can save the docs
            Storage
                .init()
                .then(function() {
                    vm.loaded = true;
                });
        }

        init();
        remoteIpc.on('reload-insert-view', init);
    }]);
