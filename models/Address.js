const { number, object } = require('joi');
const Joi = require('joi');
const mongoose = require('mongoose');

const Address = mongoose.model('Address', new mongoose.Schema({
    userId: {
        type:String,
       

    },

    Address: {
        type:String,
       

    },
    Pincode: {
        type:String
    },
    Mobile:{
        type:String
    }
}


));



exports.Address = Address;