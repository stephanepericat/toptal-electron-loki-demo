var ipc = require('ipc');

angular
    .module('Utils', [])
    .directive('toggleInsertView', [function() {
        return function(scope, el, attrs) {
            el.bind('click', function(e) {
                e.preventDefault();
                ipc.send('toggle-insert-view');
            });
        };
    }]);
