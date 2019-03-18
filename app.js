const express               = require("express"),
      app                   = express(),
      bodyParser            = require("body-parser"),
      mongoose              = require("mongoose"),
      passport              = require("passport"),
      LocalStrategy         = require("passport-local"),
      passportLocalMongoose = require("passport-local-mongoose"),
      Campground            = require("./models/campground"),
      Comment               = require("./models/comment"),
      User                  = require("./models/user"),
      seedDB                = require("./seeds");

//requiring routes
const indexRoutes       = require("./routes/index.js"),
      commentsRoutes    = require("./routes/comments"),
      campgroundsRoutes = require("./routes/campgrounds");
      
mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });
mongoose.set("useFindAndModify", false);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(`${__dirname}/public`));
//seedDB();

//  PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Iris is the best",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

app.use(indexRoutes);
app.use( "/campgrounds", campgroundsRoutes);
app.use( "/campgrounds/:id/comments", commentsRoutes);

//let campgrounds = [
//        {name: "Black Mountain", image: "https://images.unsplash.com/photo-1479741044197-d28c298f8c77?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
//        {name: "Sierra Cazorla", image: "https://images.unsplash.com/photo-1504591504549-8ce1589ea6f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"},
//        {name: "Sierra Morena", image: "https://images.unsplash.com/photo-1522031153701-b3eba74004e8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80"}
//];

app.listen(process.env.PORT, process.env.IP, () => {
    console.log("The YelpCamp Server Has Started");
});