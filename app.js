require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const url = 'mongodb+srv://utsavdas10:'+process.env.PASSWORD+'@cluster0.2mfg8bb.mongodb.net/TodolistDB?retryWrites=true&w=majority';

mongoose.connect(url).then(function(){
  console.log("Connected to MongoDB server...");
});

const itemSchema = new mongoose.Schema(
  {
    name:{
      type: String,
      required: true
    }
  }
)

const Item = mongoose.model('Item', itemSchema)

const cook = new Item(
  {
    name: "I am 1111"
  });

const play = new Item(
  {
    name: "I am 2222"
  });

const rest = new Item(
  {
    name: "I am 3333"
  });




const listSchema = new mongoose.Schema(
  {
    name: String,
    items: [itemSchema]
  }
)

const List = mongoose.model('List', listSchema)



const defaultItems = [cook, play, rest];

Item.count().then(function(count){
  if(count === 0){
    Item.insertMany(defaultItems).then(function(res){
      console.log("Done Inserting Deafult Items")
    })
  }
})




app.get("/", function(req, res) {

  Item.find().then(function(items){
    res.render("list", {listTitle: "Today", newListItems: items});
  })

});

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const listName = req.body.list

  const newData = new Item({name: newItem});

  if(listName == "Today"){
      newData.save().then(function(){
        console.log("Done Inserting New Items");
      })
      res.redirect("/");
    }
  else{
    List.findOne({name:listName}).then(function(foundlist){
      foundlist.items.push(newData);
      foundlist.save()
      res.redirect("/"+listName)
    }) 
  }
});


app.post("/delete", function(req, res){
  const listName =  req.body.listName;
  const itemId = req.body.checkbox;
  if(listName === "Today"){
    Item.findByIdAndDelete(itemId)
    .then(function(result){
          if(result){
              console.log("Successfully Deleted");
              res.redirect("/")
          }
          else{
              console.log("Failed to Deleted");
              res.redirect("/")
          }
      })
  }
  else{
    List.findOneAndUpdate({name:listName}, {$pull: {items:{_id: itemId}}}).then(function(){
      res.redirect("/"+listName)
    })
  }
})

app.get("/:customListName", function(req, res){
  const customListName = lodash.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then(function(result){
      if(result == null){
        const list = new List(
          {
            name: customListName,
            items: defaultItems
          }
        )
        list.save()
      }
      else{
        console.log("List already exists")
      }
  })

  List.findOne({name: customListName}).then(function(list){
    res.render("list", {listTitle: customListName, newListItems: list.items})
  })
})









const port = process.env.PORT || 5000

app.listen(port, function() {
  console.log(`Server started on port ${port}...`);
});
