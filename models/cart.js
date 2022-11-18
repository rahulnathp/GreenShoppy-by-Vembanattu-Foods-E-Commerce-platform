const { number, object } = require('joi');
const Joi = require('joi');
const mongoose = require('mongoose');

const Cart = mongoose.model('Cart', new mongoose.Schema({

    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true,
    },
    products: {
        type:Array
    }
}


));



exports.Cart = Cart;