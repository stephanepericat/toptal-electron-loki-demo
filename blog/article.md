# Building Cross-platform Desktop Apps with Electron & Loki.js

Earlier this year, Github released Atom-Shell, the core of its famous open-source editor [Atom](https://atom.io), and renamed it for the occasion **Electron**.

Electron, unlike other competitors in the category of Node.js-based desktop applications, brings its own twist to this already well-established market by combining the power of [io.js](https://iojs.org/) together with the [Chromium Engine](http://www.chromium.org/Home), to bring you the best of both server and client-side JavaScript.

Imagine a world where you could build performant, data-driven, cross-platform desktop applications; powered by not only the ever-growing repository of NPM modules, but also the entire Bower registry to fulfill all your client-side needs.

Enter [Electron](http://electron.atom.io/).

In this tutorial, you will build a simple password keychain application using Electron, Angular.js & [Loki.js](http://lokijs.org/#/), a lightweight and in-memory database with a familiar syntax for MongoDB developers.

> The full source code for this application can be accessed [here](https://github.com/stephanepericat/toptal-electron-loki-demo).

## Prerequisites

This tutorial assumes that:

 - You have Node.js and Bower installed on your machine
 - You are familiar with Node.js, Angular.js and MongoDB-like query syntax 


## Getting the Goods

First things first, you will need to get the Electron binaries in order to test your app locally. You can install it either globally and use it as a CLI, or install it locally in your application's path. I recommend installing it globally, this way you will not have to do it over and over again for every you develop.

> You will learn later how to package your application for distribution using Gulp; this process involves copying the Electron binaries and therefore, it makes little to no sense to manually install it in your application's path.

To install the Electron CLI, type the following command in your terminal:

```shell
$ npm install -g electron-prebuilt
```

To test the installation, type `electron -h` and it should display the version of the Electron CLI.

> At the time this article was written, the version of Electron was `0.31.2`

## Setting Up the Project

Let's assume the basic following folder structure:

```
my-app
|- cache/
|- dist/
|- src/
|-- app.js
| gulpfile.js
```

Where:
 - **cache/** will be used to download the Electron binaries when building the app
 - **dist/** will contain the generated distribution files
 - **src/** will contain our source code
 - **src/app.js** will be the entry point of our application

Navigate to the `src/` folder in your terminal and create the `package.json` and `bower.json` files for your app:

```shell
$ npm init
$ bower init
```

You will install the necessary packages later on in this tutorial.

## Understanding Electron Processes

Electron distinguishes between two types of processes:

 - **The Main Process**: The entry point of your application, the file that will be executed whenever you run the app. Typically, this file declares the various windows of the app, and can optionally be used to define global event listeners using Electron's [ipc module](http://electron.atom.io/docs/v0.31.0/api/ipc-main-process/)
 - **The Renderer Process**: The controller for a given window in your application. Each window creates its own Renderer Process

> For code clarity, you should use a separate file for each Renderer Process.

To define the Main Process for your app, open `src/app.js`; you will need to include the `app` module to start the app, and the `browser-window` module to create the various windows of your app (both part of the Electron core), as such:

```javascript
var app = require('app'),
    BrowserWindow = require('browser-window');
```

When the app is actually started, it fires a `ready` event, which you can bind to. At this point, you can instantiate the main window of your app:

```javascript
var mainWindow = null;

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768
    });
    
    mainWindow.loadUrl('file://' + __dirname + '/windows/main/main.html');
    mainWindow.openDevTools();
});
```
Key points:

 - You create a new window by creating a new instance of the `BrowserWindow` Object
 - It takes an object as a single argument, allowing you to define [various settings](http://electron.atom.io/docs/v0.31.0/api/browser-window/#class-browserwindow), amongst which the default _width_ and _height_ of the window
 - The window instance has a `loadUrl()` method, allowing you to load the contents of an actual html file in the current window; the html file can either be _local_ or _remote_
 - The window instance has an optional `openDevTools()` method, allowing you to open an instance of the Chrome Dev Tools in the current window for debugging purposes

At this point, you should organize your code a little. I recommend creating a `windows/` folder in your `src/` folder, and you there you can create a subfolder for each window, as such:

```
my-app
|- src/
|-- windows/
|--- main/
|---- main.controller.js
|---- main.html
|---- main.view.js
```

Where `main.controller.js` will contain the "server-side" logic of your application, while `main.view.js` will contain the "client-side" logic of your application.

The `main.html` file is simply an HTML5 webpage, so you can simply start it like this:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Keychain</title>
</head>
<body>
    <h1>Password Keychain</h1>
</body>
</html>
```

A this point, your app should already be running. To test it, type the following in your terminal, at the root of the `src` folder:

```shell
$ electron .
```

> You can automate this process by defining the `start` script of the package.son file

## Building the Password Keychain App

To build a password keychain application, you need:

- A way to add, generate and save passwords
- A convenient way to copy and remove passwords

### Generating & Saving Passwords

A simple form will suffice to insert new passwords. For the sake of demoing communication between multiple windows in Electron, start by adding a second window your application, which will display the insert form. Since you will open and close this window multiple times, you should wrap up the logic in a method, so you can simply call it when needed:

```javascript
function createInsertWindow() {
    insertWindow = new BrowserWindow({
        width: 640,
        height: 480,
        show: false
    });
    
    insertWindow.loadUrl('file://' + __dirname + '/windows/insert/insert.html');
    
    insertWindow.on('closed',function() {
        insertWindow = null;
    });
}
```

Key points:

 - You will need to set the **show** property to **false** in the options object of the BrowserWindow constructor, in order to prevent the window from being open by default when the applications starts
 - You will need to destroy the BrowserWindow instance whenever the window is firing a **closed** event

#### Opening & Closing the "Insert" Window

The idea is to be able to trigger the "insert" window when the end user clicks a button in the "main" window. In order to do this, you will need to send a message from the main window to the Main Process, to instruct it to open the insert window. You can achieve this using Electron's IPC module. There is actually two variants of the IPC module:

- One for the [Main Process](http://electron.atom.io/docs/v0.31.0/api/ipc-main-process/), allowing to subscribe to messages sent from windows
- One for the [Renderer Process](http://electron.atom.io/docs/v0.31.0/api/ipc-renderer/), allowing to send messages to the main process

> Although Electron's communication channel is mostly uni-directional, it is possible to access the Main Process' IPC module in a Renderer Process, by making use of the **[remote](http://electron.atom.io/docs/v0.31.0/api/remote/)** module. Also, the Main Process can send a message back to the Renderer Process from which the event originated by using the [Event.sender.send()](http://electron.atom.io/docs/v0.31.0/api/ipc-main-process/#event-sender-send-channel-arg1-arg2) method.

To use the IPC module, you just require it like any other NPM module in your Main Process script:

```javascript
var ipc = require('ipc');
```

and then bind to events with the `on()` method:

```javascript
ipc.on('toggle-insert-view', function() {
    if(!insertWindow) {
        createInsertWindow();
    }
    return (!insertWindow.isClosed() && insertWindow.isVisible()) ? insertWindow.hide() : insertWindow.show();
});
```

Key Points:

 - You can name the event however way you want; the example is just arbitrary
 - Do not forget to check if the BrowserWindow instance is already created; if not, do instantiate it
 - The BrowserWindow instance has some useful methods:
     - **isClosed()**: returns a boolean, whether or not the window is currently in a `closed` state
     - **isVisible()**: returns a boolean, whether or not the window is currently visible
     - **show() / hide()**: convenience methods to show and hide the window

Now, you actually need to fire that event from the Renderer Process. Create a new script file called `main.view.js`, and add it to your html page like you would any normal script:

```html
<script src="./main.view.js"></script>
```

> loading the script file via the html `script` tag loads this file in a _client-side_ context; meaning that for example, global variables are available via `window.<var_name>`. To load a script in a _server-side_ context, you can use the `require()` method directly in your html page: `require('./main.controller.js');`.

Even though the script is loaded in _client-side_ context, you can still access the IPC module for the Renderer Process in the same you would for the Main Process, and then send your event, as such:

```javascript
var ipc = require('ipc');

angular
    .module('Utils', [])
    .directive('toggleInsertView', function() {
        return function(scope, el) {
            el.bind('click', function(e) {
                e.preventDefault();
                ipc.send('toggle-insert-view');
            });
        };
    });
```

> There's is also a sendSync() method available, in case you need to send your events synchronously.

Now, all you have left to do to open the insert window is to create an html button with the matching Angular directive on it:

```html
<div ng-controller="MainCtrl as vm">
    <button toggle-insert-view class="mdl-button">
        <i class="material-icons">add</i>
    </button>
</div>
```

And add that directive as a dependency of the main window's Angular controller:

```javascript
angular
    .module('MainWindow', ['Utils'])
    .controller('MainCtrl', function() {
        var vm = this;
    });
```

#### Generating Passwords

To keep things simple, you can just use the NPM `uuid` module to generate unique id's that will act as passwords for the purpose of this tutorial. You can install it like any other NPM module, require it in your 'Utils' script and then create a simple factory that will return a unique id:

```javascript
var uuid = require('uuid');

angular
    .module('Utils', [])
    
    ...
    
    .factory('Generator', function() {
        return {
            create: function() {
                return uuid.v4();
            }
        };
    })
```

Now, all you have left to do is create button in the insert view, and attach a directive to it that will listen to click events on the button and call the create() method:

```html
<!-- in insert.html -->
<button generate-password class="mdl-button">generate</button>
```

```javascript
// in Utils.js
angular
    .module('Utils', [])
    
    ...
    
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
```



#### Saving Passwords

At this point, you want to store your passwords. The data structure for our password entries is fairly simple:

```javascript
{
    "id": String
    "description": String,
    "username": String,
    "password": String
}
```

So all you really need is some kind of in-memory database, that can optionally sync to file for backup. For this purpose, [Loki.js](http://lokijs.org/#/) seems like the ideal candidate. It does exactly what you need for the purpose of this application, and offers on top of it the _Dynamic Views_ feature, allowing you to do similar things than MongoDB's Aggregation module.

> Dynamic Views do **not** offer all the functionality that MongodDB's Aggregation module does; please refer to the [documentation](http://lokijs.org/#/docs#views) for more info.

Let's start by creating a simple html form:

```html
<div class="insert" ng-controller="InsertCtrl as vm">
    <form name="insertForm" no-validate>
        <fieldset ng-disabled="!vm.loaded">
            <div class="mdl-textfield">
                <input class="mdl-textfield__input" type="text" id="description" ng-model="vm.formData.description" required />
                <label class="mdl-textfield__label" for="description">Description...</label>
            </div>
            <div class="mdl-textfield">
                <input class="mdl-textfield__input" type="text" id="username" ng-model="vm.formData.username" />
                <label class="mdl-textfield__label" for="username">Username...</label>
            </div>
            <div class="mdl-textfield">
                <input class="mdl-textfield__input" type="password" id="password" ng-model="vm.formData.password" required />
                <label class="mdl-textfield__label" for="password">Password...</label>
            </div>
            <div class="">
                <button generate-password class="mdl-button">generate</button>
                <button toggle-insert-view class="mdl-button">cancel</button>
                <button save-password class="mdl-button" ng-disabled="insertForm.$invalid">save</button>
            </div>
        </fieldset>
    </form>
</div>
```

And now, let's add the JavaScript logic to handle posting and saving the form's contents:

```javascript
var loki = require('lokijs'),
    path = require('path');

angular
    .module('Utils', [])
    
    ...
    
    .service('Storage', ['$q', function($q) {
        this.db = new loki(path.resolve(__dirname, '../..', 'app.db'));
        this.collection = null;
        this.loaded = false;
        
        this.init = function() {
            var d = $q.defer();
            
            this.reload()
                .then(function() {
                    this.collection = this.db.getCollection('keychain');
                    d.resolve(this);
                }.bind(this))
                .catch(function(e) {
                    // create collection
                    this.db.addCollection('keychain');
                    // save and create file
                    this.db.saveDatabase();
                    
                    this.collection = this.db.getCollection('keychain');
                    d.resolve(this);
                }.bind(this));
                
                return d.promise;
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
    })
    
    .directive('savePassword', ['Storage', function(Storage) {
        return function(scope, el) {
            el.bind('click', function(e) {
                e.preventDefault();
                
                if(scope.vm.formData) {
                    Storage
                        .addDoc(scope.vm.formData)
                        .then(function() {
                           // reset form & close insert window
                           scope.vm.formData = {};
                           ipc.send('toggle-insert-view');
                        });
                }
            });
        };
    }])
```

Key Points:

 - You first need to initialize the database. This process involves creating a new instance of the Loki Object, providing the path to the database file as an argument, looking up if that backup file exists, creating it if needed (including the 'Keychain' collection), and then loading the contents of this file in memory
 - You can retrieve a specific collection in the database with the `getCollection()` method
 - A collection Object exposes several methods, including an `insert()` method, allowing you to add a new document to the collection
 - To persist the database contents to file, the Loki Object exposes a `saveDatabase()` method
 - You will need to reset the form's data and send an IPC event to tell the Main Process to close the window once the document is saved

You now have a simple form allowing you to generate and save new passwords. Let's go back to the main view to list these entries.

### Listing Passwords

A few things need to happen here:

 - You need to be able to get all the documents in your collection
 - You need to inform the main view whenever a new password is saved so it can refresh the view

You can retrieve the list of documents by calling the `getCollection()` method on the Loki Object; this method returns an object with a property called **data**, which is simply an array of all the documents in that collection:

```javascript
this.getCollection = function() {
    this.collection = this.db.getCollection('keychain');
    return this.collection;
};
        
this.getDocs = function() {
    return (this.getCollection()) ? this.getCollection().data : null;
};
```

You can then call the getDocs() in your Angular controller and retrieve all the passwords stored in the database, after you initialize it:

```javascript
angular
    .module('MainView', ['Utils'])
    .controller('MainCtrl', ['Storage', function(Storage) {
        var vm = this;
        vm.keychain = null;
        
        Storage
            .init()
            .then(function(db) {
                vm.keychain = db.getDocs();
            });
    });     
```

A bit of Angular templating, and you have a password list:

```html
<tr ng-repeat="item in vm.keychain track by $index" class="item--{{$index}}">
    <td class="mdl-data-table__cell--non-numeric">{{item.description}}</td>
    <td>{{item.username || 'n/a'}}</td>
    <td>
        <span ng-repeat="n in [1,2,3,4,5,6]">&bull;</span>
    </td>
    <td>
        <a href="#" copy-password="{{$index}}">copy</a>
        <a href="#" remove-password="{{item}}">remove</a>
    </td>
</tr>
```

A nice added feature would be to refresh the list of passwords after inserting a new one. For this, we can use Electron's IPC module. As mentioned earlier, the Main Process' IPC module can be called in a Renderer Process to turn it into a listener process, by using the [remote](http://electron.atom.io/docs/v0.31.0/api/remote/) module. Here is an example on how to implement it in `main.view.js`:

```javascript
var remote = require('remote'),
    remoteIpc = remote.require('ipc');

angular
    .module('MainView', ['Utils'])
    .controller('MainCtrl', ['Storage', function(Storage) {
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
```

Key Points:

 - You will need to use the remote module via its own `require()` method to require the remote IPC module from the Main Process
 - You can then setup your Renderer Process as an event listener via the `on()` method, and bind callback functions to these events

The insert view will then be in charge of dispatching this event whenever a new document is saved:

```javascript
Storage
    .addDoc(scope.vm.formData)
    .then(function() {
        // refresh list in main view
        ipc.send('update-main-view');
        // reset form & close insert window
        scope.vm.formData = {};
        ipc.send('toggle-insert-view');
    });
```

### Copying Passwords

It is usually not a good idea to display passwords in plain text; instead, you are going to hide, and provide a convenience button allowing the end user to copy the password directly for a specific entry.

Here again, Electron comes to your rescue by providing you with a [clipboard](http://electron.atom.io/docs/v0.31.0/api/clipboard/) module, providing you with easy methods to copy and paste not only text content, but also images and html code:

```javascript
var clipboard = require('clipboard');

angular
    .module('Utils', [])
    
    ...
    
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
    }]);
```

Since the generated password will be a simple string, we can use the `writeText()` method to copy the password to the system's clipboard. You can the update your main view' html, and add the copy button with the `copy-password` directive on it, providing the index of the array of passwords:

```html
<a href="#" copy-password="{{$index}}">copy</a>
```
    
### Removing Passwords

Your end users might also like to be able to delete passwords, in case they become obsolete. To do this, all you need to do is call the `remove()` method on the keychain collection. You need to provide the entire doc to the remove() method, as such:

```javascript
this.removeDoc = function(doc) {
    return function() {
        var d = $q.defer();
        
        if(this.isLoaded() && this.getCollection()) {
            // remove the doc from the collection & persist changes
            this.getCollection().remove(doc);
            this.db.saveDatabase();
            
            // inform the insert view that the db content has changed
            ipc.send('reload-insert-view');
            
            d.resolve(true);
        } else {
            d.reject(new Error('DB NOT READY'));
        }
        
        return d.promise;
    }.bind(this);
};
```


> Loki.js documentation states that you can also remove a doc by its id, but it does not seem to be working as expected.

## Creating a Desktop Menu

Electron integrates seamlessly with Your OS's desktop environment to provide a "native" user experience look & feel to your apps. Therefore, Electron comes bundled with a [Menu module](http://electron.atom.io/docs/v0.31.0/api/menu/), dedicated to creating complex desktop menu structures for your app.

The menu module is a vast topic and could almost deserve a tutorial of its own; I strongly recommend you read through [Electron's Desktop Environment Integration tutorial](http://electron.atom.io/docs/v0.31.0/tutorial/desktop-environment-integration/) to discover all the features of this module.

For the scope of this current tutorial, you will learn how to create a custom menu, add a custom command to it, and implement the standard quit command.

### Creating & Assigning a Custom Menu to Your App

Typically, the JavaScript logic for an Electron menu would belong in the main script file of your app, where your Main Process is defined. However, you can abstract it to a separate file, and access the Menu module via the remote module, as such:

```javascript
var remote = require('remote'),
    Menu = remote.require('menu');
```

To define a simple menu, you will need to use the `buildFromTemplate()` method:

```javascript
var appMenu = Menu.buildFromTemplate([
    {
        label: 'Electron',
        submenu: [{
            label: 'Credits',
            click: function() {
                alert('Built with Electron & Loki.js.');
            }
        }]
    }
]);
```

> The first item in the array is always used as the "default" menu item

> The value of the `label` property does not matter much for the default menu item; in dev mode it will always display `Electron`. You will learn later how to assign a custom name to the default menu item during the build phase.

Finally, you need to assign this custom menu as the default menu for your app with the `setApplicationMenu()` method:

```javascript
Menu.setApplicationMenu(appMenu);
```

### Mapping Keyboard Shortcuts

Electron provides "[accelerators](https://github.com/atom/electron/blob/master/docs/api/accelerator.md)", a set of pre-defined strings that map to actual keyboard combinations, e.g.: `Command+A` or `Ctrl+Shift+Z`. 

> The `Command` accelerator does not work on Windows or Linux

For your password keychain application, you should add a `File` menu item, offering two commands:

 - **Create Password**: open the insert view with _Cmd (or Ctrl) + N_
 - **Quit**: quit the app altogether with _Cmd (or Ctrl) + Q_

```javascript
...
{
    label: 'File',
    submenu: [
        {
            label: 'Create Password',
            accelerator: 'CmdOrCtrl+N',
            click: function() {
                ipc.send('toggle-insert-view');
            }
        },
        {
            type: 'separator' // to create a visual separator
        },
        {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            selector: 'terminate:' // OS X only!!!
        }
    ]
}
...
```

Key Points:

 - You can add a visual separator by adding an item to the array with the `type` property set to `separator`
 - The `CmdOrCtrl` accelerator is compatible with both Mac and PC keyboards
 - The `selector` property is OSX-compatible only!

## Styling Your App

You probably noticed throughout the various code examples references to class names starting with `mdl-`. For the purpose of this tutorial I opted to use the [Material Design Lite](http://www.getmdl.io/) UI framework, but feel free to use any UI framework of your choice.

Anything that you can do with HTML5 can be done in Electron; just keep in mind the growing size of your app's binaries, and the resulting performance issues that may occur if you use too many third-party libraries.

## Packaging Your App for Distribution

Your app looks great, you wrote your e2e tests with [Selenium and WebDriver](http://electron.atom.io/docs/v0.31.0/tutorial/using-selenium-and-webdriver/), and you are ready to distribute it to the world!

But you want to personalize it; give it a custom name other than the default "Electron", and maybe also provide custom application icons for both Mac and PC platforms.

### Building Your App with Gulp

These days, anything you can think of, there is a [Gulp](http://gulpjs.com/) plugin for it. All I had to do is type `gulp electron` in Google, and sure enough, there is a [gulp-electron](https://github.com/mainyaa/gulp-electron) plugin!

This plugin is fairly easy to use if you followed the folder structure detailed at the beginning of this tutorial; if not, you might have to move things around a bit.

This plugin can be installed like any other Gulp plugin:

```shell
$ npm install gulp-electron --save-dev
```
And then, you define your Gulp task as such:

```javascript
var gulp = require('gulp'),
    electron = require('gulp-electron'),
    info = require('./src/package.json');

gulp.task('electron', function() {
    gulp.src("")
    .pipe(electron({
        src: './src',
        packageJson: info,
        release: './dist',
        cache: './cache',
        version: 'v0.31.2',
        packaging: true,
        platforms: ['win32-ia32', 'darwin-x64'],
        platformResources: {
            darwin: {
                CFBundleDisplayName: info.name,
                CFBundleIdentifier: info.bundle,
                CFBundleName: info.name,
                CFBundleVersion: info.version
            },
            win: {
                "version-string": info.version,
                "file-version": info.version,
                "product-version": info.version
            }
        }
    }))
    .pipe(gulp.dest(""));
});
```

Key Points:

 - the `src/` folder cannot be the same than the folder where the Gulpfile.js is, nor the same folder than the distribution folder
 - You can define the platforms you wish to export to via the `platforms` array
 - You should define a `cache` folder, where the Electron binaries will be download so the can be packaged with your app
 - The contents of the app's package.son file need to be passed to the gulp task via the `packageJson` property 
 - There is an optional `packaging` property, allowing you to also create zip archives of the generated apps
 - For each platform, there is a different set of "platform resources" that [can be defined](https://github.com/mainyaa/gulp-electron#options)

#### Adding App Icons

One of the `platformResources` properties is the `icon` property, allowing you to define a custom icon for your app:

```javascript
"icon": "keychain.ico"
```

> OS X requires icons with the `.icns` file extension.

> There are multiple online tools allowing you to convert `.png` files into `.ico` and `.icns` for free.

## Conclusion

We only scratched the surface of what Electron can actually do; think of great apps like [Atom](https://atom.io/) or [Slack](https://slack.com/apps) as a source of inspiration of where you can go with this tool.

I hope you found this tutorial useful; please feel free to leave your comments and share your experiences with Electron!









