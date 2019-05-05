const express = require('express')
const router = express.Router()
const fetchVideoInfo = require('youtube-info'); //ดึงข้อมูลจาก url youtube
const getYouTubeID = require('get-youtube-id'); //ดึง id ลจาก url youtube
const requestIp = require('request-ip'); // get ip
 

router.get('/', function(req, res, next) {
    var youtubeUrl = req.query.youtubeUrl
    var YouTubeID = getYouTubeID(youtubeUrl);
    var ipv4 = requestIp.getClientIp(req)
    var ip = require('ip');
    console.log(req.ip);
    console.log(ip.address());
    console.log(YouTubeID);
    if (YouTubeID !== null) {
        fetchVideoInfo(YouTubeID).then(function (videoInfo) {
            // console.log(videoInfo);
            res.render('index', { title: 'Home Work' ,videoInfo : videoInfo,user:ip.address()})
        });
    } else {
        res.render('index', { title: 'Home Work' ,videoInfo : false,user:"Not Found"})
    }
})

 
module.exports = router