const { number, object } = require('joi');
const Joi = require('joi');
const mongoose = require('mongoose');

const Category = mongoose.model('Category', new mongoose.Schema({


    categoryName: {
        type:String,
       

    },
    description: {
        type:String
    },
    categoryImage:{
        type:String
    }
}


));



exports.Category = Category;