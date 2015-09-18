var remote = require('remote'),
    remoteIpc = remote.require('ipc');

angular
    .module('MainView', ['Utils'])
    .controller('MainCtrl', ['Storage', '$scope', function(Storage, scope) {
        var vm = this;
        vm.keychain = null;

        Storage
            .init()
            .then(function(db) {
                vm.keychain = db.getDocs();

                remoteIpc.on('update-main-view', function() {
                    Storage
                        .reload()
                        .then(function() {
                            vm.keychain = db.getDocs();
                        });
                });
            });
    }]);
