var ipc = require('ipc'),
    uuid = require('uuid'),
    loki = require('lokijs');

angular
    .module('Utils', [])
    .factory('Generator', function() {
        return {
            create: function() {
                return uuid.v4();
            }
        };
    })
    .factory('SaveToDb', function() {
        return {
            insert: function() {

            }
        };
    })
    .directive('toggleInsertView', [function() {
        return function(scope, el) {
            el.bind('click', function(e) {
                e.preventDefault();
                ipc.send('toggle-insert-view');
            });
        };
    }])
    .directive('generatePassword', ['Generator', function(Generator) {
        return {
            link: function(scope, el, attrs, ctrl) {
                el.bind('click', function(e) {
                    e.preventDefault();
                    if(!scope.vm.formData) scope.vm.formData = {};
                    scope.vm.formData.password = Generator.create();
                    scope.$apply();
                });
            }
        };
    }])
    .directive('savePassword', ['SaveToDb', function(db) {
        return function(scope, el) {
            el.bind('click', function(e) {
                e.preventDefault();
                // console.log(JSON.stringify(scope.vm.formData));
                // ipc.send('save-password');
            });
        };
    }]);
