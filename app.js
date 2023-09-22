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

 // setting database tables
 const tbl_users = sequelize.define('tbl_users',{
  username:Sequelize.STRING,
  phone:Sequelize.STRING,
  password:Sequelize.STRING 

},{tablename:"tbl_users"});
// close table setting 


  //creating and loading forms
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

  app.get('/user_login',(req,res) => {
    return res.render('user_login');
  })

  app.get('/forgetpassword',(req,res) => {
    return res.render('forgetpassword');
  })

  app.get('/viewsales',(req,res) => {
    return res.render('viewsales');
  })


// processing of forms 
    app.post('/signup',async (req,res) => {
        try{
              const {username,phone} = req.body;
              const password = await bcrypt.hash(req.body.password,20);
              const user_exist = await tbl_users.findOne({where:{username:username}});
              if(user_exist){
                  res.render("signup",{msg_err:"Sorry! User Already Exist"});
              }else{
                  const create_user = await tbl_users.build({
                  username,
                  phone,
                  password 
                  })
                  create_user.save();
                  res.redirect('http://localhost:5100'); 
                }
        }catch(err){
          return console.log({message:err});
        }

    })

    app.post('/user_login', async (req,res) => {
       try{
          const {username,pass} = req.body;
          console.log(pass);
          const UserExist = await tbl_users.findOne({where:{username:username}});
          const hashpassword = await bcrypt.compare(pass, UserExist.password);
          if(UserExist){
              if(hashpassword){
                  res.redirect("dashboard");
              }else{
                  res.render("user_login",{msg_err:" wrong password "});
              }
          }else{
              res.render("user_login",{msg_err:" incorrect credentials  "});
          }

      }catch(error){
        return console.log(error);
      }
    
    })





const PORT = process.env.PORT || 5100;
app.listen(PORT, console.log(`app running at port ${PORT}`));
