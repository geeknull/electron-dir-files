let fs = window.require('fs');
let path = window.require('path');
let mime = require('mime-types');

let FakeBrowserFile = class {
  constructor(filePathAbs, rootDirAbs, rootDirRel) {
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
    this.path // already do
    this.size = this.stats.size;
    this.type = mime.lookup(this.name);
    this.webkitRelativePath = rootDirRel + this._path.replace(rootDirAbs, '');
  }

  open() {
    try {
      this.fd = fs.openSync(path.resolve(this._path), 'r');
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
        let buf = Buffer.alloc(len);
        let fd = this.openFile(this._path); // TODO error null throw
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
      fs.readFile(this._path, (err, data) => {
        let blob = new Blob([data], {type: this.type});
        resolve(blob);
      });
    });
  }
};

module.exports = FakeBrowserFile;
