const express               = require("express"),
      app                   = express(),
      bodyParser            = require("body-parser"),
      mongoose              = require("mongoose"),
      passport              = require("passport"),
      LocalStrategy         = require("passport-local"),
      passportLocalMongoose = require("passport-local-mongoose"),
      methodOverride        = require("method-override"),
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
app.use(methodOverride("_method"));
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


app.listen(process.env.PORT, process.env.IP, () => {
    console.log("The YelpCamp Server Has Started");
});