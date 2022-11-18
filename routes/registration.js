var express = require('express');
const { registerHelper } = require('hbs');
var router = express.Router();
const { User } = require('../models/registration');
var bcrypt = require('bcrypt');
const { Cart } = require('../models/cart');



router.post('/', async (req, res) => {

    let emailduplicate = await User.findOne({ Email: req.body.email })
    let mobduplicate = await User.findOne({ Mobile: req.body.mobile })
    if (emailduplicate || mobduplicate) {
        req.session.registerStatus = "This user is already registered"
        res.render('index',{index:true,"registerStatus":req.session.registerStatus})

    }
    else {

        req.body.password = await bcrypt.hash(req.body.password,10)
            let user = new User({
                Full_name: req.body.fullname,
                Mobile: req.body.mobile,
                Gender: req.body.gender,
                Email: req.body.email,
                Password:req.body.password ,
                Isblocked:false

            })
            await user.save();
            

            req.session.RegErr = "Successfully Registered"
            res.render('index',{index:true,"RegErr":req.session.RegErr})

          

           
        }

    }



);





router.get('/', function (req, res, next) {
    res.render('registration', { index: true });
});


module.exports = router;