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
let data=require('./movie-data.json');
const { isUndefined } = require('util');
const { register } = require('module');

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
//let userInput=[]
//let movieHist=new Set();
//use to monitor people input in search bars
//let peopleData=[]

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
let Actors,acttes,act,writer,director;
function getActData(){
    Actors=dataUpdate[0].Writer;
    //console.log(dataUpdate[0])
    acttes=[]
    for(let a=0;a<Actors.length;a++){
        acttes.push(Actors[a])
    }
    //console.log(acttes)

    act=[]
    for(a=0;a<dataUpdate.length;a++){
        //Actors
        Actors=dataUpdate[a].Actors
        for(let b=0;b<Actors.length;b++){
            act.push(Actors[b]+ ' (Actor)')
        } 
        //Writers
        writer=dataUpdate[a].Writer
        for(let b=0;b<writer.length;b++){
            act.push(writer[b]+ ' (Writer)')
        }
        //act=[...new Set(act)]   
        //Directors 
        director=dataUpdate[a].Director
        for(b=0;b<director.length;b++){
            act.push(director[b]+ ' (Director)')
        }
        act=[...new Set(act)]  
    }
}

//console.log(act.length)
//using set remove all the repeated people

app.set('views', './pages');
app.set('view engine', 'pug');

app.get('/',(req,res)=>{
    //console.log(dataUpdate.length)
    getActData()
    const loggedIn = req.session.user && req.session.user.loggedIn;
    console.log(loggedIn)
    res.status(200).render('home', { movies: dataUpdate, isLoggedIn: loggedIn });
})

app.get('/logout',(req,res)=>{
    //console.log(dataUpdate.length)
    //console.log(req.session.user)
    const userViewHistData = req.session.user.userViewHist;
    const addToWatchLater2 = req.session.user.userWatchLater;
    //console.log(userViewHistData)
    for(const a in userViewHistData){
        registeredUsers[req.session.user.username].viewHist.push(userViewHistData[a])
    }
    for(const b in addToWatchLater2){
        registeredUsers[req.session.user.username].watchLater.push(addToWatchLater2[b])
    }
    for (const username in registeredUsers) {
        if (registeredUsers[username]) {
            const user = registeredUsers[username];

            if (user && user.userViewHist && Array.isArray(userViewHistData)) {
                user.viewHist = user.viewHist.concat(userViewHistData);
            }
        }
    }
    console.log(registeredUsers)
    //a.userViewHist = a.userViewHist.concat(req.session.user.userViewHist);
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
    console.log(act)
    res.status(200).render('actor_home',{name:act})
})

//create users and populate them

app.get('/userLookup',(req,res)=>{
    console.log(registeredUsers)
    let a=[]
    a.push(registeredUsers)
    console.log(a)
    const usernamesArray = [];
    for (const obj of a) {
        const usernames = Object.keys(obj);
        usernamesArray.push(...usernames);
    }
    res.status(200).render('user_home',{name:usernamesArray})
})

app.get('/actorTest',function(req,res){
    res.status(200).render('actor')
})

//login, registrs=ation
app.get('/profile',function(req,res){
    const ip2 = ip.address();
    if (req.session.user && req.session.user.username) {
        console.log(req.session.user)
        // Session exists: user is logged in
        const username = req.session.user.username;
        const password = req.session.user.password;
        const userLoggedIn = true;
        const userType = req.session.user.userType;
        const userSearchData = req.session.user.userSessionSearchHist;
        const movieHist = req.session.user.userViewHist
        const watchLaterList2 = registeredUsers[req.session.user.username]
        console.log("--------------------------------------")
        console.log(watchLaterList2)          
        //console.log(uniqueMovies)
        const reviews = watchLaterList2.reviews
        res.status(200).render('profile',{userType:userType,ip:ip2, userinp:userSearchData, movieHist:movieHist,username:username,password:password,loggedIn:userLoggedIn,watchLaterList:watchLaterList2.watchLater,reviews:reviews,follows:watchLaterList2.follows,followers:watchLaterList2.followers});
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

app.get('/movies/:mid/EditMovie',function(req,res){
    if(req.session.user){
        if(req.session.user.userType!=="user"){
            res.status(200).render('edit',{movieName:req.params.mid})
        }else{
            console.log(req.params)
            getMovieDetails(req,res)
        }
    }
})

app.get('/actors/:aid',getActorDetails)

app.get('/users/:uid',getUserDetails)

function getUserDetails(req,res){
    //get all data for particular user
    console.log(req.params.uid)
    const loggedIn = req.session.user && req.session.user.loggedIn;
    console.log(loggedIn)
    //simple for loop or can we do better 
    const a =registeredUsers[req.params.uid]
    console.log(a)
    //get and send all data in here
    //console.log(a)
    //add a condition here that checks if the searched user is in our authenticated users database
    // IF YES SET THE FOLLOW BUTTON TO FALSE AND ENABLE THE 
    // IF NO SET THE FOLLOW BUTTON TO TRUE
    if(a!=='undefined'){
        let follows = false;
        const follow = req.session.user.username;
        const followUserData = registeredUsers[follow]
        console.log("-------------------------")
        console.log(followUserData)
        if(loggedIn){
            follows = followUserData.follows.some(user => user === req.params.uid);
        }
        console.log(follows)
        res.status(200).render('usersData',{type:a.userType,name:a.username,searchHistory:a.searchHist,logged:loggedIn,follows:a.follows,followers:a.followers,reviews:a.reviews,watchLater:a.watchLater,hist:a.viewHist,followed:follows});
    }else{
        searchPeep
    }
}

//get page to load the add page
//needs authentication verification and only admin people should have access to it
app.get('/addMovie',(req,res)=>{
    console.log(req.session)
    if(req.session.user){
        if(req.session.user.userType!=="user"){
            res.status(200).render('addMovie',{genreList:uniqueGenresArray,ratedData:uniqueRatings});
        }else{
            const ip2 = ip.address();
            const username = req.session.user.username;
            const password = req.session.user.password;
            const userLoggedIn = true;
            const userType = req.session.user.userType;
            const userSearchData = req.session.user.userSessionSearchHist;
            const movieHist = req.session.user.userViewHist
            console.log(userType)
            console.log(username)
            console.log(password)
            res.status(200).render('profile',{userType:userType,ip:ip2, userinp:userSearchData, movieHist:movieHist,username:username,password:password,loggedIn:userLoggedIn});
        }
        //res.status(200).render('addMovie',{genreList:uniqueGenresArray,ratedData:uniqueRatings});
    }
    else{
        res.render('login', { error: 'YOU MUST BE LOGGED IN' });
    }
})

//store registered users
const registeredUsers ={
    'Nirmith': {
        username: 'Nirmith',
        userType: 'user',
        password: 'Nimmu@31',
        searchHist: [],
        watchLater:[],
        reviews:[],
        viewHist:[],
        follows:[],
        followers:[]
    },
    'Nirmith2': {
        username: 'Nirmith2',
        userType: 'admin',
        password: 'Nimmu@31',
        searchHist: [],
        watchLater:[],
        reviews:[],
        viewHist:[],
        follows:[],
        followers:[]
    }
};

//adding post request to handle watch later
const watchLaterList = [];
app.post('/addToWatchLater', (req, res) => {
    //check if user is logged in
    if(req.session.user ){
        const movieTitle = req.body.movieName;
        console.log(movieTitle)
        watchLaterList.push({ title: movieTitle});
        console.log(watchLaterList)
        //req.session.user.userWatchLater({title: movieTitle})
        console.log(req.session)
        const a = registeredUsers[req.session.user.username]
        a.watchLater.push(movieTitle)
        res.redirect(`/movies/${movieTitle}`);
    }else{
        res.render('login', { error: 'YOU MUST BE LOGGED IN' });
    }
});

//adding post requests to handle user inputs
app.post('/login',(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    //console.log(username)
    //console.log(password)
    console.log(registeredUsers)
    const user = registeredUsers[username];
    console.log(user)
    const userSessionSearchHist = user.searchHist;
    const userWatchLater = user.watchLater;
    const userViewHist = user.viewHist;
    const userReviews = user.reviews;
    const follows = user.follows;
    const followers = user.followers;
    if (!user) {
            // User does not exist
        res.status(401).render('login', { error: 'User does not exist' });
    } else if (user.password === password) {
        //res.send('User present');
        req.session.user = {
            username,
            password,
            userSessionSearchHist,
            userWatchLater,
            userReviews,
            userViewHist,
            follows,
            followers,
            loggedIn: true,
            userType:user.userType,
        };
        console.log(req.session)
        res.redirect('/profile');
    } else {
        res.render('login', { error: 'Incorrect username or password' });
    }
})

app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const userType = req.body.role; // Assuming you have a form field with the name 'role'
    const searchHist = [];
    const watchLater = [];
    const reviews = [];
    const viewHist = [];
    const follows = [];
    const followers =[];
    if (res.statusCode === 200) {
        registeredUsers[username] = {
            username,
            userType, // Store userType during registration
            password,
            searchHist,
            watchLater,
            reviews,
            viewHist,
            follows,
            followers
        };
        res.redirect('/login');
    } else {
        res.send('Registration failed');
    }
});


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
    //start storing it based of sessions and user interction show it as a collection of Movies Reviewed and Rating Given
    const user = registeredUsers[author];
    console.log("------------------------")
    console.log(user)
    user.reviews.push({ Rating: rating, MovieName: movieName})
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

//edit movie details
app.post('/updateMovie/:mid',(req,res)=>{
    //ONLY IS USER IS LOGGED IN AND USER IS AN ADMIN
    console.log(req.params.mid)
    console.log(req.params)
    console.log(req.body)
    for(b=0;b<dataUpdate.length;b++){
        if(dataUpdate[b].Title==req.params.mid){
            dataUpdate[b].Title = req.body.name !=="" ? req.body.name : dataUpdate[b].Title
            dataUpdate[b].Year = req.body.year !==""? req.body.year : dataUpdate[b].Year
            dataUpdate[b].Rated = req.body.rated !== ""? req.body.rated : dataUpdate[b].Rated
            dataUpdate[b].Released = req.body.year_release !== ""?req.body.year_release : dataUpdate[b].Realeased
            dataUpdate[b].Runtime = req.body.duration!==""?req.body.duration : dataUpdate[b].Runtime
            dataUpdate[b].Genre = req.body.genre!==''? req.body.genre.split(',') :dataUpdate[b].Genre
            dataUpdate[b].Actors = req.body.actor!==''? req.body.actor.split(',') : dataUpdate[b].Actors
            dataUpdate[b].Director = req.body.director!==''? req.body.director.split(',') : dataUpdate[b].Director
            dataUpdate[b].Writer = req.body.writer!==''? req.body.writer.split(',') : dataUpdate[b].Writer
            dataUpdate[b].Plot = req.body.plot!==""?req.body.plot:dataUpdate[b].Plot
            dataUpdate[b].Awards = req.body.awards!==""?req.body.awards:dataUpdate[b].Awards
            dataUpdate[b].Poster = req.body.poster!==""?req.body.poster:dataUpdate[b].Poster
        }
    }
    console.log(req.params.mid)
    if(req.body.name!==""){
        res.status(200).render('edit',{movieName:req.body.name,p:"Movie Updated"})
    }else{
        res.status(200).render('edit',{movieName:req.params.mid,p:"Movie Updated"})
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
    const loggedIn = req.session.user && req.session.user.loggedIn;
    console.log(loggedIn)
    //let b;
    const c =req.session.user
    //if(loggedIn){
    //    let b = req.session.user
    //}
    
    console.log(chosenOne)
    for(b=0;b<dataUpdate.length;b++){
        if(dataUpdate[b].Title==a){
            chosenOne.push(dataUpdate[b])
            if(loggedIn){
                const movieTitle = dataUpdate[b].Title;
                const isUnique = !c.userViewHist.some(movie => movie.Title === movieTitle);

                if (isUnique) {
                    c.userViewHist.push(dataUpdate[b]);
                }
            }
        }
    }
    console.log(c)
    console.log(req.session.user)
    /*req.session.save(err => {
        if (err) {
            console.error('Error saving session:', err);
        } else {
            console.log('Session updated and saved successfully.');
        }
    });*/
    //console.log(chosenOne)
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
    const loggedIn = req.session.user && req.session.user.loggedIn;
    //console.log(loggedIn)
    if(loggedIn){
        req.session.user.userSessionSearchHist.push(b);
    }
    let searchResults = [];

    for (const user in registeredUsers) {
        const userData = registeredUsers[user];
        
        if (userData.username.toLowerCase().includes(b) || userData.userType.toLowerCase().includes(b)) {
            searchResults.push(userData.username);
        }
    }
    console.log(searchResults)
    res.status(200).render('user_home',{name:searchResults})
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
    const loggedIn = req.session.user && req.session.user.loggedIn;
    //render the actor page 
    res.status(200).render('actor',{name:nam,type:type,cont:contri_name,collab:collabed,logged:loggedIn});
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

//post request to add followers
app.post('/follow/:uid',(req,res)=>{
    console.log(req.params)
    if(req.params.uid !== req.session.user.username){
        const loggedIn = req.session.user && req.session.user.loggedIn;
        console.log(loggedIn)
        //follows 
        const a = registeredUsers[req.session.user.username]
        console.log("----------------follows")
        console.log(a)
        a.follows.push(req.params.uid)
        console.log("----------------follows updated")
        console.log(registeredUsers)
        //updated followers of users our authenticated user has done
        const b = registeredUsers[req.params.uid]
        b.followers.push(req.session.user.username)
        console.log("----------------Followers Updated")
        console.log(registeredUsers)
        res.status(200).redirect(`/users/${req.params.uid}`)

    }else{
        searchPeep
    }
})

app.post('/followActor/:aid',(req,res)=>{
    console.log(req.params)

    const loggedIn = req.session.user && req.session.user.loggedIn;
    console.log(loggedIn)
    //follows 
    const a = registeredUsers[req.session.user.username]
    console.log("----------------follows")
    console.log(a)
    a.follows.push(req.params.aid)
    console.log("----------------follows updated")
    console.log(registeredUsers)
    //updated followers of users our authenticated user has done
    res.status(200).render('actor_home',{name:act})
})

//unfollow this user should also technically work for actors and writers and directors re route to home page
app.post('/unfollow/:uid',(req,res)=>{
    console.log(req.params)
    console.log(req.session.user)
    //console.log(registeredUsers[req.params.uid])
    const unfollow = registeredUsers[req.params.uid]
    const activeUser = registeredUsers[req.session.user.username]
    console.log("-----------------------------")
    console.log(unfollow)
    let spot = unfollow.followers.indexOf(req.session.user.username)
    if(spot > -1) {
        unfollow.followers.splice(spot,1)
    }
    let spot2 = activeUser.follows.indexOf(req.params.uid)
    if(spot2 > -1) {
        activeUser.follows.splice(spot2,1)
    }
    const loggedIn = req.session.user && req.session.user.loggedIn;
    console.log(loggedIn)
    //console.log(activeUser)
    res.status(200).render('usersData',{type:unfollow.userType,name:unfollow.username,searchHistory:unfollow.searchHist,logged:loggedIn});
})

app.listen(3000)
console.log("listening on port 3000")