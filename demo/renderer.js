let electronDirFile = require('../src/index');

document.querySelector('#getDir').addEventListener('click', () => {
  electronDirFile().then(files => {
    console.log(files);
  })
});
