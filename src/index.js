let remote = require('electron').remote;
let fs = window.require('fs');
let path = window.require('path');
let dialog = remote.dialog;
let mime = require('mime-types');

// get selected dir
let getDirPaths = () => new Promise((resolve, reject) => {
  dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: ['openDirectory'] // file is openFile
  }, resolve);
});

let FakeBrowserFile = class {
  constructor(filePath, preDirPath) {
    this.path = filePath;
    this.fd = null;
    this.status = 'init';
    this.open();
    this.close();
    if (this.status !== 'success') {
      return void 0;
    } // TODO throw
    this.stats = fs.statSync(this.path); // TODO try

    this.lastModified = new Date(this.stats.mtime).getTime();
    this.lastModifiedDate = new Date(this.lastModified);
    this.name = path.basename(this.path);
    this.path // already do
    this.size = this.stats.size;
    this.type = mime.lookup(this.name);
    this.webkitRelativePath = this.path.replace(preDirPath, '');
  }

  open() {
    try {
      this.fd = fs.openSync(path.resolve(this.path), 'r');
      this.status = 'success';
    } catch (err) {
      this.status = 'error';
    }
  }

  openFile(_p) {
    let fd = null;
    try {
      fd = fs.openSync(path.resolve(_p), 'r');
    } catch (e) {}
    return fd
  }

  closeFile(df) {
    try {
      df && fs.closeSync(fd);
    } catch (e) {}
  }

  slice(start, end) {
    // let fileBolb = fs.readSync(this.fd, buf, 0, len, start);
    return {
      toBlob: () => new Promise((resolve, reject) => {
        let len = end - start;
        let buf = new Buffer(len);
        let fd = this.openFile(this.path); // TODO error null throw
        fs.read(fd, buf, 0, len, start, (err, bytesRead, buffer) => {
          let blob = new Blob([buffer]);
          resolve(blob);
          this.closeFile(fd);
        });
      })
    }
  }

  close() {
    fs.closeSync(this.fd);
  }

  toBlob() {
    // let buf = fs.readFileSync(this.path);
    return new Promise((resolve, reject) => {
      fs.readFile(this.path, (err, data) => {
        let blob = new Blob([data], {type: this.type});
        resolve(blob);
      });
    });
  }
};

let childFileOrDir = (filePath, files) => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, async (err, stat) => {
      if (stat.isDirectory()) {
        await readDir(filePath, files);
        resolve();
      } else {
        files.push(filePath);
        resolve();
      }
    })
  });
};

let childIsDir = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, async (err, stat) => {
      let isDir = stat.isDirectory();
      resolve(isDir);
    })
  })
};

let readDir = (dir, files) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, async (err, _files) => {
      for (let file of _files) {
        let filePath = path.join(dir, file);
        let isDir = await childIsDir(filePath);
        if (isDir) {
          await readDir(filePath, files);
        } else {
          files.push(filePath);
        }
      }
      resolve();
    });
  })
};

let getFiles = (_path) => {
  return new Promise(async (resolve, reject) => {
    let files = [];
    await readDir(_path, files);
    resolve(files);
  });
};

let getBrowserFiles = async () => {
  let paths = await getDirPaths();
  if (!paths) {
    return void 0;
  }

  let dirPath = paths[0];
  let filesPath = await getFiles(dirPath);

  let preDirPath = dirPath.replace(dirPath.split(path.sep).pop(), '');
  let files = filesPath.map((_path) => {
    return new FakeBrowserFile(_path, preDirPath);
  });

  return files;
};
module.exports = getBrowserFiles;
