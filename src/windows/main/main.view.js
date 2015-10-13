////////
// This sample is published as part of the blog article at www.toptal.com/blog
// Visit www.toptal.com/blog and subscribe to our newsletter to read great posts
////////

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
