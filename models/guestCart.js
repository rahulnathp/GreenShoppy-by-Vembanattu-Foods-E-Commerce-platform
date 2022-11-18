const { number, object } = require('joi');
const Joi = require('joi');
const mongoose = require('mongoose');

const guestCart = mongoose.model('guestCart', new mongoose.Schema({

    guest: {
        type:String,
        
    },
    products: {
        type:Array
    }
}


));



exports.guestCart = guestCart;