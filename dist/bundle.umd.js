(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('mime-types')) :
	typeof define === 'function' && define.amd ? define(['mime-types'], factory) :
	(global.electronDirFiles = factory(global.mimeTypes));
}(this, (function (mimeTypes) { 'use strict';

mimeTypes = mimeTypes && mimeTypes.hasOwnProperty('default') ? mimeTypes['default'] : mimeTypes;

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var fs = window.require('fs');
var path = window.require('path');

var FakeBrowserFile = function () {
  function FakeBrowserFile(filePathAbs, rootDirAbs, rootDirRel) {
    classCallCheck(this, FakeBrowserFile);

    this.path = filePathAbs;
    this._path = filePathAbs;
    this.fd = null;
    this.status = 'init';
    this.open();
    this.close();
    this.isDirectory = false;
    if (this.status !== 'success') {
      return void 0;
    } // TODO throw
    this.stats = fs.statSync(this._path); // TODO try

    this.lastModified = new Date(this.stats.mtime).getTime();
    this.lastModifiedDate = new Date(this.lastModified);
    this.name = path.basename(this._path);
    this.path; // already do
    this.size = this.stats.size;
    this.type = mimeTypes.lookup(this.name);
    this.webkitRelativePath = rootDirRel + this._path.replace(rootDirAbs, '');
  }

  createClass(FakeBrowserFile, [{
    key: 'open',
    value: function open() {
      try {
        this.fd = fs.openSync(path.resolve(this._path), 'r');
        this.status = 'success';
      } catch (err) {
        this.status = 'error';
      }
    }
  }, {
    key: 'openFile',
    value: function openFile(_p) {
      var fd = null;
      try {
        fd = fs.openSync(path.resolve(_p), 'r');
      } catch (e) {}
      return fd;
    }
  }, {
    key: 'closeFile',
    value: function closeFile(df) {
      try {
        df && fs.closeSync(fd);
      } catch (e) {}
    }
  }, {
    key: 'slice',
    value: function slice(start, end) {
      var _this = this;

      // let fileBolb = fs.readSync(this.fd, buf, 0, len, start);
      return {
        toBlob: function toBlob() {
          return new Promise(function (resolve, reject) {
            var len = end - start;
            var buf = new Buffer(len);
            var fd = _this.openFile(_this._path); // TODO error null throw
            fs.read(fd, buf, 0, len, start, function (err, bytesRead, buffer) {
              var blob = new Blob([buffer]);
              resolve(blob);
              _this.closeFile(fd);
            });
          });
        }
      };
    }
  }, {
    key: 'close',
    value: function close() {
      fs.closeSync(this.fd);
    }
  }, {
    key: 'toBlob',
    value: function toBlob() {
      var _this2 = this;

      // let buf = fs.readFileSync(this.path);
      return new Promise(function (resolve, reject) {
        fs.readFile(_this2._path, function (err, data) {
          var blob = new Blob([data], { type: _this2.type });
          resolve(blob);
        });
      });
    }
  }]);
  return FakeBrowserFile;
}();

var fakeBrowserFile = FakeBrowserFile;

var FakeBrowserDir = function FakeBrowserDir(filePathAbs, rootDirAbs, rootDirRel) {
  classCallCheck(this, FakeBrowserDir);

  this.path = filePathAbs;
  this._path = filePathAbs;
  this.webkitRelativePath = rootDirRel + this._path.replace(rootDirAbs, '');
  this.isDirectory = true;
};

var fakeBrowserDir = FakeBrowserDir;

var src = createCommonjsModule(function (module) {
  var _this = this;

  var remote = window.require('electron').remote;
  var fs = window.require('fs');
  var path = window.require('path');
  var dialog = remote.dialog;

  // get selected dir
  var getDirPaths = function getDirPaths() {
    return new Promise(function (resolve, reject) {
      dialog.showOpenDialog(remote.getCurrentWindow(), {
        properties: ['openDirectory'] // file is openFile
      }, resolve);
    });
  };

  var childIsDir = function childIsDir(filePath) {
    return new Promise(function (resolve, reject) {
      fs.stat(filePath, function () {
        var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(err, stat) {
          var isDir;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  isDir = stat.isDirectory();

                  resolve(isDir);

                case 2:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, _this);
        }));

        return function (_x3, _x4) {
          return _ref2.apply(this, arguments);
        };
      }());
    });
  };

  var readDir = function readDir(dir, files) {
    return new Promise(function (resolve, reject) {
      fs.readdir(dir, function () {
        var _ref3 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(err, _files) {
          var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, filePath, isDir;

          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _iteratorNormalCompletion = true;
                  _didIteratorError = false;
                  _iteratorError = undefined;
                  _context3.prev = 3;
                  _iterator = _files[Symbol.iterator]();

                case 5:
                  if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                    _context3.next = 20;
                    break;
                  }

                  file = _step.value;
                  filePath = path.join(dir, file);
                  _context3.next = 10;
                  return childIsDir(filePath);

                case 10:
                  isDir = _context3.sent;

                  if (!isDir) {
                    _context3.next = 16;
                    break;
                  }

                  _context3.next = 14;
                  return readDir(filePath, files);

                case 14:
                  _context3.next = 17;
                  break;

                case 16:
                  files.push(filePath);

                case 17:
                  _iteratorNormalCompletion = true;
                  _context3.next = 5;
                  break;

                case 20:
                  _context3.next = 26;
                  break;

                case 22:
                  _context3.prev = 22;
                  _context3.t0 = _context3['catch'](3);
                  _didIteratorError = true;
                  _iteratorError = _context3.t0;

                case 26:
                  _context3.prev = 26;
                  _context3.prev = 27;

                  if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                  }

                case 29:
                  _context3.prev = 29;

                  if (!_didIteratorError) {
                    _context3.next = 32;
                    break;
                  }

                  throw _iteratorError;

                case 32:
                  return _context3.finish(29);

                case 33:
                  return _context3.finish(26);

                case 34:
                  resolve();

                case 35:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, _this, [[3, 22, 26, 34], [27,, 29, 33]]);
        }));

        return function (_x5, _x6) {
          return _ref3.apply(this, arguments);
        };
      }());
    });
  };

  var getFiles = function getFiles(_path) {
    return new Promise(function () {
      var _ref4 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(resolve, reject) {
        var files;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                files = [];
                _context4.next = 3;
                return readDir(_path, files);

              case 3:
                resolve(files);

              case 4:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this);
      }));

      return function (_x7, _x8) {
        return _ref4.apply(this, arguments);
      };
    }());
  };

  var getBrowserFiles = function () {
    var _ref5 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var paths, rootDirAbs, filesPath, rootDirPre, rootDirRel, files;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return getDirPaths();

            case 2:
              paths = _context5.sent;

              if (paths) {
                _context5.next = 5;
                break;
              }

              return _context5.abrupt('return', void 0);

            case 5:
              rootDirAbs = paths[0];
              _context5.next = 8;
              return getFiles(rootDirAbs);

            case 8:
              filesPath = _context5.sent;
              rootDirPre = rootDirAbs.replace(rootDirAbs.split(path.sep).pop(), '');
              rootDirRel = rootDirAbs.replace(rootDirPre, '');
              files = filesPath.map(function (_path) {
                return new fakeBrowserFile(_path, rootDirAbs, rootDirRel);
              });
              return _context5.abrupt('return', files);

            case 13:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this);
    }));

    return function getBrowserFiles() {
      return _ref5.apply(this, arguments);
    };
  }();
  module.exports = getBrowserFiles;

  /*************** new api ***************/

  var pathIsDirSync = function pathIsDirSync(filePathAbs) {
    // TODO try
    var stat = fs.statSync(filePathAbs);
    if (stat.isDirectory()) {
      return true;
    } else {
      return false;
    }
  };

  var readDirSync = /*#__PURE__*/regeneratorRuntime.mark(function readDirSync(parentPathAbs, rootDirAbs, rootDirRel) {
    var childPathsAbs, i, len, filePathAbs;
    return regeneratorRuntime.wrap(function readDirSync$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            childPathsAbs = fs.readdirSync(parentPathAbs);

            if (!childPathsAbs) {
              _context6.next = 16;
              break;
            }

            i = 0, len = childPathsAbs.length;

          case 3:
            if (!(i < len)) {
              _context6.next = 16;
              break;
            }

            filePathAbs = path.join(parentPathAbs, childPathsAbs[i]);

            if (!pathIsDirSync(filePathAbs)) {
              _context6.next = 11;
              break;
            }

            _context6.next = 8;
            return new fakeBrowserDir(filePathAbs, rootDirAbs, rootDirRel);

          case 8:
            return _context6.delegateYield(readDirSync(filePathAbs, rootDirAbs, rootDirRel), 't0', 9);

          case 9:
            _context6.next = 13;
            break;

          case 11:
            _context6.next = 13;
            return new fakeBrowserFile(filePathAbs, rootDirAbs, rootDirRel);

          case 13:
            i++;
            _context6.next = 3;
            break;

          case 16:
          case 'end':
            return _context6.stop();
        }
      }
    }, readDirSync, this);
  });

  var readDirGen = /*#__PURE__*/regeneratorRuntime.mark(function readDirGen() {
    return regeneratorRuntime.wrap(function readDirGen$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            return _context7.delegateYield(readDirSync(selectDirAbsolutePath, selectDirAbsolutePath, selectDirRelativePath), 't0', 1);

          case 1:
          case 'end':
            return _context7.stop();
        }
      }
    }, readDirGen, this);
  });

  var getBrowserFilesGen = /*#__PURE__*/regeneratorRuntime.mark(function getBrowserFilesGen() {
    var selectDirAbsolutePath, selectDirRelativePath, selectDirPreviousPath, newSelectDirRelativePath;
    return regeneratorRuntime.wrap(function getBrowserFilesGen$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            selectDirAbsolutePath = null;
            selectDirRelativePath = null;
            selectDirPreviousPath = null;
            _context8.next = 5;
            return getDirPaths().then(function (selectDirs) {
              // get absolute dir path, if not select is undefined
              selectDirAbsolutePath = selectDirs ? selectDirs[0] : selectDirs;

              // get relative path, previous path
              if (selectDirAbsolutePath) {
                selectDirPreviousPath = selectDirAbsolutePath.replace(selectDirAbsolutePath.split(path.sep).pop(), '');
                selectDirRelativePath = selectDirAbsolutePath.replace(selectDirPreviousPath, '');
              }
              return { selectDirAbsolutePath: selectDirAbsolutePath, selectDirRelativePath: selectDirRelativePath };
            });

          case 5:
            newSelectDirRelativePath = _context8.sent;

            if (selectDirAbsolutePath) {
              _context8.next = 8;
              break;
            }

            return _context8.abrupt('return', void 0);

          case 8:
            // if not selected dir return

            // support custom config selectDirRealtivePath
            if (newSelectDirRelativePath) {
              selectDirRelativePath = newSelectDirRelativePath;
            }
            // yield {selectDirAbsolutePath, selectDirRelativePath};


            return _context8.delegateYield(readDirSync(selectDirAbsolutePath, selectDirAbsolutePath, selectDirRelativePath), 't0', 10);

          case 10:
          case 'end':
            return _context8.stop();
        }
      }
    }, getBrowserFilesGen, this);
  });

  getBrowserFiles.getBrowserFilesGen = getBrowserFilesGen;

  var getBrowserFilesGen2 = function () {
    var _ref6 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(p) {
      var selectDirAbsolutePath, selectDirRelativePath, selectDirPreviousPath, selectDirs;
      return regeneratorRuntime.wrap(function _callee6$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              selectDirAbsolutePath = null;
              selectDirRelativePath = null;
              selectDirPreviousPath = null;
              _context9.next = 5;
              return getDirPaths();

            case 5:
              selectDirs = _context9.sent;

              selectDirAbsolutePath = selectDirs ? selectDirs[0] : selectDirs;
              if (selectDirAbsolutePath) {
                selectDirPreviousPath = selectDirAbsolutePath.replace(selectDirAbsolutePath.split(path.sep).pop(), '');
                selectDirRelativePath = selectDirAbsolutePath.replace(selectDirPreviousPath, '');
              }
              return _context9.abrupt('return', p({ selectDirAbsolutePath: selectDirAbsolutePath, selectDirRelativePath: selectDirRelativePath }));

            case 9:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee6, _this);
    }));

    return function getBrowserFilesGen2(_x9) {
      return _ref6.apply(this, arguments);
    };
  }();

  getBrowserFiles.getBrowserFilesGen = getBrowserFilesGen;
});

return src;

})));
//# sourceMappingURL=bundle.umd.js.map
