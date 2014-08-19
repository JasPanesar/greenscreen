// Generated by CommonJS Everywhere 0.9.7
(function (global) {
  function require(file, parentModule) {
    if ({}.hasOwnProperty.call(require.cache, file))
      return require.cache[file];
    var resolved = require.resolve(file);
    if (!resolved)
      throw new Error('Failed to resolve module ' + file);
    var module$ = {
        id: file,
        require: require,
        filename: file,
        exports: {},
        loaded: false,
        parent: parentModule,
        children: []
      };
    if (parentModule)
      parentModule.children.push(module$);
    var dirname = file.slice(0, file.lastIndexOf('/') + 1);
    require.cache[file] = module$.exports;
    resolved.call(module$.exports, module$, module$.exports, dirname, file);
    module$.loaded = true;
    return require.cache[file] = module$.exports;
  }
  require.modules = {};
  require.cache = {};
  require.resolve = function (file) {
    return {}.hasOwnProperty.call(require.modules, file) ? require.modules[file] : void 0;
  };
  require.define = function (file, fn) {
    require.modules[file] = fn;
  };
  var process = function () {
      var cwd = '/';
      return {
        title: 'browser',
        version: 'v0.10.29',
        browser: true,
        env: {},
        argv: [],
        nextTick: global.setImmediate || function (fn) {
          setTimeout(fn, 0);
        },
        cwd: function () {
          return cwd;
        },
        chdir: function (dir) {
          cwd = dir;
        }
      };
    }();
  require.define('/src/client/gscreen.coffee', function (module, exports, __dirname, __filename) {
    window.GScreen = angular.module('GScreen', [
      'ng',
      'ngResource',
      'ngRoute'
    ]);
    require('/src/client/routes.coffee', module);
    require('/src/client/controllers/alert-form.coffee', module);
    require('/src/client/controllers/main.coffee', module);
    require('/src/client/controllers/channels.coffee', module);
    require('/src/client/controllers/channel-form.coffee', module);
    require('/src/client/controllers/chromecasts.coffee', module);
    require('/src/client/controllers/chromecast-form.coffee', module);
    require('/src/client/controllers/receiver.coffee', module);
    require('/src/client/controllers/screen.coffee', module);
    require('/src/client/controllers/takeover-form.coffee', module);
    require('/src/client/directives/flash-container.coffee', module);
    require('/src/client/directives/real-link.coffee', module);
    require('/src/client/resources/alert.coffee', module);
    require('/src/client/resources/channel.coffee', module);
    require('/src/client/resources/chromecast.coffee', module);
    require('/src/client/resources/takeover.coffee', module);
    require('/src/client/services/cast-away.coffee', module);
    require('/src/client/services/flash.coffee', module);
    require('/src/client/services/local-device.coffee', module);
    require('/src/client/services/sockets.coffee', module);
  });
  require.define('/src/client/services/sockets.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').factory('sockets', function () {
      var addListenerForEvent, exports, listeners, socket;
      listeners = {};
      socket = io(window.location.origin);
      socket.on('connect', function () {
        var connected;
        return connected = true;
      });
      addListenerForEvent = function (name) {
        return socket.on(name, function (args) {
          var l;
          args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
          return function (accum$) {
            for (var i$ = 0, length$ = listeners[name].length; i$ < length$; ++i$) {
              l = listeners[name][i$];
              accum$.push(l.apply(null, [].slice.call(args)));
            }
            return accum$;
          }.call(this, []);
        });
      };
      return exports = {
        on: function (name, func) {
          if (listeners[name]) {
            return listeners[name].push(func);
          } else {
            listeners[name] = [func];
            return addListenerForEvent(name);
          }
        },
        emit: function (args) {
          args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
          return socket.emit.apply(socket, [].slice.call(args));
        }
      };
    });
  });
  require.define('/src/client/services/local-device.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').factory('localDevice', function (Chromecast, sockets) {
      var clearAlert, clearTimeoutId, createAlert, exports, listeners, loadChromecast, loadChromecastFromPersistence, updateAlert, updateChannelId, updateChromecast;
      listeners = { change: [] };
      clearTimeoutId = null;
      loadChromecast = function (id) {
        return Chromecast.get(id).$promise.then(function (c) {
          console.log('loadChromecast', c);
          updateChromecast(c);
          return createAlert(c.alert);
        });
      };
      updateChromecast = function (c) {
        var l;
        exports.chromecast = c;
        return function (accum$) {
          for (var i$ = 0, length$ = listeners.change.length; i$ < length$; ++i$) {
            l = listeners.change[i$];
            accum$.push(l(c));
          }
          return accum$;
        }.call(this, []);
      };
      updateChannelId = function (channelId) {
        var k, newCast, v;
        newCast = {};
        for (k in exports.chromecast) {
          v = exports.chromecast[k];
          newCast[k] = v;
        }
        newCast.channelId = channelId;
        return updateChromecast(newCast);
      };
      updateAlert = function (alert) {
        var k, newCast, v;
        newCast = {};
        for (k in exports.chromecast) {
          v = exports.chromecast[k];
          newCast[k] = v;
        }
        newCast.alert = alert;
        return updateChromecast(newCast);
      };
      loadChromecastFromPersistence = function () {
        var id;
        if (id = localStorage.getItem('chromecast-id'))
          return loadChromecast(id);
      };
      clearAlert = function () {
        console.log('Clearing the alert');
        if (clearTimeoutId)
          clearTimeout(clearTimeoutId);
        return updateAlert(null);
      };
      createAlert = function (alert) {
        var duration;
        if (alert) {
          duration = new Date(alert.expiresAt).getTime() - new Date().getTime();
          if (duration > 0) {
            updateAlert(alert);
            console.log('duration', duration);
            return clearTimeoutId = setTimeout(clearAlert, Math.ceil(duration));
          } else {
            return clearAlert();
          }
        }
      };
      sockets.on('receiver-updated', function (chromecast) {
        if (exports.chromecast.id === chromecast.id)
          return updateChromecast(chromecast);
      });
      sockets.on('takeover-created', function (takeover) {
        return updateChannelId(takeover.channelId);
      });
      sockets.on('takeover-updated', function (takeover) {
        return updateChannelId(takeover.channelId);
      });
      sockets.on('takeover-deleted', function () {
        return loadChromecastFromPersistence();
      });
      sockets.on('alert-created', function (alert) {
        console.log('Creating alert', alert);
        return createAlert(alert);
      });
      loadChromecastFromPersistence();
      exports = {
        setChromecastId: function (id) {
          loadChromecast(id);
          return localStorage.setItem('chromecast-id', id);
        },
        on: function (event, func) {
          return listeners[event].push(func);
        },
        chromecast: null
      };
      return exports;
    });
  });
  require.define('/src/client/services/flash.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').factory('flash', function () {
      var exports, listeners;
      listeners = { message: [] };
      return exports = {
        on: function (key, func) {
          return listeners[key].push(func);
        },
        message: function (msg) {
          var l;
          return function (accum$) {
            for (var i$ = 0, length$ = listeners.message.length; i$ < length$; ++i$) {
              l = listeners.message[i$];
              accum$.push(l(msg));
            }
            return accum$;
          }.call(this, []);
        }
      };
    });
  });
  require.define('/src/client/services/cast-away.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').factory('castAway', function (CONFIG) {
      var castAway, exports, listeners;
      castAway = null;
      listeners = { 'receivers:available': [] };
      exports = {
        available: false,
        on: function (key, func) {
          return listeners[key].push(func);
        },
        connect: function (cb) {
          if (!castAway)
            return;
          return castAway.requestSession(cb);
        },
        receiver: function () {
          if (!castAway)
            return;
          return castAway.receiver();
        }
      };
      if ('undefined' !== typeof chrome && null != chrome ? chrome.cast : void 0) {
        if (null != chrome.cast.timeout)
          chrome.cast.timeout;
        else
          chrome.cast.timeout = {};
        chrome.cast.timeout.requestSession = 2e4;
        castAway = window.castAway = new CastAway({
          applicationID: CONFIG.chromecastApplicationId,
          namespace: 'urn:x-cast:json'
        });
        castAway.on('receivers:available', function () {
          var l;
          console.log('receivers available');
          exports.available = true;
          for (var i$ = 0, length$ = listeners['receivers:available'].length; i$ < length$; ++i$) {
            l = listeners['receivers:available'][i$];
            l();
          }
          return $('#cast').click(function (ev) {
            return ev.preventDefault();
          });
        });
        castAway.initialize(function (err, data) {
          return console.log('initialized', err, data);
        });
      }
      return exports;
    });
  });
  require.define('/src/client/resources/takeover.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').factory('Takeover', function ($resource) {
      var resource;
      resource = $resource('/api/takeover', null, { update: { method: 'PUT' } });
      return {
        get: function (id) {
          return resource.get();
        },
        query: function (args) {
          args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
          return resource.query.apply(resource, [].slice.call(args));
        },
        save: function (data, cb) {
          if (null == cb)
            cb = function () {
            };
          return resource.save(data, cb);
        },
        remove: function (data, cb) {
          if (null == cb)
            cb = function () {
            };
          return resource.remove(cb);
        }
      };
    });
  });
  require.define('/src/client/resources/chromecast.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').factory('Chromecast', function ($resource) {
      var resource;
      resource = $resource('/api/receivers/:id', null, { update: { method: 'PUT' } });
      return {
        get: function (id) {
          return resource.get({ id: id });
        },
        query: function (args) {
          args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
          return resource.query.apply(resource, [].slice.call(args));
        },
        save: function (data, cb) {
          if (null == cb)
            cb = function () {
            };
          if (data.id) {
            if (data.alert && new Date(data.alert.expiresAt).getTime() < new Date().getTime())
              data.alert = null;
            return resource.update({ id: data.id }, data, cb);
          } else {
            return resource.save(data, cb);
          }
        },
        remove: function (data, cb) {
          if (null == cb)
            cb = function () {
            };
          return resource.remove({ id: data.id }, cb);
        }
      };
    });
  });
  require.define('/src/client/resources/channel.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').factory('Channel', function ($resource) {
      var resource;
      resource = $resource('/api/channels/:id', null, { update: { method: 'PUT' } });
      return {
        get: function (id) {
          return resource.get({ id: id });
        },
        query: function (args) {
          args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
          return resource.query.apply(resource, [].slice.call(args));
        },
        save: function (data, cb) {
          if (null == cb)
            cb = function () {
            };
          if (data.id) {
            return resource.update({ id: data.id }, data, cb);
          } else {
            return resource.save(data, cb);
          }
        },
        remove: function (data, cb) {
          if (null == cb)
            cb = function () {
            };
          return resource.remove({ id: data.id }, cb);
        }
      };
    });
  });
  require.define('/src/client/resources/alert.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').factory('Alert', function ($resource) {
      var resource;
      resource = $resource('/api/alerts/:id', null, { update: { method: 'PUT' } });
      return {
        get: function (id) {
          return resource.get({ id: id });
        },
        query: function (args) {
          args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
          return resource.query.apply(resource, [].slice.call(args));
        },
        save: function (data, cb) {
          if (null == cb)
            cb = function () {
            };
          if (data.id) {
            return resource.update({ id: data.id }, data, cb);
          } else {
            return resource.save(data, cb);
          }
        },
        remove: function (data, cb) {
          if (null == cb)
            cb = function () {
            };
          return resource.remove({ id: data.id }, cb);
        }
      };
    });
  });
  require.define('/src/client/directives/real-link.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').directive('realLink', function () {
      return function (scope, element, attrs) {
        var $el;
        $el = $(element);
        return $el.click(function (e) {
          return window.location.href = $el.attr('href');
        });
      };
    });
  });
  require.define('/src/client/directives/flash-container.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').directive('flashContainer', function (flash) {
      return {
        transclude: false,
        restrict: 'E',
        replace: true,
        template: "<div id='alerts'></div>",
        link: function (scope, element, attrs) {
          return flash.on('message', function (msg) {
            var el, remove;
            el = $("<div class='flash-msg'>" + msg + '</div>');
            $(element).append(el);
            remove = function () {
              return el.remove();
            };
            return setTimeout(remove, 5e3);
          });
        }
      };
    });
  });
  require.define('/src/client/controllers/takeover-form.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').controller('TakeoverForm', function ($scope, flash, Channel, Takeover) {
      $scope.takeover = Takeover.get();
      $scope.channels = Channel.query();
      $scope.onFormSubmit = function () {
        return Takeover.save($scope.takeover, function (t) {
          var channel;
          if (null != $scope.takeover.id)
            $scope.takeover.id;
          else
            $scope.takeover.id = t.id;
          channel = _($scope.channels).detect(function (ch) {
            return ch.id === $scope.takeover.channelId;
          });
          return flash.message("The '" + channel.name + "' channel has taken over.");
        });
      };
      return $scope.onStop = function ($event) {
        $event.stopPropagation();
        $event.preventDefault();
        return Takeover.remove($scope.takeover, function () {
          $scope.takeover = {};
          return flash.message('The takeover has stopped.');
        });
      };
    });
  });
  require.define('/src/client/controllers/screen.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').controller('Screen', function ($scope, $sce, $location, Channel) {
      var id, lastTimeoutId, mainContentUrlCounter, rotateMainContentUrl;
      id = $location.url().match(/\/channels\/([^\/\?]+)/)[1];
      $scope.channel = Channel.get(id);
      $scope.channel.$promise.then(function (channel) {
        return setTimeout(rotateMainContentUrl, 0);
      });
      mainContentUrlCounter = 0;
      lastTimeoutId = null;
      return rotateMainContentUrl = function () {
        var cell, seconds, urls;
        clearTimeout(lastTimeoutId);
        cell = $scope.channel.cells[0];
        urls = cell.urls;
        if (urls.length === 1) {
          $scope.mainContentUrl = $sce.trustAsResourceUrl(urls[0].url);
        } else {
          $scope.mainContentUrl = $sce.trustAsResourceUrl(urls[mainContentUrlCounter].url);
          mainContentUrlCounter++;
          if (mainContentUrlCounter >= urls.length)
            mainContentUrlCounter = 0;
          seconds = parseInt(cell.duration, 10);
          lastTimeoutId = setTimeout(rotateMainContentUrl, seconds * 1e3);
        }
        if (!$scope.$$phase)
          return $scope.$apply();
      };
    });
  });
  require.define('/src/client/controllers/receiver.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').controller('Receiver', function ($scope, $sce, $location, localDevice) {
      var match;
      if (match = $location.url().match(/\/chromecasts\/([^\/\?#]+)/))
        localDevice.setChromecastId(match[1]);
      $scope.title = 'Setting Up Chromecast';
      $scope.chromecast = null;
      $scope.channelUrl = null;
      localDevice.on('change', function (c) {
        $scope.chromecast = c;
        $scope.title = 'Greenscreen - ' + c.name;
        $scope.channelUrl = $sce.trustAsResourceUrl('/channels/' + c.channelId);
        if (!$scope.$$phase)
          return $scope.$apply();
      });
      return window.onload = function () {
        var castAway, e, receiver;
        try {
          castAway = new CastAway;
          receiver = castAway.receive();
          return receiver.on('setChromecastId', function (id) {
            return localDevice.setChromecastId(id);
          });
        } catch (e$) {
          e = e$;
          return console.log('Cannot load CastAway', e);
        }
      };
    });
  });
  require.define('/src/client/controllers/chromecast-form.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').controller('ChromecastForm', function ($scope, $routeParams, $location, castAway, flash, Chromecast, Channel) {
      var connect, session;
      $scope.chromecast = $routeParams.id ? Chromecast.get($routeParams.id) : {};
      $scope.channels = Channel.query();
      session = null;
      connect = function () {
        return castAway.connect(function (err, s) {
          if (err)
            return console.log('ERR', err);
          session = s;
          return $scope.$apply(function () {
            return $scope.chromecast.name = session.session.receiver.friendlyName;
          });
        });
      };
      if (!$routeParams.id)
        connect();
      $scope.reconnect = function () {
        return connect();
      };
      $scope.onFormSubmit = function () {
        return Chromecast.save($scope.chromecast, function (chromecast) {
          flash.message("Your changes to '" + $scope.chromecast.name + "' have been saved.");
          if (session)
            session.send('setChromecastId', chromecast.id);
          return $location.url('/chromecasts');
        });
      };
      return $scope.deleteChannel = function () {
        console.log('deleteing', $scope.chromecast);
        return Chromecast.remove($scope.chromecast, function () {
          flash.message("The Chromecast '" + $scope.chromecast.name + "' has been deleted.");
          return $location.url('/chromecasts');
        });
      };
    });
  });
  require.define('/src/client/controllers/chromecasts.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').controller('Chromecasts', function ($scope, Chromecast, castAway) {
      $scope.chromecasts = Chromecast.query();
      $scope.chromecastAvailable = castAway.available;
      console.log('Initial Chromecast available', $scope.chromecastAvailable);
      return castAway.on('receivers:available', function () {
        $scope.$apply(function () {
          return $scope.chromecastAvailable = true;
        });
        return console.log('Chromecast is available', $scope.chromecastAvailable);
      });
    });
  });
  require.define('/src/client/controllers/channel-form.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').controller('ChannelForm', function ($scope, $routeParams, $location, flash, Channel) {
      $scope.mainUrls = [];
      $scope.channel = $routeParams.id ? Channel.get($routeParams.id) : {
        layout: 'single-cell',
        cells: [
          {
            urls: [{ url: '' }],
            duration: 60
          },
          {
            urls: [{ url: '' }],
            duration: 60
          }
        ]
      };
      if (null != $scope.channel.$promise)
        $scope.channel.$promise.then(function (channel) {
          return console.log(channel);
        });
      $scope.onFormSubmit = function () {
        return Channel.save($scope.channel, function () {
          flash.message("Your changes to '" + $scope.channel.name + "' have been saved.");
          return $location.url('/channels');
        });
      };
      $scope.deleteChannel = function () {
        return Channel.remove($scope.channel, function () {
          flash.message("The channel '" + $scope.channel.name + "' has been deleted.");
          return $location.url('/channels');
        });
      };
      return $scope.removeUrlFromCell = function (url, cellIndex) {
        return $scope.channel.cells[cellIndex].urls = _.without($scope.channel.cells[cellIndex].urls, url);
      };
    });
  });
  require.define('/src/client/controllers/channels.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').controller('Channels', function ($scope, Channel) {
      return $scope.channels = Channel.query();
    });
  });
  require.define('/src/client/controllers/main.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').controller('Main', function ($scope) {
      return $scope.username = '';
    });
  });
  require.define('/src/client/controllers/alert-form.coffee', function (module, exports, __dirname, __filename) {
    angular.module('GScreen').controller('AlertForm', function ($scope, $location, flash, Alert) {
      $scope.maxTextLength = 140;
      $scope.alert = {
        style: 'default',
        duration: 60
      };
      return $scope.onFormSubmit = function () {
        var seconds;
        seconds = $scope.alert.duration;
        $scope.alert.expiresAt = new Date(new Date().getTime() + seconds * 1e3).toISOString();
        return Alert.save($scope.alert, function () {
          flash.message('Your alert has been saved.');
          return $location.url('/');
        });
      };
    });
  });
  require.define('/src/client/routes.coffee', function (module, exports, __dirname, __filename) {
    GScreen.config(function ($routeProvider, $locationProvider) {
      $routeProvider.when('/', { templateUrl: '/templates/main.html' });
      $routeProvider.when('/channels', { templateUrl: '/templates/channels/index.html' });
      $routeProvider.when('/channels/new', { templateUrl: '/templates/channels/new.html' });
      $routeProvider.when('/channels/:id/edit', { templateUrl: '/templates/channels/edit.html' });
      $routeProvider.when('/chromecasts', { templateUrl: '/templates/chromecasts/index.html' });
      $routeProvider.when('/alert', { templateUrl: '/templates/alert/index.html' });
      $routeProvider.when('/takeover', { templateUrl: '/templates/takeover/index.html' });
      $routeProvider.when('/chromecasts/new', { templateUrl: '/templates/chromecasts/new.html' });
      $routeProvider.when('/chromecasts/:id/edit', { templateUrl: '/templates/chromecasts/edit.html' });
      return $locationProvider.html5Mode(true);
    });
  });
  require('/src/client/gscreen.coffee');
}.call(this, this));