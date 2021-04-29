const express = require('express');
const { platform } = require('os');
const path=require('path')
const app = express();
const pug = require("pug");
app.use(express.static("public"));

app.use('/css',express.static(__dirname+'/style'))

let data=require('./movie-data.json')
console.log(data.length)
let dataUpdate=[]


for(a=0;a<data.length;a++){
    dataUpdate.push(data[a])
    
}


app.set('views', './pages');
app.set('view engine', 'pug');

app.get('/',(req,res)=>{
    console.log(dataUpdate.length)
    res.status(200).render('home',{movies:dataUpdate})
})

app.get('/movieInfo',(req,res)=>{
    res.status(200).render('movie-info')
})

app.get('/searchMov',searchMov)
app.get('/movies/:mid',getMovieDetails)

//take in the input for the movie name
//then we search thru the data and if there are matches in data set then 
//pass them onto the pug file and render the home page in a suitable fashion
function searchMov(req,res,next){
    let b= req.query.searchMovie
    let movPs=[]
    for(c=0;c<dataUpdate.length;c++){
        let d=dataUpdate[c].Title.toLowerCase()
        if(d.includes(b.toLowerCase())){
            movPs.push(dataUpdate[c])
        }
    }
    res.status(200).render('home',{movies:movPs})
}

function getMovieDetails(req,res){
    let a=req.params.mid
    //console.log(a)
    let chosenOne=[]
    //now we are going to search for that movie
    //iterate thru the collection
    simi=getSimilarMovies(a);
    for(b=0;b<dataUpdate.length;b++){
        if(dataUpdate[b].Title==a){
            chosenOne.push(dataUpdate[b])
        }
    }
    //console.log(chosenOne)
    res.status(200).render('movie-info',{chosen:chosenOne,similar:simi})
}

//similar movies from the chosen movie data based off of the 

function getSimilarMovies(movName){
    console.log(movName)
    let sim=[]
    let k=[]
    for(a=0;a<dataUpdate.length;a++){
        if(dataUpdate[a].Title==movName){
            k.push(dataUpdate[a])
        }
    }
    lm=0
    console.log(k[0].Genre)
    for(a=0;a<dataUpdate.length;a++){
        if(dataUpdate[a].Title!=movName){
            for(d=0;d<dataUpdate[a].Genre.length;d++){
                //console.log(dataUpdate[a].Title)
                if(sim.length<5){
                    if(k[0].Genre.includes(dataUpdate[a].Genre[d])){
                        if(sim.indexOf(dataUpdate[a])<1 && sim.length<5){
                            sim.push(dataUpdate[a]);
                        }
                    }
                }
            }
        }
    }
    //console.log(sim)
    return sim;
}

app.listen(3000)
console.log("listening on port 3000")
