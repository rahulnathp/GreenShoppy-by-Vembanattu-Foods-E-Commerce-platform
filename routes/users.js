var express = require('express');
var session= require('express-session')
const { ObjectId } = require('mongodb');
const { registerHelper } = require('hbs');
var router = express.Router();
require("dotenv").config();
const { User } = require('../models/registration');
const { Store } = require('../models/store');
const { Order } = require('../models/order');
const { Cart } = require('../models/cart');
const { guestCart} = require('../models/guestCart');
const { valid } = require('joi');
var crypto = require('crypto');
const multer = require('multer');
const userhelpers = require('../helpers/userhelpers');
const storehelpers = require('../helpers/storehelpers');
const serviceSID = process.env.TWILIO_SERVICE_ID
const accountSID = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/')
  }
}







var generate_key = function() {
    // 16 bytes is likely to be more than enough,
    // but you may tweak it to your needs
    return crypto.randomBytes(16).toString('base64');
};


router.get('/userlogin/productView/:id',async function (req, res, next) {
  let productId = req.params.id
  let productsView = await Store.find({ _id: ObjectId(productId) }).lean()

  if(req.session.user){
  let users=req.session.user
  res.render('productView', { User: true, productsView ,users})}
  else{
  let guest=req.session
  res.render('ProductViewGuest', { index:true, productsView,guest })}
})

router.get('/userlogin/add-to-cart/:id',async (req, res) => {

  try {
    if(req.session.user){
    userhelpers.addToCart(req.params.id, req.session.username._id)
    
    let user = await User.find({ _id: req.session.username._id }).lean()
    let products = await Store.find({ _id: req.params.id })

    res.redirect('/userlogin/cart')
  }
  else {
    
    userhelpers.addtoCartGuest(req.params.id,req.session.id)
    let products = await Store.find({ _id: req.params.id })

    res.redirect('/guestlogin/cart')

  }
  }
  
  catch (error) {
    res.redirect('/error')
  }
})


router.get('/userlogin/editprofile/:id', verifyLogin, async (req, res) => {
  var userId=req.params;
  var users = req.session.username
  var customer = await User.find({_id:ObjectId(userId)}).lean()
  console.log(users)
  res.render('userProfile',{User:true,customer,users})

})


router.get('/userlogin/cart', verifyLogin, async (req, res) => {
  try {
  let users = req.session.username
  
 
  let newCart = await userhelpers.guestCartProceed(req.session.id,req.session.username._id)
  

  let products = await userhelpers.getCartProducts(req.session.username._id)

  
  
  
  if (products.length > 0) {
   let total = await userhelpers.getTotalAmount(req.session.username._id)
   let offTotal = await userhelpers.getOfferTotalAmount(req.session.username._id)
    let discount = Math.round(Number(total - offTotal))
    
    res.render('cart', { User: true, products, users, total, offTotal, discount })
  } else {
    
    res.render('empty-cart', { User:true, users })
    
    }
    } catch (error) {
      res.redirect('/error')
    // }

  }
}
)

router.get('/guestlogin/cart', async (req, res) => {
  try {
  
    let guest = req.session 
  let products = await userhelpers.getGuestCartProducts(req.session.id)
  
  
  if (products.length > 0) {
    let total = await userhelpers.getGuestTotalAmount(req.session.id)
    let offTotal = await userhelpers.getGuestOfferTotalAmount(req.session.id)
    let discount = Math.round(Number(total - offTotal))

    res.render('guestCart', { index: true, products, total, offTotal, discount,guest })
  } else {
    res.render('empty-cart', { index:true})
    
    }
    } catch (error) {
      res.redirect('/error')
    // }

  }
}
)

router.get("/otplogin", (req, res) => {
  try {
    res.render('OTPlogin', { Users: true, "loginErr": req.session.userLoginErr })
  } catch (error) {
    res.redirect('/error')
  }

})

router.post('/otplogin', async (req, res) => {
  try {
    let number = req.body.number
    userhelpers.findUser(number).then((response) => {
      if (response.status) {
        
        if (!response.user.Isblocked) {
          req.session.user = true
         
          req.session.username = response.user.Email
          req.session.usernumber = response.user.Mobile
          
          client.verify.v2.services(serviceSID)
            .verifications
            .create({ to: `+91${req.body.number}`, channel: 'sms' })
            .then(verification => res.redirect("/otplogin/otpconfirm"));
          
        }
        else {
          req.session.userLoginErr = "User is blocked"
          res.redirect('/otplogin')
        }
      }
       else {
          req.session.userLoginErr = "Invalid Number"
          res.redirect('/otplogin')
        }
      })
  }
  catch (error) {
    res.redirect('/error')
  }

})
router.get('/otplogin/otpconfirm', (req, res) => {
  try {
    res.set('cache-control', 'private,no-cache,no-store,must-revalidate')
    res.render('OTPconfirm', { Users: true, "loginErr": req.session.userOTPErr })
  } catch (error) {
    res.redirect('/error')
  }

})

router.post('/otplogin/otpconfirm', (req, res) => {
  try {
    const { otp } = req.body
    console.log(req.body)
    client.verify.v2.services(serviceSID).verificationChecks
      .create({ to: `+91${req.session.usernumber}`, code: otp })
      .then(verification_check => {
        if (verification_check.valid)
          res.redirect('/userlogin')
        else {
          req.session.userOTPErr = "Invalid OTP"
          res.redirect('/otplogin/otpconfirm')
        }
      })
  }
  catch (error) {
    res.redirect('/error')
  }

})
router.post('/change-product-quantity', (req, res, next) => {
  try {
    
    userhelpers.changeProductQuantity(req.body).then(async (response) => {
      
      if (response.status) {
        let total = await userhelpers.getOfferTotalAmount(req.body.user)
        response.total = total
      }
      res.json(response)
      
      
    })
  } catch (error) {
    res.redirect('/error')
  }
})

router.post('/remove-cart-item', (req, res) => {
  try {
    userhelpers.removeCartItem(req.body).then((response) => {
      res.json(response)
    })
  } catch (error) {
    res.redirect('/error')
  }
})


router.post('/change-guestproduct-quantity', (req, res, next) => {
  try {
    userhelpers.changeGuestProductQuantity(req.body).then(async (response) => {
      
      if (response.status) {
        let total = await userhelpers.getGuestOfferTotalAmount(req.body.guest)
        response.total = total
      }
      res.json(response)
      
      
    })
  } catch (error) {
    res.redirect('/error')
  }
})

router.post('/remove-guestcart-item', (req, res) => {
  try {
    userhelpers.removeGuestCartItem(req.body).then((response) => {
      res.json(response)
    })
  } catch (error) {
    res.redirect('/error')
  }
})



router.get('/place-order', async (req, res) => {
  try {
    let products = await userhelpers.getCartProducts(req.session.username._id)
    let categories = await storehelpers.getAllCategory()
    let address = await userhelpers.getAddress(req.session.username._id)
  
    // let coupons = await adminHelper.getAllCoupons()
    let total = 0
    if (products.length > 0) {
      total = await userhelpers.getOfferTotalAmount(req.session.username._id)
      let users = req.session.username
    res.render('place-order', {User:true, users, total,address })
    } else {
      res.redirect('/userlogin/cart')
    }
  } catch (error) {
    res.redirect('/error')
  }
})
router.post('/place-order', async (req, res) => {
  try {
  
    let products = await userhelpers.getCartProductList(req.body.userId)
    
    
    let productlist = await userhelpers.getCartProducts(req.body.userId)
    
    let totalPrice = 0
    if (products.length > 0) {
      if (req.session.coupon) {
        totalPrice = req.session.total
      } else {
        totalPrice = await userhelpers.getOfferTotalAmount(req.body.userId)
        
      }
      req.session.coupon = null
      
      userhelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
        if (req.body['payment-method'] === 'COD') {
          res.json({ codSuccess: true })
        } else if (req.body['payment-method'] === 'PAYPAL') {
          res.json({ codSuccess: true })
        }
        else {
          userhelpers.generateRazorpay(orderId, totalPrice).then((response) => {
            res.json(response)
          })
        }
      })
    }
  } catch (error) {
    res.redirect('/error')
  }
})


router.post('/addAddress', async (req, res) => {
  try {
    await userhelpers.addAddress(req.body,req.session.username._id)
    res.redirect('/place-order')
  } catch (error) {
    res.redirect('/error')
  }


})

router.get('/place-order/order-success', verifyLogin, async (req, res) => {
  try {
    let users = req.session.username
    let categories = await storehelpers.getAllCategory()

    res.render('order-success', { User:true,users, categories })
  } catch (error) {
    res.redirect('/error')
  }
})

router.get('/orders', verifyLogin, async (req, res) => {
  try {
    let users = req.session.username
    let categories = await storehelpers.getAllCategory()
    
    let userId = users._id
    // let orderDetails = await Order.find({userId:userId}).lean()  
    let orders = await userhelpers.getAllOrders(userId)

    for (val of orders) {
      val.date = new Date(val.date).toLocaleDateString()
    }
    let count = Object.keys(orders).length

    if (count) {
      
      res.render('order-list',{User:true, orders ,users})
    } else {
      res.render('zero-orders', {User:true, categories })
    }
  } catch (error) {
    res.redirect('/error')
  }
})

router.get('/orders/products/:id', verifyLogin, async (req, res) => {
  try {
    
    let orderId = req.params.id
    let categories = await storehelpers.getAllCategory()
    let products = await userhelpers.getAllProductsOfOrder(orderId)
    let users = req.session.username
    res.render('order-products', { User:true,users, products, categories })
  } catch (error) {
    res.redirect('/error')
  }
})
router.post('/orders/filter',async (req,res)=>{
  try{
  let users = req.session.username
  let userId=users._id
  let data = req.body.status
  let orders=await userhelpers.filtering(userId,data)
  if(orders){
  for (val of orders) {
    val.date = new Date(val.date).toLocaleDateString()
  }
  let count = Object.keys(orders).length  
    res.render('order-list',{User:true, orders ,users,count})
  } else {
    res.render('order-list', {User:true, categories })
  }
}

catch{
  res.redirect('/')
}

  

})


router.get('/orders/filter',async (req,res)=>{

  res.redirect('/')
})

router.get('/orders/cancel-order/:id', (req, res) => {
  try {
    userhelpers.cancelOrder(req.params.id).then((response) => {
      res.redirect('/orders')
    })
  } catch (error) {
    res.redirect('/')
  }
})






module.exports = router;
