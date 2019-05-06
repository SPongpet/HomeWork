const express = require('express')
const router = express.Router()
const fetchVideoInfo = require('youtube-info'); //ดึงข้อมูลจาก url youtube
const getYouTubeID = require('get-youtube-id'); //ดึง id ลจาก url youtube
const dateFormat = require('dateformat');
const firebase = require('firebase');

const firebaseConfig = {
    apiKey: "AIzaSyA-4AaXj1tSr1D0QzZGjJosW22FZpikmTE",
    authDomain: "fir-test-4aa65.firebaseapp.com",
    databaseURL: "https://fir-test-4aa65.firebaseio.com",
    projectId: "fir-test-4aa65",
    storageBucket: "fir-test-4aa65.appspot.com",
    messagingSenderId: "715448788294",
    appId: "1:715448788294:web:e4cfd99ccc051e2b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

router.use(function(err, req, res, next){
    if(err.name === 'ValidationError'){
      return res.status(422).json({
        errors: Object.keys(err.errors).reduce(function(errors, key){
          errors[key] = err.errors[key].message;
  
          return errors;
        }, {})
      });
    }
  
    return next(err);
});
router.get('/', function(req, res,next) {
    var queueVideoRef = db.collection("queue_video").orderBy("queue", "asc");
    var array = [];
    queueVideoRef.get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                if (!doc.exists) {
                    array.push({ 
                        queue : false,
                        user : false,
                        videoName : false,
                    });
                }else {
                    if (doc.data().status !== false){
                        array.push({ 
                            queue : dateFormat(doc.data().queue, "dd-mm-yyyy HH:MM:ss TT"),
                            user : doc.data().user,
                            videoName : doc.data().video_name,
                        });
                    }
                }
            });
            res.render('index', { 
                title : 'Home Work',
                data : array
            })
        })
    .catch(next);
})

router.get('/url', function(req, res, next) {
    var queueVideoRef = db.collection("queue_video").orderBy("queue", "asc").limit(1)
    queueVideoRef.get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                console.log(doc.id +" : "+ doc.data().youtube_url);
            });
        }).catch(next);
    return res.redirect('/');
})

router.post('/youtubeUrl', function(req, res, next) {
    var youtubeUrl = req.body.youtubeUrl;
    var YouTubeID = getYouTubeID(youtubeUrl);
    var ip = require('ip');
    var date = Date();
    if (YouTubeID === null){
        return res.redirect('/');
    }else{
        fetchVideoInfo(YouTubeID).then(function (videoInfo) {
            db.collection('queue_video').add({
                status : true,
                queue : date,
                user : ip.address(),
                video_name : videoInfo.title,
                youtube_url : videoInfo.videoId
            }).then(ref => {
                console.log('Added document with ID: ', ref.id);
            });
            return res.redirect('/');
        }).catch(next);
    }
})

function onYouTubeIframeAPIReady(req, res, next) {
    
}
// function onPlayerReady(event) {
//     event.target.playVideo();
// }
module.exports = router