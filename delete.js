var rmdir = require('rmdir');
var path1 = './json';
var path2 = './images';

rmdir(path1, function (err, dirs, files) {
  console.log(`${path1} files deleted!`);
});

rmdir(path2, function (err, dirs, files) {
  console.log(`${path2} files deleted!`);
});
