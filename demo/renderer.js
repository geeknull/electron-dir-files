let electronDirFile = require('../src/index');

document.querySelector('#getDir').addEventListener('click', async () => {
  // electronDirFile().then(files => {
  //   console.log(files);
  // });
  let files = await electronDirFile();
  if (files) {
    let file = files[0];
    let blob = await file.slice(0, 3).toBlob();
    console.log(blob);
    debugger
  }
  debugger
});
