angular
    .module('InsertView', ['Utils'])
    .controller('InsertCtrl', ['Storage', function(Storage) {
        var vm = this;
        vm.formData = {};

        // init the Storage so we can save the docs
        Storage.init();
    }]);
