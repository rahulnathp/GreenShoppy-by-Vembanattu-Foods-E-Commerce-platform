const { number, object } = require('joi');
const Joi = require('joi');
const mongoose = require('mongoose');

const Brand = mongoose.model('Brand', new mongoose.Schema({


    brandName: {
        type:String,
       

    },
    description: {
        type:String
    },
    brandImage:{
        type:String
    }
}


));



exports.Brand = Brand;