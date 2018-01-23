let FakeBrowserDir = class {
  constructor (filePathAbs, rootDirAbs, rootDirRel) {
    this.path = filePathAbs;
    this._path = filePathAbs;
    this.webkitRelativePath = rootDirRel + this._path.replace(rootDirAbs, '');
    this.isDirectory = true;
  }
};

module.exports = FakeBrowserDir;
