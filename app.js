
const express = require('express');
const bodyPaser = require('body-parser');
const bcrypt = require("bcrypt");
const exphbs = require('express-handlebars');
const {Sequelize, QueryTypes, EmptyResultError} = require("sequelize");


const app = express();
app.use(express.json())
// body parser
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main'}));
app.set('view engine','handlebars');
app.use(bodyPaser.urlencoded({ extended : false}))
// set static folder
app.use(express.static("public"));
app.use("/uploads",express.static("uploads"));


app.get('/', (req, res)=> res.render('index',{ layout:'landing'}));
// linking to database via sequelize
const sequelize = new Sequelize('rayonpaintApp', 'root', '', {
    dialect: "mysql",
  });
  // test the connection
sequelize.authenticate().then(() => {
    console.log(' connection to database is successful');
  }).catch((error) => console.log(error, ' sorry an eror'));


 app.get('/dashboard',(req,res) =>{
   res.render("dashboard");
})

app.get('/addproduct',(req,res) =>{
  return res.render("addproduct");
})

app.get('/viewprod_details',(req,res) =>{
   return res.render("viewprod_details");
 })

 app.get('/addstaff',(req,res) => {
   return res.render('addstaff');
 })

 app.get('/viewstaff',(req,res) => {
  return res.render('viewstaff');
  })

  app.get('/paymentdetails',(req,res) => {
    return res.render('paymentdetails');
  })
  
  app.get('/addclient',(req,res) => {
    return res.render('addclient');
  })

  app.get('/viewclient',(req,res) => {
    return res.render('viewclient');
  })

  app.get('/signup',(req,res) => {
    return res.render('signup');
  })

  app.get('/forgetpassword',(req,res) => {
    return res.render('forgetpassword');
  })



const PORT = process.env.PORT || 5100;
app.listen(PORT, console.log(`app running at port ${PORT}`));
