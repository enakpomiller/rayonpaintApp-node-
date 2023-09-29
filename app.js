const express = require('express');
const bodyPaser = require('body-parser');
const bcrypt = require("bcrypt");
const session = require('express-session');
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


 const tbl_products = sequelize.define('tbl_product',{
   prodname:Sequelize.STRING,
   prodprice:Sequelize.STRING,
   prodqty:Sequelize.STRING,
   colorqty:Sequelize.STRING,
   date_of_purchase:Sequelize.STRING 
},{tablename:'tbl_products'} );
   tbl_products.sync();

   const tbl_staff = sequelize.define('tbl_staff',{
     firstname:Sequelize.STRING,
     othernames:Sequelize.STRING,
     email:Sequelize.STRING,
     phone:Sequelize.STRING,
     address:Sequelize.STRING,
     position:Sequelize.STRING,
     monthlypay:Sequelize.STRING

  },{tablename:'tbl_staff'});
  tbl_staff.sync();  

const tbl_sale = sequelize.define('tbl_sale',{
    prodname:Sequelize.STRING,
    prodprice:Sequelize.STRING,
    prodbrand:Sequelize.STRING,
    soldqty:Sequelize.STRING,
    amount:Sequelize.STRING,
    clientname:Sequelize.STRING,
    clientphone:Sequelize.STRING
},{tablename:'tbl_sale'});
tbl_sale.sync();

  // setting session config 
  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))

  //creating and loading forms
 app.get('/dashboard',(req,res) =>{
  if(req.session.loggedin){
    const user = req.session.username;
    res.render("dashboard",{user});
  }else{
    res.render("user_login",{msg_err:" PLEASE LOGIN  "});
  }
  
  })
 
 app.get('/addproduct',(req,res) =>{
  if(req.session.username){
    const user = req.session.username;
    return res.render("addproduct",{user});
  }else{
    return res.render("user_login",{msg_err:" PLEASE LOGIN"});
  }
 })

 app.get('/viewprod_details',async (req,res) =>{
    const allrec = await tbl_products.findAll();
    if(req.session.username){
      const user = req.session.username;
      res.render("viewprod_details",{allrec,user});
    }else{
      res.render("user_login");  
    }
   
  })
 
  app.get('/viewusers',async(req,res) =>{
      if(req.session.username){
        const user = req.session.username;
        const title =  " view Users";
        const getusers = await tbl_users.findAll();
        return res.render('viewusers',{user,getusers,title});
      }else{
        return res.redirect('user_login');
      }
  
  })

 app.get('/addstaff',(req,res) => {
    if(req.session.username){
      const user = req.session.username;
      return res.render('addstaff',{user});
    }else{
      return res.render('user_login');
    }
  
 })


 app.get('/viewstaff',async (req,res) => {
   try{
      const getallstaff = await tbl_staff.findAll();
       if(getallstaff){
        const user = req.session.username;
        return res.render('viewstaff',{user,getallstaff});
       }else{
        const msg_err = " NO RECORD FOUND ";
        return res.render('viewstaff',{msg_err,user});
      }
      
  }catch(err){
    return console.log(err);
  }
  
  })

  app.get('/paymentdetails',(req,res) => {
    if(req.session.username){
      const user = req.session.username;
      return res.render('paymentdetails',{user});
    }else{
     return res.redirect('user_login'); 
    }
   
  })

  app.get('/addsales',(req,res) => {
     if(req.session.username){
      const title = " Add Sales ";
      const user = req.session.username;
      return res.render('addsales',{user,title});
    }else{
      return res.render('user_login');
    }
    
  })
  
  app.get('/addclient',(req,res) => {
    if(req.session.username){
      const user = req.session.username;
     return res.render('addclient',{user});
    }else{
      return res.render('addclient');
    }
    
  })

  app.get('/viewclient',(req,res) => {
     try{
      if(req.session.username){
        const user = req.session.username;
        return res.render('viewclient',{user});
      }else{
         return res.redirect("user_login");
      }
     
    }catch(err){
     console.log(err);
    }
    
  })

  app.get('/addusers',(req,res) => {
   if(req.session.username){
    const title = " Add Users ";
    const user = req.session.username;
    return res.render('addusers',{user,title});
  }else{
   return res.redirect('user_login');
  }

  })

  app.get('/user_login',(req,res) => {
    return res.render('user_login');
  })

  app.get('/forgetpassword',(req,res) => {
    return res.render('forgetpassword');
  })

  app.get('/viewsales',async (req,res) => {
     if(req.session.username){
      const user = req.session.username;
      const allsales = await tbl_sale.findAll();
      return res.render('viewsales',{user,allsales});
    }else{
      return res.redirect('user_login');
    }
    
  })



    // processing of forms 
       app.post('/addusers',async (req,res) => { 
             try{
                  const {username,phone} = req.body;
                  const password = await bcrypt.hash(req.body.password,20);
                  const user_exist = await tbl_users.findOne({where:{username:username}});
                  if(user_exist){
                      res.render("addusers",{msg_err:" SORRY USER ALREADY EXIST"});
                  }else{
                       const create_user = await tbl_users.build({
                      username,
                      phone,
                      password 
                      })
                      create_user.save();
                      res.render('addusers',{msg_success:"User Created Successfullly"});
                    
                    }
             }catch(err){
                return console.log(err);
             }

        })

    // login module 
    app.post('/user_login', async (req,res) => {
       try{
            const {username,password} = req.body;
            const CheckUser = await tbl_users.findOne(
              {where:{
                username
              }});

           if(CheckUser){
                req.session.loggedin = true;
                req.session.username = username;
                const user = req.session.username;
                res.render("dashboard",{user});

                // const match = await bcrypt.compare(password, CheckUser.password)
                // if(match){
                //   req.session.loggedin = true;
                //   req.session.username = username;
                //   const user = req.session.username;
                //   res.render("dashboard",{user});
                // }else{
                //   res.render('user_login',{msg_err:" INCORRECT USER DETAILS  "});
                // }
               
           }else{
            res.render('user_login',{msg_err:" USER DOES NOT  EXIST "});
           }

      }catch(error){
        return console.log(error);
      }
    
    })

    // add product 
    app.post('/addproduct',async(req,res) =>{
        try{
          const {prodname,prodprice,prodqty,colorqty,date_of_purchase} = req.body;
            if(prodname =="" || prodprice=="" || prodqty=="" || colorqty=="" || date_of_purchase==""){
              const  user = req.session.username;
                res.render("addproduct",{user});
                
            }else{
              const insert = await tbl_products.build({
                prodname,
                prodprice,
                prodqty,
                colorqty,
                date_of_purchase
              });
              insert.save();
              res.render("addproduct",{msg_success:" Product created successfully"});
            }

            }catch(error){
              console.log(error);  
            }
          
    })


// add staff rout 
  app.post('/addstaff',async(req,res) =>{
      try{
         const {firstname,othernames,email,phone,address,position,monthlypay} = req.body;
         const userexist = await tbl_staff.findOne({
           where:{
            email:email
          }
        });
        if(userexist){
          const user = req.session.username;
           const msg_err = " SORRY THIS STAFF ALREADY EXIST";
           res.render("addstaff",{msg_err,user});
        }else{
            const create_staff = await tbl_staff.build({
              firstname,
              othernames,
              email,
              phone,
              address,
              position,
              monthlypay
            })
            create_staff.save();
            const user = req.session.username;
            const msg_success = " STAFF CREATED SUCCESSFULLY";
            res.render("addstaff",{msg_success,user});
        }
      }catch(err){
       return console.log(err);
      }
})



// add sale rout 
app.post('/addsales',async(req,res) =>{
   if(req.session.username){
    try{
      const {prodname,prodprice,prodbrand,soldqty,amount,clientname,clientphone} = req.body;
         const create_sale = await tbl_sale.build({
           prodname,
           prodprice,
           prodbrand,
           soldqty,
           amount,
           clientname,
           clientphone
         })
         create_sale.save();
         const user = req.session.username;
         const msg_success = " SALES ADDED  SUCCESSFULLY";
         res.render("addsales",{msg_success,user});
     
   }catch(err){
    return console.log(err);
   }
   }else{
     return res.redirect('user_login');
  
  }


})


  // delete users
  app.get('/deleteusers',async(req,res) =>{
    try{
        const userid = req.query.id;
        console.log(userid);
          const deluser = await tbl_users.destroy({where:{id:userid}});
          if(deluser){
            res.redirect("viewusers");
          }else{
            res.render("viewusers");
          }
    }catch(err){
      console.log(err);
    }
  })


app.get('/editusers/:id',(req,res) =>{
      const userid = req.params.id
      const title = " Edit Users "
      res.render("editusers",{title});

})


    // logout session 
    app.get('/logout',(req,res) =>{
        req.session.destroy(err =>{
          if(err){
            console.error('Error destroying session:', err);
          }else{
            res.redirect('/user_login');
          }
        })

    })



const PORT = process.env.PORT || 5100;
app.listen(PORT, console.log(`app running at port ${PORT}`));
