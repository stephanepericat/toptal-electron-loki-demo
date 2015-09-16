var ipc = require('ipc'),
    clipboard = require('clipboard'),
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
    .factory('Storage', ['$q', function($q) {
        function loadDb() {
            var db = new loki(path.resolve(__dirname, '../..', 'app.db')),
            d = $q.defer(),
            collection = null;

            db.loadDatabase({}, function(err) {
                if(err) {
                    // create the db file and add the collection, if it doesn't exist
                    db.addCollection('keychain');
                    db.saveDatabase();
                }

                collection = db.getCollection('keychain');

                d.resolve({
                    get: function() {
                        return (collection && collection.data) ? collection.data : [];
                    },
                    set: function(data) {
                        collection.insert(data);
                        db.saveDatabase();
                        return true;
                    }
                });
            });

            return d.promise;
        }

        return {
            load: function() {
                return loadDb();
            }
        };
    }])
    .directive('toggleInsertView', [function() {
        return function(scope, el) {
            el.bind('click', function(e) {
                e.preventDefault();
                ipc.send('toggle-insert-view');
            });
        };
    }])
    .directive('generatePassword', ['Generator', function(Generator) {
        return function(scope, el) {
            el.bind('click', function(e) {
                e.preventDefault();

                if(!scope.vm.formData) scope.vm.formData = {};
                scope.vm.formData.password = Generator.create();
                scope.$apply();
            });
        };
    }])
    .directive('savePassword', ['Storage', function(Storage) {
        return function(scope, el) {
            el.bind('click', function(e) {
                e.preventDefault();

                Storage
                .load()
                .then(function(collection) {
                    // save doc
                    collection.set(scope.vm.formData);
                    // refresh list in main view
                    ipc.send('update-main-view');
                    // reste form & close insert window
                    scope.vm.formData = {};
                    ipc.send('toggle-insert-view');
                });
            });
        };
    }])
    .directive('copyPassword', [function() {
        return function(scope, el, attrs) {
            el.bind('click', function(e) {
                e.preventDefault();
                var text = (scope.vm.keychain[attrs.copyPassword]) ? scope.vm.keychain[attrs.copyPassword].password : '';
                // atom's clipboard module
                clipboard.writeText(text);
            });
        };
    }])
    .directive('removePassword', [function() {
        return function(scope, el, attrs) {
            console.log(attrs.removePassword);
        };
    }]);
