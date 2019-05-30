const express = require('express')
const bodyParser = require('body-parser')
const app = express() 
const path = require('path')
const port = 3000

const indexRouter = require('./routes/index')
 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view options', {delimiter: '?'});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/youtubeUrl', indexRouter)
app.use('/url', indexRouter)
app.use('/data', indexRouter)

app.listen(port, function() {
    console.log(`Example app listening on port ${port}!`)
})