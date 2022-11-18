var express = require('express');
var router = express.Router();
const { registerHelper } = require('hbs');
var session = require('express-session')
const { Store } = require('../models/store');
const { Category } = require('../models/category');
const { Brand } = require('../models/brand');
const { trusted } = require('mongoose');
const products = require('../helpers/storehelpers');
const product = require('../helpers/userhelpers');
const { User } = require('../models/registration');
const { on } = require('nodemon');
const storehelpers = require('../helpers/storehelpers');
const multer = require('multer');
const { response } = require('../app');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/week 9/Vembanattu Foods E-Commerce Website/public/category-image')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg'
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})
const upload = multer({ dest: './public/category-image/', storage: storage })



/* GET users listing. */
router.post('/adminlogin', async function (req, res, next) {
  const AdminEmail = "admin@gmail.com";
  const AdminPassword = "112233";
  console.log(req.body) 
  req.session.email = req.body.email;
  req.session.password = req.body.password;



  if (req.session.email == AdminEmail && req.session.password == AdminPassword) {

    req.session.AdminId = true;
   res.redirect('/admin')
   

  }

  else {
    res.redirect('/')
  }
});
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-Cache, private , no-store,must-revalidate, max-stale=0, post-check=0, pre-check=0')
  next()
}).get('/admin', async function (req, res, next) {
  if (req.session.AdminId == true) {
    let usersCount = await storehelpers.getUsersCount()
    let ordersCount = await storehelpers.getOrdersCount()
    let productsCount = await storehelpers.getProductsCount()
    let orders = await storehelpers.getAllTheOrders()
    let total = await storehelpers.getTotalAmountOrders()
    let weeks = await storehelpers.getWeeks()
    let months = await storehelpers.getMonths()
    let years = await storehelpers.getYears()
    /////////WEEK/////////////
    let weekYAxis = []
    let weekXAxis = []
    for (val of weeks) {
      weekYAxis.push(val.count)
      weekXAxis.push(val._id)
    }
    ////////////Month//////////////
    let monthYAxis = []
    let monthXAxis = []
    for (val of months) {
      monthYAxis.push(val.count)
      monthXAxis.push(val._id)
    }
    /////////YEAR/////////////
    let yearYAxis = []
    let yearXAxis = []
    for (val of years) {
      yearYAxis.push(val.count)
      yearXAxis.push(val._id)
    }
    res.render('admin', { admin: true, usersCount, ordersCount, productsCount, orders, total, weekYAxis, weekXAxis, monthXAxis, monthYAxis, yearXAxis, yearYAxis })
  } else {
    res.redirect('/')
  }


})

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-Cache, private , no-store,must-revalidate, max-stale=0, post-check=0, pre-check=0')
  next()
}).get('/adminlogin', async function (req, res, next) {
  if (req.session.AdminId) {
    let stores = await Store.find({}).lean()
    let category = await Category.find({}).lean()
    console.log(category)
    let brand = await Brand.find({}).lean()
 

    res.render('admin-dashboard', { admin: true, stores,category,brand })
  }
  else
    res.redirect('/');
});


router.get('/add-product', (req, res) => {
  adminHelper.getAllCategory().then((category) => {
    res.render('admin-addproduct', { admin: true, category })
  })

})



router.post('/adminlogin/categories/addbrand', upload.single('bImage'), (req, res) => {
  res.setHeader('cache-control', 'private,no-cache,no-store,must-revalidate')

  if (req.session.AdminId == true) {
    storehelpers.addBrand(req.body,req.file.filename, (id) => {
      if (id == "EXIST") {
        req.session.brandExist = true
        res.redirect("/adminlogin/categories")
      } else 
      res.redirect('/adminlogin/categories')
    }
)}   
  else
    res.redirect('/adminlogin')

})

router.delete('/adminlogin/categories/delete-brand/:id', (req, res) => {
  let brandId = req.params.id
  storehelpers.deleteBrand(brandId).then((response) => {
    res.redirect('/adminlogin/categories')
  })
})

router.post('/adminlogin/categories/addcategory', upload.single('cImage'), (req, res) => {
  res.setHeader('cache-control', 'private,no-cache,no-store,must-revalidate')
  console.log("reqbody")
  console.log(req.body)
  console.log(req.file)
  if (req.session.AdminId == true) {
    storehelpers.addCategory(req.body,req.file.filename, (id) => {
      if (id == "EXIST") {
        req.session.categoryExist = true
        res.redirect("/adminlogin/categories")
      } else {

        




      }
      res.redirect('/adminlogin/categories')
    }
)}   
  else
    res.redirect('/adminlogin')

})

router.delete('/adminlogin/categories/delete-category/:id', (req, res) => {
  let categoryId = req.params.id
  console.log('hai')
  console.log(categoryId)
  storehelpers.deleteCategory(categoryId).then((response) => {
    res.redirect('/adminlogin/categories')
  })
})















router.get('/adminlogin/categories', async(req, res) => {
  res.setHeader('cache-control', 'private,no-cache,no-store,must-revalidate')

  if (req.session.AdminId == true) {
    let exist = false
   let category =  await storehelpers.getAllCategory()

    let brands = await storehelpers.getAllBrands()
   
      

console.log(category)
console.log(brands)
    res.render('admin-categories', { admin:true,category,brands})
    }
  else {
    res.redirect('/')
  }
})


router.post('/addtolist',upload.array('Vimage'), async function (req, res, next) {
  try{
    console.log(req.body)
    console.log(req.files)
storehelpers.addTolist(req.body,req.files).then((response)=>{
 resolve(response)
}

)
res.redirect('/adminlogin')
  }
  catch{
    if(err){
      res.render('error')
    }
  }
})

router.get('/admin/orders', async (req, res) => {
  res.setHeader('cache-control', 'private,no-cache,no-store,must-revalidate')
  if (req.session.AdminId == true) {
    let orders = await storehelpers.getAllTheOrders()
    for (val of orders) {
      val.date = new Date(val.date).toLocaleDateString()
    }    res.render('admin-orders', { admin: true, orders })
  } else {
    res.redirect('/adminlogin')
  }
})

router.post('/admin/orders/change-order-status', (req, res) => {
  storehelpers.changeOrderStatus(req.body).then((response) => {
    res.json(response)
  })
})






router.put('/adminlogin/update', async function (req, res, next) {


  let updatedVar = req.body;
  products.editfunction(updatedVar).then((response) => {


  })
  res.redirect('/adminlogin')
})


router.delete('/adminlogin/delete/:id', async function (req, res, next) {
  let deleteVar = req.params.id;
  console.log(req.params.id)

  products.deletefunction(deleteVar).then((response) => {


  })
  res.redirect('/adminlogin')
})

router.get('/adminlogin/userpanel', async function (req, res, next) {
  let users = await User.find().lean()
  res.render('admin-userpanel', { admin: true, users });
});

router.put('/adminlogin/userpanel/blockid', async function (req, res, next) {


  let updatedVar = req.body;

  if (updatedVar.isblocked == 'on') {



    product.blockfunction(updatedVar).then((response) => {
      console.log(response)

    })
    res.redirect('/adminlogin/userpanel')
  }
  else {
    product.unblockfunction(updatedVar).then((response) => {
      console.log(response)

    })
    res.redirect('/adminlogin/userpanel')
  }

}
)














module.exports = router;