const Joi = require('joi');
const mongoose = require('mongoose');

const Store = mongoose.model('Store', new mongoose.Schema({
    Brand_name: {
        type: String,
        
    },
    Product_id : {
        type: String,
        
    },
 
    Maximum_retail_price: {
        type: Number,
       
    },
    Selling_Price: {
    type: Number,
       
    },
    Product_title: {
        type: String,
           
        },
    Product_description: {
            type: String,
               
            },
    Expiry: {
            type: String,
                   
                },
    Category: {
            type: String,
                           
                },
    Quantity: {
            type: String,
                       
                    },
    Front_image: {
            type: String,
                                   
            },
    Back_image: {
            type: String,
                                       
                },
    Nutrients_image: {
            type: String,
                                           
                    },
    Fssai_image: {
             type: String,
                                               
                    },
   
    

}));



exports.Store = Store;