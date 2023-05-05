const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require('lodash')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect('mongodb+srv://utsavdas10:guitarislife10@cluster0.2mfg8bb.mongodb.net/TodolistDB?retryWrites=true&w=majority');

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

// const yes = new List(
//   {
//     name: "work",
//     items:
//     [
//       {
//       name:"i am busy"
//       },
//       {
//         name:"i am yayyyy"
//       }
//     ]
//   });
// const no = new List(
//   {
//     name: "PLay",
//     items:{
//       name:"i am ply"
//     }
//   });

// yes.save();
// no.save();



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











app.listen(3000, function() {
  console.log("Server started on port 3000...");
});
