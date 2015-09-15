var ipc = require('ipc'),
    uuid = require('uuid'),
    loki = require('lokijs'),
    path = require('path');

angular
    .module('Utils', [])
    .factory('Generator', function() {
        return {
            create: function() {
                return uuid.v4();
            }
        };
    })
    .factory('Storage', function() {
        var db = new loki(path.resolve(__dirname, '../..', 'app.db')),
            collection = db.getCollection('keychain');

        if(!collection) collection = db.addCollection('keychain');

        return {
            insert: function(data, cb) {
                try{
                    collection.insert(data);
                    db.saveDatabase(cb);
                } catch(e) {
                    cb.call(this, e);
                }
            },
            getList: function(cb) {
                db.loadDatabase({}, cb);
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
        return function(scope, el, attrs, ctrl) {
            el.bind('click', function(e) {
                e.preventDefault();
                if(!scope.vm.formData) scope.vm.formData = {};
                scope.vm.formData.password = Generator.create();
                scope.$apply();
            });
        };
    }])
    .directive('savePassword', ['Storage', function(db) {
        return function(scope, el) {
            el.bind('click', function(e) {
                e.preventDefault();
                db.insert(scope.vm.formData, function(err) {
                    if(err) {
                        scope.vm.formData.error = err;
                        scope.$apply();
                    } else {
                        scope.vm.formData = {};
                        scope.$apply();
                        ipc.send('toggle-insert-view');
                    }
                });
            });
        };
    }]);
