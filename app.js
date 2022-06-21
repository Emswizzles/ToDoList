const express = require("express");
const app = express();
const _ = require("lodash");

// Use the mongoose package to make using Mongo databases a lot simpler with node.js
const mongoose = require("mongoose");

// Connect to the database using the mongodb server - if the db doesnt already exist, it will create it
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb+srv://admin-emma:test123@cluster0.pdoc2.mongodb.net/todolistDB');
};

//Creates a SCHEMA that sets out the fields each document will have and their datatypes
const itemsSchema = new mongoose.Schema ({
	name: String
});

//create a MODEL
const Item = new mongoose.model ("Item", itemsSchema)

//create new DOCUMENTS
const item1 = new Item ({
	name: "Welcome to your to do list"
});
const item2 = new Item ({
	name: "Use the + button to add items to the list"
});
const item3 = new Item ({
	name: "<---- Hit this to delete the item"
});
 
// Array to pass into the insertMany function in order to set up empty DB
const defaultItems = [item1, item2, item3];

// Creating schema for custom lists - it contains an array of item documents
const listSchema = new mongoose.Schema ({
	name: String,
    items: [itemsSchema]
});

const List = new mongoose.model ("List", listSchema);

//Needed so that we are able to grab data from the post request later on
app.use(express.urlencoded({extended: true}));

//Needed so that express serves up the static files like the css stylesheet
app.use(express.static("public"));

//Code to allow us to use EJS (templating)
app.set('view engine', 'ejs');

//Code to run when get request for the home route is recieved by the server
app.get("/", function(req, res){
    // Querying the DB to get all of the stored list items
    Item.find({}, function(err, results){
        if(err){
            console.log(err);
        }else{
            if (results.length === 0){
                Item.insertMany(defaultItems, function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("Default items inserted correctly");
                    };
                });
            }
            //Creating our response by rendering a page called list.ejs which is found in the views folder
            //Passing in a JS object which is a key value pair - the results from the DB
            //The key must match the placeholder in the ejs file, the value is what will be placed on the webpage
            res.render('list', {listTitle: "Today", items: results});
        };
    });
});

// Route for any custom parameter path e.g. localhost/worklist
app.get("/:customListName", function(req, res){
    //Saving the custom list name from the path that the user entered
    const customListName = _.capitalize(req.params.customListName);

    // Checking to see if that custom list already exists in the DB, if not - create it
    List.findOne({name:customListName}, function(err, results){
        if (err){
            console.log(err);
        }else{
            if (results){
                res.render('list', {listTitle: results.name, items: results.items});
            }else{
                const newList = new List({
                    name: customListName,
                    items: defaultItems
                });
                newList.save();
                console.log("New list created");
                res.redirect("/" + customListName);
            };
        };
    });
});

app.get("/about", function(req, res){
    res.render("about")
});

//Code to run when a post request is recieved by the home route
app.post("/", function(req, res){
    const listName = req.body.list;

    const itemName = req.body.item;
    const newItem = new Item ({
        name: itemName
    });

    //Checks to see which list the plus button has been clicked on so that the item is added to the correct one
    if (listName === "Today"){
        newItem.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, result){
            result.items.push(newItem);
            result.save();
            res.redirect("/" + listName);
        });
    };

});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
        Item.deleteOne({_id:checkedItemId}, function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Item deleted");
            };
        });
        res.redirect("/")
    }else{
        //Find the List that matches the current page
        //Pull (remove) from the items array within that List, the item which matches the id of the checkbox
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, result){
            if(err){
                console.log(err);
            }else{
                res.redirect("/" + listName);
            };
        });
    };

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
    console.log("Server started");
});