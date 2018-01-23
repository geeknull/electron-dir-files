let electronDirFile = require('../src/index');

// get all file
let getDirFilesAll = async function () {
  electronDirFile().then(files => {
    console.log(files);
  });
  let files = await electronDirFile();
  if (files) {
    let file = files[0];
    let blob = await file.slice(0, 3).toBlob();
    console.log(blob);
  }
};

// use generator one by one
let getDirFilesOneByOne = () => {
  let gen = electronDirFile.getBrowserFilesGen();
  let selDirPromise = gen.next();

  selDirPromise.value.then((pathInfo) => {
    let {selectDirAbsolutePath, selectDirRelativePath} = pathInfo;
    let f = fileGen.next(selectDirRelativePath+'2');
    while (f.done === false) {
      console.log(f.value.isDirectory ? ' dir' : 'file', f.value.webkitRelativePath);
      f = fileGen.next();
    }
    // let timer = setInterval(() => {
    //   let genRes = fileGen.next();
    //   if (genRes.done === true) {
    //     clearInterval(timer);
    //   } else {
    //     console.log(genRes.value.path);
    //   }
    // }, 0);
  });
};


document.querySelector('#getDir').addEventListener('click', async () => {
  // getDirFilesAll();
  getDirFilesOneByOne();
});
