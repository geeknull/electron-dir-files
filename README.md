# electron-dir-files

In Electron, use the `webkitdirectory` property in input element has bug.

So I used Electron Dialog get the directory name, and create the fakeBrowserFile for `renderer-process`,
You can use it for existing Browser JavaScript Library, but modified a little.

```javascript
let electronDirFile = require('electron-dir-files');

someElement.addEventListener('click', () => {
    electronDirFile().then(files => {
        // use the files like `webkitdirectory` get
    })
})

// fakeBrowserFile to Blob
file.toBlob().then(blob => {
    // blob is the file
})

let slicer = file.slice(0, 100);
slicer().then(blob => {
    // the slice blob
})

```