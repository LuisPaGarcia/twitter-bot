/*const moment = require('moment');
let tweetDate = 'Tue Jul 04 02:30:28 +0000 2017';
let format = 'dd MMM DD HH:mm:ss ZZ YYYY';
let month = moment(tweetDate, format, 'en').format('MM');
let year = moment(tweetDate,format,'en').format('YYYY')
console.log(`${year}${month}`);
*/
const fs = require('fs');
const dir = '201717';
if (!fs.existsSync(`./images/${dir}`)){
    console.log('FOLDER DOESNT EXIST');
    fs.mkdirSync(`./images/${dir}`);
    console.log('Folder created');
}else{
    console.log('FOLDER EXIST');
}