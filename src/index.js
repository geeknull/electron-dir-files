let remote = window.require('electron').remote;
let fs = window.require('fs');
let path = window.require('path');
let dialog = remote.dialog;
let FakeBrowserFile = require('./fakeBrowserFile.js');
let FakeBrowserDir = require('./fakeBrowserDir.js');

// get selected dir
let getDirPaths = () => new Promise((resolve, reject) => {
  dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: ['openDirectory'] // file is openFile
  }, resolve);
});

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

  let rootDirAbs = paths[0];
  let filesPath = await getFiles(rootDirAbs);

  let rootDirPre = rootDirAbs.replace(rootDirAbs.split(path.sep).pop(), '');
  let rootDirRel = rootDirAbs.replace(rootDirPre, '');

  let files = filesPath.map((_path) => {
    return new FakeBrowserFile(_path, rootDirAbs, rootDirRel);
  });

  return files;
};
module.exports = getBrowserFiles;

/*************** new api ***************/ 

let pathIsDirSync = filePathAbs => {
  // TODO try
  let stat = fs.statSync(filePathAbs);
  if (stat.isDirectory()) {
    return true;
  } else {
    return false;
  }
}

let readDirSync = function* (parentPathAbs, rootDirAbs, rootDirRel) {
  let childPathsAbs = fs.readdirSync(parentPathAbs);
  if (childPathsAbs) {
    for (let i = 0, len = childPathsAbs.length; i < len; i++) {
      let filePathAbs = path.join(parentPathAbs, childPathsAbs[i]);
      if (pathIsDirSync(filePathAbs)) {
        yield new FakeBrowserDir(filePathAbs, rootDirAbs, rootDirRel);
        yield* readDirSync(filePathAbs, rootDirAbs, rootDirRel);
      } else {
        yield new FakeBrowserFile(filePathAbs, rootDirAbs, rootDirRel);
      }
    }
  }
};

let readDirGen = function* (){
  yield* readDirSync(selectDirAbsolutePath, selectDirAbsolutePath, selectDirRelativePath);
};

let getBrowserFilesGen = function* () {
  let selectDirAbsolutePath = null;
  let selectDirRelativePath = null;
  let selectDirPreviousPath = null;

  let newSelectDirRelativePath = yield getDirPaths().then((selectDirs) => {
    // get absolute dir path, if not select is undefined
    selectDirAbsolutePath = selectDirs ? selectDirs[0] : selectDirs;

    // get relative path, previous path
    if (selectDirAbsolutePath) {
      selectDirPreviousPath = selectDirAbsolutePath.replace(selectDirAbsolutePath.split(path.sep).pop(), '');
      selectDirRelativePath = selectDirAbsolutePath.replace(selectDirPreviousPath, '');
    }
    return {selectDirAbsolutePath, selectDirRelativePath};
  });

  if (!selectDirAbsolutePath) {return void 0;} // if not selected dir return

  // support custom config selectDirRealtivePath
  if (newSelectDirRelativePath) {
    selectDirRelativePath = newSelectDirRelativePath;
  }
  // yield {selectDirAbsolutePath, selectDirRelativePath};

  
  yield* readDirSync(selectDirAbsolutePath, selectDirAbsolutePath, selectDirRelativePath);
}


getBrowserFiles.getBrowserFilesGen = getBrowserFilesGen;

let getBrowserFilesGen2 = async(p) => {
  let selectDirAbsolutePath = null;
  let selectDirRelativePath = null;
  let selectDirPreviousPath = null;

  let selectDirs = await getDirPaths();
  selectDirAbsolutePath = selectDirs ? selectDirs[0] : selectDirs;
  if (selectDirAbsolutePath) {
    selectDirPreviousPath = selectDirAbsolutePath.replace(selectDirAbsolutePath.split(path.sep).pop(), '');
    selectDirRelativePath = selectDirAbsolutePath.replace(selectDirPreviousPath, '');
  }
  return p({selectDirAbsolutePath, selectDirRelativePath});
  // return {selectDirAbsolutePath, selectDirRelativePath};
};

getBrowserFiles.getBrowserFilesGen = getBrowserFilesGen;
