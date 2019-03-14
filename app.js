const express    = require("express"),
      app        = express(),
      bodyParser = require("body-parser"),
      mongoose   = require("mongoose"),
      Campground = require("./models/campground"),
      Comment    = require("./models/comment"),
      seedDB     = require("./seeds");

mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });
mongoose.set("useFindAndModify", false);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(`${__dirname}/public`));
//seedDB();

//let campgrounds = [
//        {name: "Black Mountain", image: "https://images.unsplash.com/photo-1479741044197-d28c298f8c77?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
//        {name: "Sierra Cazorla", image: "https://images.unsplash.com/photo-1504591504549-8ce1589ea6f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"},
//        {name: "Sierra Morena", image: "https://images.unsplash.com/photo-1522031153701-b3eba74004e8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80"}
//];

app.get("/", (req, res) => {
    res.render("landing");
});
// INDEX
app.get("/campgrounds", (req, res) => {
    // get all campgrounds from DB
    Campground.find({}, (err, allCampgrounds) => {
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
    
});
// CREATE
app.post("/campgrounds", (req, res) => {
    // get data from a form and add it to campgrounds array
    const newName = req.body.name;
    const newImage = req.body.image;
    const newDescription = req.body.description;
    const newCamp = {name: newName, image: newImage, description: newDescription};
    // create a new Campground and save to DB
    Campground.create(newCamp, (error, campground) => {
        if(error){
            console.log(error);
        } else {
            // redirect to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});
// NEW
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

// SHOW
app.get("/campgrounds/:id", (req, res) => {
    // find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec((err, foundcampground) => {
       if(err){
           console.log(err);
       } else {
           //console.log(foundcampground);
           // render the show template of that campground
           res.render("campgrounds/show", {campground: foundcampground});
       }
    });
});

//=====================================
//      COMMENTS ROUTES
//=====================================

app.get("/campgrounds/:id/comments/new", (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

app.post("/campgrounds/:id/comments", (req, res) => {
    //  look up campground using Id
    Campground.findById(req.params.id, (err, campground) => {
        if(err){
            console.log(err);
        } else {
            //  create new comment
            Comment.create(req.body.comment, (err, comment) => {
                if(err){
                    console.log(err);
                } else {
                    // connect new comment to the campground
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect(`/campgrounds/${campground._id}`);
                }
            });
        }
    });
});

app.listen(process.env.PORT, process.env.IP, () => {
    console.log("The YelpCamp Server Has Started");
});