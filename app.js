const express =    require("express"),
      app =        express(),
      bodyParser = require("body-parser"),
      mongoose =   require("mongoose");

mongoose.connect('mongodb://localhost:27017/yelp_camp', { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

// SCHEMA SETUP
const campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

const Campground = mongoose.model("Campground", campgroundSchema);

//Campground.create({
//    name: "Sierra Cazorla",
//    image: "https://images.unsplash.com/photo-1504591504549-8ce1589ea6f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
//    description: "A wonderful hill of stone and pines"
//}, (err, campground) => {
//    if(err){
//        console.log(err);
//    } else {
//        console.log("NEWLY CREATED");
//        console.log(campground);
//    }
//});


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
            res.render("index", {campgrounds: allCampgrounds});
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
    res.render("new");
});

// SHOW
app.get("/campgrounds/:id", (req, res) => {
    // find the campground with provided id
    Campground.findById(req.params.id, (err, foundcampground) => {
       if(err){
           console.log(err);
       } else {
           // render the show template of that campground
           res.render("show", {campground: foundcampground});
       }
    });
        
});

app.listen(process.env.PORT, process.env.IP, () => {
    console.log("The YelpCamp Server Has Started");
});