const { Store } = require('../models/store');
const { User } = require('../models/registration');
const { Address } = require('../models/Address');
const { Cart } = require('../models/cart');
const { guestCart } = require('../models/guestCart');
const { Order } = require('../models/order');
const { trusted } = require('mongoose');
const products = require('../helpers/storehelpers');
const Razorpay = require('razorpay')
const { ObjectId } = require('mongodb');
const { response } = require('../app');
var bcrypt = require('bcrypt')
var instance = new Razorpay({
    key_id:'rzp_test_VikxHwvtChrCmN',
    key_secret:'exvC3xqY6wUKY52l0RVRiNbF',
});




module.exports = {
   

    blockfunction: (block) => {




        return new Promise(async (resolve, reject) => {


            let users = await User.updateOne({ _id: ObjectId(block.id) },
                {
                    $set: {
                        Isblocked: true,
                        status: "checked"
                    }
                }
            )
        }).then((response) => {

            resolve(response)
        })

    },

    unblockfunction: (unblock) => {




        return new Promise(async (resolve, reject) => {


            let users = await User.updateOne({ _id: ObjectId(unblock.id) },
                {
                    $set: {
                        Isblocked: false,
                        status: null
                    }
                }
            )
        }).then((response) => {

            resolve(response)
        })

    },
    loginFunction: (userData) => {

        return new Promise(async (resolve, reject) => {
            const user = await User.findOne({ Email: userData.email })

            let response = {}
            if (user) {
                bcrypt.compare(userData.password, user.Password).then((status) => {
                    if (status) {
                        response.user = user
                        response.status = true
                        resolve(response)
                    }
                    else {
                        resolve({ status: false })
                    }
                })

            }
            else {
                resolve({ status: false })
            }

        })

    },
    addToCart: (proId,userId) => {
       
        let proObj = {
            item: ObjectId(proId),
            quantity: 1 
        }
       
        return new Promise(async (resolve, reject) => {
            let [userCart] = await Cart.find({ user: ObjectId(userId) }).lean()
            
            if (userCart) {
                
                let proExist = userCart.products.findIndex(products => products.item == proId)
                console.log(proExist)
                if (proExist != -1) {
                    
                        Cart.updateOne({ user: ObjectId(userId), 'products.item': ObjectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                               
                            }).then(() => {
                                resolve()
                            })
                } else {
                     Cart.updateOne({ user: ObjectId(userId) },
                            {
                                $push: { products: proObj }
                            }
                        ).then((response) => {
                            resolve()
                        })
                }
            } else {
                let cartObj = {
                    user: ObjectId(userId),
                    products: [proObj]
                }

                let cart = new Cart(cartObj)

                await cart.save().then((response) => {
                    resolve()
                } )
          
                
             
                    }
                }
            )
            
       
    },

    addtoCartGuest: (proId,guestId) =>{
       
        let proObj = {
            item: ObjectId(proId),
            quantity: 1 
        }
        return new Promise(async (resolve, reject) => {
            let [userCart] = await guestCart.find({ guest: guestId }).lean()
            
            if (userCart) {
                
                let proExist = userCart.products.findIndex(products => products.item == proId)
                
                if (proExist != -1) {
                    
                    guestCart.updateOne({ guest:guestId, 'products.item': ObjectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                               
                            }).then(() => {
                                resolve()
                            })
                } else {
                    guestCart.updateOne({ guest:guestId },
                            {
                                $push: { products: proObj }
                            }
                        ).then((response) => {
                            resolve()
                        })
                }
            } else {
                let cartObj = {
                    guest:guestId,
                    products: [proObj]
                }

                let cart = new guestCart(cartObj)
                
                await cart.save().then((response) => {
                    console.log('hai',cart)
                    resolve()
                } )
          
                
             
                    }
                }
            )
            
         
    },
      guestCartProceed: (guestId,userId) =>{
        return new Promise(async(resolve,reject)=>{           
            let guestCarts = await guestCart.findOne({guest:guestId}).lean()
            console.log('guestart',guestCarts)
            if(guestCarts){
            let Carts = await Cart.findOne({user:ObjectId(userId)})
            if(Carts){

            for(var i=0;i<guestCarts.products.length;i++){
                let newCart = await Cart.updateOne({user:ObjectId(userId)},{
                    $push:{
                        'products':guestCarts.products[i]
                    }
                })
    
            }}
            // else{
                let newCart = new Cart({
                    user:ObjectId(userId)
                })
                newCart.save()
                
            //     for(var i=0;i<guestCarts.products.length;i++){
            //         let newCart = await Cart.updateOne({user:ObjectId(userId)},{
            //             $push:{
            //                 'products':guestCarts.products[i]
            //             }
            //         })     
            // }
            let deleteGuestCart = await guestCart.deleteOne({guest:guestId})
           
            resolve()
        }
          
            else{
                resolve()
            }
            

        })
      }, 


      
    

    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            
           
            let cartItems = await Cart.aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from:'stores',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, products: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ])
              
            resolve(cartItems)
        })
    },
    getGuestCartProducts: (guestId) => {

        return new Promise(async (resolve, reject) => {
            
           
            let guestCartItems = await guestCart.aggregate([
                {
                    $match: { guest: guestId }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from:'stores',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, products: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ])
              console.log(guestCartItems)
            resolve(guestCartItems)
            
        })
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            
            let total = await Cart.aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from:'stores',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, products: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$products.Maximum_retail_price' }] } }
                    }
                }
            ])
            console.log(total[0].total)
            resolve(total[0].total)
        })
    },

    getGuestTotalAmount: (guestId) => {
        return new Promise(async (resolve, reject) => {
            
            let guestTotal = await guestCart.aggregate([
                {
                    $match: { guest: guestId }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from:'stores',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, products: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$products.Maximum_retail_price' }] } }
                    }
                }
            ])
           
            resolve(guestTotal[0].total)
        })
    },

    getOfferTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await Cart.aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from:'stores',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, products: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$products.Selling_Price' }] } }
                    }
                }
            ])
            
            resolve(total[0].total)
        });

    },

    getGuestOfferTotalAmount: (guestId) => {
       
        return new Promise(async (resolve, reject) => {
            let guestTotal = await guestCart.aggregate([
                {
                    $match: { guest: guestId }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from:'stores',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, products: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$products.Selling_Price' }] } }
                    }
                }
            ])
            
            resolve(guestTotal[0].total)
        });

    },
    findUser: (userNumber) => {
        return new Promise(async (resolve, reject) => {

            let loginStatus = false
            let response = {}
            let user = await User.findOne({ Mobile: userNumber })
            console.log(user)
            if (user) {
                response.user = user
                response.status = true
                resolve(response)
                
            }
            else {
                resolve({ status: false })
            }
        })
    },
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                
                    Cart.updateOne({ _id: ObjectId(details.cart) },
                        {
                            $pull: { products: { item: ObjectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
        Cart.updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }).then((response) => {
                            resolve({ status: true })
                        })
            }

        })
    },
    
    removeCartItem: (details) => {
        return new Promise(async (resolve, reject) => {
            await Cart.updateOne({ _id: ObjectId(details.cart) },
                    {
                        $pull: { products: { item: ObjectId(details.product) } }
                    }
                ).then((response) => {
                    resolve(response)
                })
        })
    },

    changeGuestProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                
                    guestCart.updateOne({ _id: ObjectId(details.cart) },
                        {
                            $pull: { products: { item: ObjectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
        guestCart.updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }).then((response) => {
                            resolve({ status: true })
                        })
            }

        })
    },
    
    removeGuestCartItem: (details) => {
        return new Promise(async (resolve, reject) => {
            await guestCart.updateOne({ _id: ObjectId(details.cart) },
                    {
                        $pull: { products: { item: ObjectId(details.product) } }
                    }
                ).then((response) => {
                    resolve(response)
                })
        })
    },


    
    addAddress: (details,sessionId) => {
        return new Promise((resolve, reject) => {
            details.userId = ObjectId(details.userId)
            let address = new Address({
                userId:sessionId,
                Address:details.address,
                Pincode:details.pincode,
                Mobile:details.mobile
            })
            address.save()
        }).then((response) => {
            resolve(response)
        })
           
      
    },
    getAddress: (sessionId) => {
        return new Promise(async (resolve, reject) => {
            let addresses = await Address.find({ userId: ObjectId(sessionId) }).lean()
            console.log(sessionId)
            console.log("address")
            resolve(addresses)
        })

    },
    getCartProductList: (userId) => {
        try {
            return new Promise(async (resolve, reject) => {
                let cart = await Cart.findOne({ user: ObjectId(userId) })
                resolve(cart.products)
            })
        } catch (error) {
            console.log("Repeatedly Pressing On Checkout");
        }
},
placeOrder: (order, products, total) => {
    return new Promise(async (resolve, reject) => {
        let status = order["payment-method"] === 'COD' || 'PAYPAL' ? 'placed' : 'pending'
        let location = await Address.findOne({ _id: ObjectId(order.addressId) })
       
        let orderObj = {
            deliveryDetails: {
                mobile: location.Mobile,
                address: location.Address,
                pincode: location.Pincode
            },
            userId: ObjectId(order.userId),
            paymentMethod: order["payment-method"],
            products: products,
            totalAmount: total,
            status: status,
            date: new Date()
        }
        let orders= new Order(orderObj)
        orders.save()
        let deleteCart=Cart.deleteOne({ user: ObjectId(order.userId)}).then((response) => {
            console.log("delete cart")

           
            // if (order["payment-method"] == 'COD') {
            //     Cart.deleteOne({ user: ObjectId(order.userId)
            //     })
            //     console.log("deleted") 
            // } else if (["payment-method"] == 'PAYPAL') {
            //     Cart.deleteOne({ user: ObjectId(order.userId) })
            //     console.log("deleted") 
            // }

            resolve(response.insertedId)
        })
    })

},
getAllOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
        let orders = await Order.find({ userId: ObjectId(userId) }).sort({ date: -1 }).lean()
        resolve(orders)
    })
},filtering: (userId,data)=>{
    return new Promise(async(resolve,reject)=>{
        let filter = await Order.find( {
            'userId':{$in: ObjectId(userId)},
            'status': {$in:data}
            }).sort({ date: -1 }).lean()
            resolve(filter)
            
        
    })

},



getAllProductsOfOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
        let orderItems = await Order.aggregate([
            {
                $match: { _id: ObjectId(orderId) }
            },
            {
                $unwind: '$products'
            },
            {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: 'stores',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $project: {
                    item: 1, quantity: 1, products: { $arrayElemAt: ['$product', 0] }
                }
            }

        ])
        console.log('order is' ,orderItems)
        resolve(orderItems)
     
    })
},

cancelOrder: (orderId) => {
    return new Promise((resolve, reject) => {
        Order.updateOne({ _id: ObjectId(orderId) }, {
            $set: {
                status: "cancelled"
            }
        }).then((response) => {
            resolve()
        })
    })
},

generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
        var options = {
            amount: total,
            currency: "INR",
            receipt: "" + orderId
        }
        instance.orders.create(options, function (err, order) {
            resolve(order)
        })

    })
},

 verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'v9cct7Myvlmasmm6W3xDryn1')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },
     changePaymentStatus: (orderId, userId) => {
        return new Promise(async (resolve, reject) => {
            await Cart.deleteOne({ user: ObjectId(userId) })
            await Cart.updateOne({ _id: ObjectId(orderId) },
                {
                    $set: {
                        status: 'placed'
                    }
                }
            ).then(() => {
                resolve()
            })
        })
    },



}
