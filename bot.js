// Required
console.log('bot.js has begin');
const Twit = require('twit');
const config = require('./config');
const moment = require('moment');
const path = require('path')
const fs = require('fs');
const request = require('request');

// Save to MongoDB
//  Required

const MongoClient = require('mongodb').MongoClient;
//const app = express();
//const port = 3000;
const URLTOCON = require('./mongo-conn'); 
let db;
console.log(URLTOCON);




if (!fs.existsSync(`./images`))
    fs.mkdirSync(`./images`);

if (!fs.existsSync(`./json`))
    fs.mkdirSync(`./json`);


// Use API
const T = new Twit(config);

/*
var stream = T.stream('statuses/filter', { follow: 'diganluispa'})

stream.on('tweet', function (tweet) {
    */
/*    var fs = require('fs');
    fs.writeFile(`${tweet.id}.json`, JSON.stringify(tweet, null, 2) , 'utf-8', function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
*/
    //console.log(tweet);
    /*
    console.log(`@${tweet.target.screen_name}`,' - ',tweet.target_object.text);


})
*/
// New Tweet 
let newTweet = (status)=>{
    let random = Math.floor(Math.random()*100);
    let newStatus = status + ' ' + random;
    T.post('statuses/update', { status:newStatus }, (err,data,response)=>{
        //console.log(data);
        console.log(`Se ha tuiteado:  ${status} ${random}`);
    })
}

let insertToMongo = (objectToSave)=>{
    console.log(objectToSave);

    MongoClient.connect(URLTOCON, (err, database) => {
        if (err) return console.log(err);
        db = database;
        db.collection('archillect_app').save(objectToSave,(err,result)=>{
            if(err) return console.log(err);
            console.log(`${objectToSave}save to database`);
        })
        db.close();
    });
}

// Search Tweets 
let searchTweet = (user)=>{
    let objectToInsert = {};
    let cleanObject = {};
    
    if(user == '' || user == undefined)
        return;
    T.get('statuses/user_timeline',{ screen_name: user, count: 6, exclude_replies: true, include_rts: false }, (err, data, response)=>{
        data.forEach((value)=>{

            // Get date
            let format = 'dd MMM DD HH:mm:ss ZZ YYYY';
            let month = moment(value.created_at, format, 'en').format('MM');
            let year = moment(value.created_at,format,'en').format('YYYY')
            // Get year and month
            let dir = `${year}${month}`;

            // The year-month folder exists? Create the folder or use the folder if exists
            // For IMAGES
            if (!fs.existsSync(`./images/${dir}`))
                fs.mkdirSync(`./images/${dir}`);
            
            // For JSON
            if (!fs.existsSync(`./json/${dir}`))
                fs.mkdirSync(`./json/${dir}`);
            
            // Find the correct url (Photo or GIF)
            let type_media_url = value.extended_entities.media[0].type;
            let userName = value.user.screen_name;
            let media_url ='';

            // Save json tweet
                fs.writeFile(`./json/${dir}/${value.id} - ${type_media_url}.json`, JSON.stringify(value, null, 2) , 'utf-8', function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    console.log("json saved!");
                });

            if(type_media_url == 'photo'){
                media_url =  value.extended_entities.media[0].media_url_https;
            } else {
                media_url =  value.extended_entities.media[0].video_info.variants[0].url;
            }

            console.log(userName, ' - ',value.id, ' - ',type_media_url);
            var download = function(uri, filename, callback){
                request.head(uri, function(err, res, body){
                    console.log('content-type:', res.headers['content-type']);
                    console.log('content-length:', res.headers['content-length'],'bits');
                    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
                });
            };

            let pathToSave = `images/${dir}/${value.id}` + path.extname(media_url);
            download(media_url, pathToSave, function(){
                console.log('Image/video downloaded!');
            });
            
            objectToInsert = Object.assign({},cleanObject);
            objectToInsert.tweet_id = value.id.toString();
            objectToInsert.datetime = new Date();
            objectToInsert.url = pathToSave;
            objectToInsert.type = type_media_url;
            
            insertToMongo(objectToInsert);

        });

    })
}

let toGif = ()=>{
    var gifify = require('gifify');
    var path = require('path');

    var input = path.join('./images/201707/882630175330119700.mp4');
    var output = path.join('./images/201707/882630175330119700.gif');

    var gif = fs.createWriteStream(output);

    var options = {
    resize: '200:-1',
    from: 30,
    to: 35
    };

    gifify(input, options).pipe(gif);
}


searchTweet('archillect');
//setInterval(function(){ searchTweet('archillect') }, 60*60*1000);

// toGif();
// /root/.nvm/v6.10.0/bin/node /home/ubuntu/bot-twitt
// /usr/sbin/node /home/ubuntu/bot-twitt

// newTweet('AY CARAMBA');

//setInterval(function(){newTweet('AY CARAMBA #tweetbot ')}, 10*1000);

//sudo ln -s `which nodejs` /root/.nvm/v6.10.0/bin/node
