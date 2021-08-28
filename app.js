const express = require('express');
//const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash')

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

//MONGOOSE 
mongoose.set('useFindAndModify', false);

mongoose.connect('mongodb+srv://admin-Aditya:Test123@cluster0.texar.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true})

const itemSchema = mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item(
  {
    name: "Welcome to your To-Do list!"
  }  
)

const item2 = new Item(
  {
    name: "Hit the + button to add a new item."
  }  
)

const item3 = new Item(
  {
    name: "<-- Hit this to delete an item."
  }  
)

const defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems, function(err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Default items logged to database.")
//   }
// })

//GET

app.get("/", function(req,res) {

    Item.find({}, function(err, foundItems) {
      if(foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Default items logged to database.")
          }
        })

        res.redirect("/");
      } else {
        res.render('list', {listTitle: "Today", newListItems: foundItems});
      }
    })
    //let day = date.getDate()
    
})

// app.get("/work", function(req, res) {
//     res.render('list', {listTitle: 'Work', newListItems: workItems})
// })

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:customHeader", function(req, res) {
  const customHeader = _.capitalize(req.params.customHeader);

  const list = new List(
    {
      name: customHeader,
      items: defaultItems
    }
  );

  List.findOne({name: customHeader}, function(err, foundList) {
    if (!err) {
      if (!foundList){
        //Create new list
        list.save(function(err){
          res.redirect("/" + customHeader);      
        });
      } else {
        //Show existing list
        res.render('list', {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
})

//POST
app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName
    })

    if(listName === "Today") {
      item.save(function(err){
        res.redirect("/");      
      });      
    } else {
      List.findOne({name: listName}, function(err, foundList) {
        foundList.items.push(item);
        foundList.save(function(err){
          res.redirect("/" + listName);      
        });
      })
    }
})

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Deleted Checked Item.")
        res.redirect("/")
      }
    });    
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err){
        res.redirect("/" + listName);
      }
    })
  }
  
})
//LISTEN

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started Successfully.");
});
