const express = require('express');
const path=require('path')
const app = express();
const pug = require("pug");
app.use(express.static("public"));
app.use('/css',express.static(__dirname+'/style'))

app.set('views', './pages');
app.set('view engine', 'pug');

app.get('/',(req,res)=>{
    res.status(200).render('home')
    //res.sendFile(path.join(__dirname+'/pages/home.pug'))
})

app.get('/movieInfo',(req,res)=>{
    res.status(200).render('movie-info')
    //res.sendFile(path.join(__dirname+"/movie-info.html"))
})

app.listen(3000)
console.log("listening on port 3000")