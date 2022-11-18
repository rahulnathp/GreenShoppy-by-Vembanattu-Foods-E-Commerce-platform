var express = require('express');
var bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb');
var session = require('express-session')
const { User } = require('../models/registration');
const { Store } = require('../models/store');
const { Category } = require('../models/category');
const { guestCart } = require('../models/guestCart');
const { Cart } = require('../models/cart');
const { Brand } = require('../models/brand');
const storehelpers = require('../helpers/storehelpers');
const userhelpers = require('../helpers/userhelpers');



var router = express.Router();




router.get('/about', function(req, res, next) {
  res.render('about', {index:true});
});
router.get('/vembanattustore', async function(req, res, next) {
  let stores =await Store.find({}).lean()
  let categories= await Category.find({}).lean()
  let brands= await Brand.find({}).lean()

  res.render('vembanattu',{index:true,stores,categories,brands})
 
});


router.get('/vembanattustore/category/:id', async function(req, res, next) {
  console.log(req.params)
  let category=await Category.findOne({_id:ObjectId(req.params)}).lean()
  console.log(category.categoryName)
  let stores =await Store.find({Category:category.categoryName}).lean()
  let categories= await Category.find({}).lean()
  let brands= await Brand.find({}).lean()

  res.render('vembanattu',{index:true,stores,categories,brands})
 
});

router.get('/userlogin/category/:id', async function(req, res, next) {
  let category=await Category.findOne({_id:ObjectId(req.params)}).lean() 
  let stores =await Store.find({Category:category.categoryName}).lean()
  let categories= await Category.find({}).lean()
  let brands= await Brand.find({}).lean()
  let users = req.session.username

  res.render('user-dashboard',{User:true,stores,categories,brands,users})
 
});

router.post('/userlogin', (req, res, next) => {
  try {
   
    
    userhelpers.loginFunction(req.body).then(async (response) => {
      
      if (response.status) {
        req.session.guestId=req.session.id;
        req.session.username = response.user
        response.redirectTo = req.session.redirectTo
        delete req.session.redirectTo;
        req.session.user = true
      }
      res.json(response)
      
      
    })
  } catch (error) {
    res.redirect('/error')
  }
})

router.post('/userlogins',async function(req, res, next) {
  let userData=req.body
  
 
  userhelpers.loginFunction(userData).then((response) => {
    if(response.status){
      if(response.user.Isblocked){
        req.session.userLoginErr = "User Is Blocked"
          res.redirect('/')
      }
      else{
        
        
        console.log(req.session.id)
        
        console.log(req.session.username)
        
        res.redirect("/userlogin")
      }
      
    }
    else {
      req.session.userLoginErr = "Invalid Username or Password"
      res.redirect('/')
    }
   
 

  })

});

router.get('/rough',async function(req, res, next) {
 res.render('PRODUCTS',{index:true})
});


router.use((req,res,next) => {
res.set('Cache-Control', 'no-Cache, private , no-store,must-revalidate, max-stale=0, post-check=0, pre-check=0')
next()
}).get('/',async function(req, res, next) {
  if(req.session.user)
  res.redirect('/userlogin')
  else
  if(req.session.AdminId)
  res.redirect('/adminlogin');
  else
 
  var stores=await Store.find({}).lean()
  
  let guestCart = await userhelpers.getGuestCartProducts(req.session.id)
 
 
  res.render('index',{ index:true,"loginErr": req.session.userLoginErr,stores,guestCart })
  req.session.userLoginErr = false
});
router.use((req,res,next) => {
  res.set('Cache-Control', 'no-Cache, private , no-store,must-revalidate, max-stale=0, post-check=0, pre-check=0')
  next()
  }).get('/userlogin', async function(req, res, next) {
    if(req.session.user){
      let users = req.session.username
      console.log('fullname',users.Full_name)
    let stores =await Store.find({}).lean()
    let brands = await Brand.find({}).lean()
    let categories =await Category.find({}).lean()
    let cart = await userhelpers.getCartProducts(users._id)
    res.render('user-dashboard', {User:true,stores,users,brands,categories,cart})
    }
    else
    if(req.session.AdminId)
    res.redirect('/adminlogin')

    else{
    req.session.loginErr="This account is blocked"
    res.redirect('/');}
  }); 

  router.get('/userlogout',  function(req, res) {
    req.session.destroy();
    res.redirect('/')
  });

  router.get('/viewmore',  async function(req, res) {
    let stores = await Store.find({}).lean()
    if(req.session.user){
      let users = req.session.user
      res.render("viewFullProducts",{User:true,stores})}
      else
        res.render('viewFullProducts',{index:true,stores})
    }
  );
  
  

module.exports = router;
