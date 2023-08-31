const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const { appendFileSync } = require('fs');
const { platform } = require('os');
const bodyParser = require('body-parser');
const path=require('path')
const app = express();
const pug = require("pug");
//const requestIp= require('request-ip');
const ip=require("ip");

app.use(bodyParser.urlencoded({ extended: true }));

//maybe using nodemon in it is not a bad choice tbh
app.use(express.static("public"));
//app.use(flash());


app.use('/css',express.static(__dirname+'/style'))
//you can add a much more bigger data file or append this and remove all duplicates
let data=require('./movie-data.json')
//console.log(data.length)
let dataUpdate=[]
for(a=0;a<data.length;a++){
    dataUpdate.push(data[a])
}
let userInput=[]
let movieHist=[]
//use to monitor people input in search bars
let peopleData=[]

app.use(session({
    secret: 'ULTRABIGSECRETKEY',
    resave: false,
    saveUninitialized: true
}));

//iterate thru all the dataUpdate details
//then proceed thru each Actors Directors Writers Section amd append it to the people Data and then
//use set to segregate out the unique terms
//Actors
//Directors
//Writer
let Actors=dataUpdate[0].Writer;
//console.log(dataUpdate[0])
let acttes=[]
for(let a=0;a<Actors.length;a++){
    acttes.push(Actors[a])
}
//console.log(acttes)

let act=[]
for(a=0;a<dataUpdate.length;a++){
    //Actors
    let Actors=dataUpdate[a].Actors
    for(let b=0;b<Actors.length;b++){
        act.push(Actors[b]+ ' (Actor)')
    } 
    //Writers
    let writer=dataUpdate[a].Writer
    for(let b=0;b<writer.length;b++){
        act.push(writer[b]+ ' (Writer)')
    }
    //act=[...new Set(act)]   
    //Directors 
    let director=dataUpdate[a].Director
    for(b=0;b<director.length;b++){
        act.push(director[b]+ ' (Director)')
    }
    act=[...new Set(act)]  
}

//console.log(act.length)
//using set remove all the repeated people

app.set('views', './pages');
app.set('view engine', 'pug');

app.get('/',(req,res)=>{
    //console.log(dataUpdate.length)
    const loggedIn = req.session.user && req.session.user.loggedIn;
    console.log(loggedIn)
    res.status(200).render('home', { movies: dataUpdate, isLoggedIn: loggedIn });
})

app.get('/logout',(req,res)=>{
    //console.log(dataUpdate.length)
    req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        } else {
          res.status(200).render('home',{movies:dataUpdate})
        }
    });
})

app.get('/movieInfo',(req,res)=>{
    res.status(200).render('movie-info')
})

app.get('/actorLookup',(req,res)=>{
    res.status(200).render('actor_home',{name:act})
})

app.get('/actorTest',function(req,res){
    res.status(200).render('actor')
})

//login, registrs=ation
app.get('/profile',function(req,res){
    const ip2 = ip.address();
    if (req.session.user && req.session.user.username) {
        // Session exists: user is logged in
        const username = req.session.user.username;
        const password = req.session.user.password;
        const userLoggedIn = true;
        const userSearchData = req.session.user.userSessionSearchHist;
        console.log(userSearchData)
        console.log(username)
        console.log(password)
        res.status(200).render('profile',{ip:ip2, userinp:userSearchData, movieHist:movieHist,username:username,password:password,loggedIn:userLoggedIn});
      } else {
        // No session: user is not logged in
        res.redirect('/login');
    }
    //console.log(userInput)
    //console.log(movieHist)
})

app.get('/login',function(req,res){
    console.log(registeredUsers)
    res.status(200).render('login')
})

app.get('/register',function(req,res){
    res.status(200).render('register')
})

app.get('/searchMov',searchMov)
app.get('/searchPeep',searchPeep)
app.get('/movies/:mid',getMovieDetails)
app.get('/actors/:aid',getActorDetails)

//store registered users
const registeredUsers ={};

//adding post requests to handle user inputs
app.post('/login',(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const userSessionSearchHist = [];
    //console.log(username)
    //console.log(password)
    console.log(registeredUsers)
    const user = registeredUsers[username];
    //console.log(user)
    //add authentication and session cookies
    //if (res.statusCode === 200) {
    if (!user) {
            // User does not exist
        res.render('login', { error: 'User does not exist' });
    } else if (user.password === password) {
        //res.send('User present');
        req.session.user = {
            username,
            password,
            userSessionSearchHist,
            loggedIn: true
        };
        console.log(req.session)
        res.redirect('/profile');
    } else {
        res.render('login', { error: 'Incorrect username or password' });
    }
})

app.post('/register',(req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    const searchHist =[]
    //console.log(req)
    if (res.statusCode === 200) {
        registeredUsers[username] = {
            username,
            password,
            searchHist
        };
        res.redirect('/login');
    } else {
        res.send('Registration failed');
    }
})

//take in the input for the movie name
//then we search thru the data and if there are matches in data set then 
//pass them onto the pug file and render the home page in a suitable fashion
function searchMov(req,res,next){
    let b= req.query.searchMovie
    let movPs=[]
    //userInput.push(b)
    for(c=0;c<dataUpdate.length;c++){
        let d=dataUpdate[c].Title.toLowerCase()
        if(d.includes(b.toLowerCase())){
            movPs.push(dataUpdate[c])
        }
    }
    req.session.user.userSessionSearchHist.push(b);
    const loggedIn = req.session.user && req.session.user.loggedIn;
    console.log(loggedIn)
    res.status(200).render('home',{movies:movPs, isLoggedIn: loggedIn})
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
            movieHist.push(dataUpdate[b])
        }
    }
    //movieHist=chosenOne;
    //console.log(chosenOne)
    res.status(200).render('movie-info',{chosen:chosenOne,similar:simi})
}

//similar movies from the chosen movie data based off of the 

function getSimilarMovies(movName){
    let sim=[]
    let k=[]
    for(a=0;a<dataUpdate.length;a++){
        if(dataUpdate[a].Title==movName){
            k.push(dataUpdate[a])
        }
    }
    lm=0
    for(a=0;a<dataUpdate.length;a++){
        if(dataUpdate[a].Title!=movName){
            for(d=0;d<dataUpdate[a].Genre.length;d++){
                //console.log(dataUpdate[a].Title)
                if(sim.length<4){
                    if(k[0].Genre.includes(dataUpdate[a].Genre[d])){
                        //if(sim.includes(dataUpdate[a]))
                        if(sim.includes(dataUpdate[a])<1 && sim.length<5){
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

//now for lookin up all actors in the data and looking thru their contributions and also through their ppl they
//collabed with
function searchPeep(req,res,next){
    //console.log("test passed")
    let b= req.query.searchPeople;
    //console.log(b)
    b=b.toLowerCase()
    //userInput.push(b)
    req.session.user.userSessionSearchHist.push(b);
    let c=[];
    for(a=0;a<act.length;a++){
        if(act[a].toLowerCase().includes(b)){
            c.push(act[a])
        }
    }
    res.status(200).render('actor_home',{name:c})
}

function getActorDetails(req,res,next){
    let a=req.params.aid
    //get the type of person they looked up
    b=a.indexOf("(")
    type=""
    for(c=b+1;c<a.length-1;c++){
        type+=a[c]
    }
    //now we will just have to get the name
    nam=""
    for(c=0;c<b;c++){
        nam+=a[c];
    }
    //console.log(nam+ " Type ->"+ type)
    
    //find all movies that they collabed in or contributed for
    //simple for loop thru data
    let rahhh=[]
    nam=nam.substring(0,nam.length-1)
    
    //console.log(nam)
    let segregate=[]
    //segregation boi
    for(mo=0;mo<dataUpdate.length;mo++){
        //if type is an actor
        if(type=="Actor"){
            for(a=0;a<dataUpdate[mo].Actors.length;a++){
                if(dataUpdate[mo].Actors[a]==nam){
                    segregate.push(dataUpdate[mo])
                }
            }
        }
        if(type=="Writer"){
            for(a=0;a<dataUpdate[mo].Writer.length;a++){
                if(dataUpdate[mo].Writer[a]==nam){
                    segregate.push(dataUpdate[mo])
                }
            }
        }
        else if(type=="Director"){
            for(a=0;a<dataUpdate[mo].Director.length;a++){
                if(dataUpdate[mo].Director[a]==nam){
                    segregate.push(dataUpdate[mo])
                }
            }
        }
    }
    contri_name=[]
    //get the titles of the movies that they contributed to
    for(a=0;a<segregate.length;a++){
        contri_name.push(segregate[a].Title)
    }

    //get the collaborated users for the shizzle
    collabed=getCollabed(nam,type,segregate);
    console.log(collabed)
    //render the actor page 
    res.status(200).render('actor',{name:nam,type:type,cont:contri_name,collab:collabed});
}

function getCollabed(name_person,type,segregate){

    let collabArr=[]
    //iterate thru segregate data
    for(a=0;a<segregate.length;a++){
        //console.log(segregate[a].Title)    
        //check type of user and if actor iterate thru director and writer and then actor
        
            for(b=0;b<segregate[a].Writer.length;b++){
                if(collabArr.length<5 && segregate[a].Writer[b]!=name_person){
                    if(collabArr.indexOf(segregate[a].Writer[b])<0){
                        collabArr.push(segregate[a].Writer[b] + " (Writer)")
                    }
                }
            }
            for(b=0;b<segregate[a].Director.length;b++){
                if(collabArr.length<5 && segregate[a].Director[b]!=name_person){
                    if(collabArr.indexOf(segregate[a].Director[b])<0){
                        collabArr.push(segregate[a].Director[b] + " (Director)")
                    }
                }
            }
            for(b=0;b<segregate[a].Actors.length;b++){
                if(collabArr.length<5 && segregate[a].Actors[b]!=name_person){
                    if(collabArr.indexOf(segregate[a].Actors[b])<0){
                        collabArr.push(segregate[a].Actors[b] + " (Actor)")
                    }
                }
            }
    }    
    //console.log(collabArr)
    //set only 3-4 people that they collaborated with
    
    return collabArr
}

app.listen(3000)
console.log("listening on port 3000")