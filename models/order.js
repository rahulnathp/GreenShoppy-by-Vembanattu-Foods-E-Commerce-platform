const { number, object } = require('joi');
const Joi = require('joi');
const mongoose = require('mongoose');

const Order = mongoose.model('Order', new mongoose.Schema({

    deliveryDetails: {
       type:Object
    },
    userId: {
        type:String
    },
    paymentMethod: {
        type:String
    },
    products: {
        type:Object
    },
    totalAmount: {
        type:Number
    },
    status: {
        type:String
    },
    date: {
        type:Date
    },


}


));



exports.Order = Order;