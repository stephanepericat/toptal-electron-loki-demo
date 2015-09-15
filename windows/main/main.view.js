var remote = require('remote'),
    remoteIpc = remote.require('ipc');

angular
    .module('MainView', ['Utils'])
    .controller('MainCtrl', ['Storage', '$scope', function(Storage, scope) {
        var vm = this;
        vm.keychain = [];

        function updateList() {
            Storage
                .load()
                .then(function(data) {
                    vm.keychain = data.get();
                });
        }

        updateList();
        remoteIpc.on('update-main-view', updateList);
    }]);
