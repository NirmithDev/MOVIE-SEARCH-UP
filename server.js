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

const uniqueGenres = new Set();
const allRatings = data.map(movie => movie.Rated);
const uniqueRatingsSet = new Set(allRatings);
const uniqueRatings = Array.from(uniqueRatingsSet);

console.log(uniqueRatings);
// Iterate through the data and collect unique genres
data.forEach(movie => {
  if (movie.Genre && Array.isArray(movie.Genre)) {
    movie.Genre.forEach(genre => {
      uniqueGenres.add(genre);
    });
  }
});

// Convert the Set to an array if needed
const uniqueGenresArray = [...uniqueGenres];

//console.log(data.length)
let dataUpdate=[]
for(a=0;a<data.length;a++){
    let movie = { ...data[a] };
    
    // Add the "reviews" property to the movie object
    movie.reviews = [
        {
            Author: 'John Doe',
            Rating: 4,
            Comment: 'Great movie!'
        },
        {
            Author: 'Jane Smith',
            Rating: 5,
            Comment: 'One of my favorites!'
        }
        // Add more review objects as needed
    ];
    
    dataUpdate.push(movie)
}
let userInput=[]
let movieHist=new Set();
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

//get page to load the add page
//needs authentication verification and only admin people should have access to it
app.get('/addMovie',(req,res)=>{
    res.status(200).render('addMovie',{genreList:uniqueGenresArray,ratedData:uniqueRatings});
})

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

//movieReviews
app.post('/submitReview', (req, res) => {
    const author = req.session.user.username;
    const rating = parseInt(req.body.rating, 10);
    const reviewText = req.body.reviewText;
    const movieName = req.body.movieName;
    // Update the movie's reviews here, assuming you have the movie object
    // You need to locate the movie object by its name or ID in your data structure
    // After updating the reviews, redirect to the movie-info page
    // You may need to update the chosenOne[0] or movie object with the new review
    let chosenOne=[]
    //now we are going to search for that movie
    //iterate thru the collection
    for(b=0;b<dataUpdate.length;b++){
        if(dataUpdate[b].Title==movieName){
            chosenOne.push(dataUpdate[b])
        }
    }
    chosenOne[0].reviews.push({ Author: author, Rating: rating, Comment: reviewText });
    // Redirect to the movie details page
    res.redirect(`/movies/${movieName}`);
});

//adding post request to append and add a new movie to the original list
app.post('/addNewMovie',(req,res)=>{
    console.log(req.body)
    const name          = req.body.movieName;
    const plot          = req.body.plot;
    const actor         = req.body.actors;
    const genre         = req.body.genre;
    const duration      = req.body.duration+" min";
    const year          = req.body.releaseYear;
    const image         = req.body.posterLink;
    const awards        = req.body.awards;
    const writer        = req.body.writer;
    const director      = req.body.director;
    const releasedDate  = req.body.releasedDate;
    const rated         = req.body.rated;
    //create an object to represent movie data
    const newMovie = {
        Title: name,
        Year: year,
        Rated: rated, // need a new input
        Released: releasedDate, // need a new input
        Runtime: duration,
        Genre: [genre],
        Director: director.split(',').map(directorName => directorName.trim()), //need a new input
        Writer: writer.split(',').map(writerName => writerName.trim()), //need a new input
        Actors: actor.split(',').map(actorName => actorName.trim()), // Split actors by comma and trim spaces
        Plot: plot,
        Awards: awards,
        Poster: image,
        reviews: []
    };
    console.log(newMovie)
    dataUpdate.push(newMovie)
    const lastMovieAdded = dataUpdate[dataUpdate.length - 1];
    console.log(lastMovieAdded)
    //push to original collection
    const loggedIn = req.session.user && req.session.user.loggedIn;
    console.log(loggedIn)
    res.status(200).render('home', { movies: dataUpdate, isLoggedIn: loggedIn });
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
    //req.session.user.userSessionSearchHist.push(b);
    const loggedIn = req.session.user && req.session.user.loggedIn;
    console.log(loggedIn)
    if(loggedIn){
        req.session.user.userSessionSearchHist.push(b);
    }
    
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
            movieHist.add(dataUpdate[b])
        }
    }
    //console.log(chosenOne)
    const loggedIn = req.session.user && req.session.user.loggedIn;
    console.log(loggedIn)
    console.log(chosenOne)
    //console.log(chosenOne[0].reviews)
    //calculate average rating if there is else set the rating to N/A
    if(chosenOne[0].reviews.length>0){
        sum=0;
        for(i=0;i<chosenOne[0].reviews.length;i++){
            sum+=chosenOne[0].reviews[i].Rating;
        }
        console.log(sum)
        averageRating = (sum / chosenOne[0].reviews.length).toFixed(1).toString();
    }
    else{
        averageRating = "N/A"
    }
    console.log(averageRating)

    res.status(200).render('movie-info',{chosen:chosenOne,similar:simi,userIsLoggedIn:loggedIn,averageRating:averageRating})
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
        //console.log(dataUpdate[a])
        if(dataUpdate[a].Title!=movName){
            if(dataUpdate[a].Genre.length>0){
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