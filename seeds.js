const mongoose   = require("mongoose"),
      Campground = require("./models/campground"),
      Comment    = require("./models/comment");
      
const data = [
    {
        name: "Sierra Cazorla",
        image: "https://images.unsplash.com/photo-1504591504549-8ce1589ea6f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    },
    {
        name: "Sierra Nevada",
        image: "https://images.unsplash.com/photo-1522031153701-b3eba74004e8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    },
    {
        name: "Dark Mountain",
        image: "https://images.unsplash.com/photo-1479741044197-d28c298f8c77?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    }
];

const seedDB = () => {
    //  remove all campgrounds
    Campground.remove({}, err => {
        if(err){
            console.log(err);
        } else {
            console.log("remove all!!");
            //  add a few camprounds
            data.forEach(seed => {
                Campground.create(seed, (err, createdCampground) => {
                    if(err){
                        console.log(err);
                    } else {
                        console.log("added!!");
                        //  add a comment
                        Comment.create(
                            {
                                text: "This place is great, but I wish there was internet",
                                author: "Homer"
                            }, (err, comment) => {
                                if(err){
                                    console.log(err);
                                } else {
                                    createdCampground.comments.push(comment);
                                    createdCampground.save();
                                    console.log("created new comment");
                                }
                            }
                        );
                    }
                });
            });
        }
    });
};
 
module.exports = seedDB;