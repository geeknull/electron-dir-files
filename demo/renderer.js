let electronDirFile = require('../src/index');

// get all file
let getDirFilesAll = async function () {
  // electronDirFile().then(files => {
  //   console.log(files);
  // });
  let files = await electronDirFile();
  console.log(files);
  if (files) {
    let file = files[0];
    let blob = await file.slice(0, 3).toBlob();
    console.log(blob);
  }
};

// use generator one by one
let getDirFilesOneByOne = () => {
  let gen = electronDirFile.getBrowserFilesGen();
  let selDirPromise = gen.next(); // first next is select dir promise

  selDirPromise.value.then((pathInfo) => {
    let {selectDirAbsolutePath, selectDirRelativePath} = pathInfo;
    let it = gen.next(selectDirRelativePath+'2'); // second next set new selectDirRelativePath and get the first file

    while (it.done === false) {
      console.log(it.value.isDirectory ? '_dir' : 'file', it.value.webkitRelativePath);
      it = gen.next();
    }
    console.log('read end');

    // dealy
    // let timer = setInterval(() => {
    //   if (it.done === false) {
    //     console.log(it.value.isDirectory ? '_dir' : 'file', it.value.webkitRelativePath);
    //     it = gen.next();
    //   } else {
    //     clearInterval(timer);
    //     console.log('read end');
    //   }
    // }, 0);
  });
};

let getDirFilesOneByOne2 = async () => {
  let resovle;
  let p = new Promise(async (resolve, reject) => {
    let d = await electronDirFile.getBrowserFilesGen2(resolve);
  }).then((val) => {
    debugger
  })
};

document.querySelector('#getDir').addEventListener('click', async () => {
  getDirFilesAll();
  // getDirFilesOneByOne();
  // getDirFilesOneByOne2();
});
