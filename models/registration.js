const { date, any } = require('joi');
const Joi = require('joi');
const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
    Full_name: {
        type: String,
        required: true,
        minlength: 1,
  
    },
 
   
    Mobile: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10,
    
    },


    Gender: {
        type: String,
        required: true,
        minlength: 3,
       
    },


 

    Email: {
        type: String,
        required: true,
        minlength: 5,
     
        unique: true
    },
    Password: {
        type: String,
      

    },
    Isblocked: {
        type: Boolean,
        

    },   status: {
        type: String,
        
       

    }
 
}));



exports.User = User;