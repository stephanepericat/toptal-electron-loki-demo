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
    .service('Storage', ['$q', function($q) {
        this.db = new loki(path.resolve(__dirname, '../..', 'app.db'));
        this.collection = null;
        this.loaded = false;

        this.init = function() {
            var d = $q.defer();

            this.reload()
                .then(function() {
                    this.collection = this.db.getCollection('keychain');
                    // this.loaded = true;

                    d.resolve(this);
                }.bind(this))
                .catch(function(e) {
                    // create collection
                    this.db.addCollection('keychain');
                    // save and create file
                    this.db.saveDatabase();

                    this.collection = this.db.getCollection('keychain');
                    // this.loaded = true;

                    d.resolve(this);
                }.bind(this));

            return d.promise;
        };

        this.reload = function() {
            var d = $q.defer();

            this.loaded = false;

            this.db.loadDatabase({}, function(e) {
                if(e) {
                    d.reject(e);
                } else {
                    this.loaded = true;
                    d.resolve(this);
                }
            }.bind(this));

            return d.promise;
        };

        this.getCollection = function() {
            this.collection = this.db.getCollection('keychain');
            return this.collection;
        };

        this.isLoaded = function() {
            return this.loaded;
        };

        this.addDoc = function(data) {
            var d = $q.defer();

            if(this.isLoaded() && this.getCollection()) {
                this.getCollection().insert(data);
                this.db.saveDatabase();

                d.resolve(this.getCollection());
            } else {
                d.reject(new Error('DB NOT READY'));
            }

            return d.promise;
        };

        this.removeDoc = function(doc) {
            return function() {
                var d = $q.defer();

                if(this.isLoaded() && this.getCollection()) {
                    this.getCollection().remove(doc);
                    this.db.saveDatabase();

                    // we need to inform the insert view that the db content has changed
                    ipc.send('reload-insert-view');

                    d.resolve(true);
                } else {
                    d.reject(new Error('DB NOT READY'));
                }

                return d.promise;
            }.bind(this);
        };

        this.getDocs = function() {
            return (this.getCollection()) ? this.getCollection().data : null;
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

                if(scope.vm.formData) {
                    Storage
                        .addDoc(scope.vm.formData)
                        .then(function() {
                            // refresh list in main view
                           ipc.send('update-main-view');
                           // reset form & close insert window
                           scope.vm.formData = {};
                           ipc.send('toggle-insert-view');
                        });
                }
            });
        };
    }])
    .directive('copyPassword', [function() {
        return function(scope, el, attrs) {
            el.bind('click', function(e) {
                e.preventDefault();
                var text = (scope.vm.keychain[attrs.copyPassword]) ? scope.vm.keychain[attrs.copyPassword].password : '';
                // atom's clipboard module
                clipboard.clear();
                clipboard.writeText(text);
            });
        };
    }])
    .directive('removePassword', ['Storage', function(Storage) {
        return function(scope, el, attrs) {
            el.bind('click', function(e) {
                e.preventDefault();
                var doc = JSON.parse(attrs.removePassword) || null;

                Storage
                    .reload()
                    .then(Storage.removeDoc(doc))
                    .then(function() {
                        ipc.send('update-main-view');
                    });
            });
        };
    }]);
