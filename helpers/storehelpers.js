

const { Store } = require('../models/store');
const { trusted } = require('mongoose');
const products = require('../helpers/storehelpers');
const { ObjectId } = require('mongodb');
const { response } = require('../app');
const { Category } = require('../models/category');
const { Brand } = require('../models/brand');
const { Order } = require('../models/order');
const { User } = require('../models/registration');


module.exports= {
    addTolist: (details,Images) =>{
        let images = Images.map(f =>({ url:f.path,filename:f.filename}))

        return new Promise( async(resolve,reject) => {
            let stores = new Store({
                    Brand_name:details.brandname,
                    Product_id: details.productid,
                    Maximum_retail_price: details.maximumretailprice,
                    Selling_Price: details.sellingprice,
                    Product_title: details.producttitle,
                    Product_description: details.productdescription,
                    Expiry: details.expiry,
                    Category: details.category,
                    Quantity: details.quantity,
                    Front_image: images[0].filename,
                    Back_image: images[1].filename,
                    Nutrients_image: images[2].filename,
                    Fssai_image: images[3].filename
                }
             
            )
            await stores.save()
            }).then((response)=>{
            
            resolve(response)
        })
    },
    

    
    addProduct: (product, callback) => {
        // product.offPrice = parseInt(product.price, 10)
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            callback(data.insertedId)
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await Store.find()
            resolve(products)
        })
    },
    addBrand: async (details,image, callback) => {
        let bExist = await Brand.findOne({ brandName: details.brandName })
        console.log(bExist)
        if (bExist) {
            let catErr = "EXIST"
            callback(catErr)
        } else {
            
            details.offer = 0
            let brand = new Brand({
                    brandName:details.brandName,
                    description :details.description,
                    brandImage:image
                    

            })
            
            await brand.save().then((data) => {
                
                callback(data._id)
            })
        }

    },

     addCategory: async (categori,image, callback) => {
        let catExist = await Category.findOne({ categoryName: categori.categoryName })
        console.log(catExist)
        if (catExist) {
            let catErr = "EXIST"
            callback(catErr)
        } else {
            
            categori.offer = 0
            let category = new Category({
                    categoryName:categori.categoryName,
                    description :categori.description,
                    categoryImage:image
                    

            })
            
            await category.save().then((data) => {
                
                callback(data._id)
            })
        }

    },
    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await Category.find().lean()
            resolve(category)
        })
    },
    getAllBrands: () => {
        return new Promise(async (resolve, reject) => {
            let brands = await Brand.find().lean()
            resolve(brands  )
        })
    },
      deleteCategory: (categoryId) => {
        return new Promise((resolve, reject) => {
            Category.deleteOne({ _id: ObjectId(categoryId) }).then((response) => {
                resolve(response)
            })
        })
    },
    deleteBrand: (brandId) => {
        return new Promise((resolve, reject) => {
            Brand.deleteOne({ _id: ObjectId(brandId) }).then((response) => {
                resolve(response)
            })
        })
    },
    
editfunction:(details) => {
    console.log(details)
    return new Promise( async(resolve,reject) => {
        let stores = await Store.updateOne({_id:ObjectId(details._id)},
        {
            $set:{
                Brand_name:details.brandname,
                Product_id: details.productid,
                Maximum_retail_price: details.maximumretailprice,
                Selling_Price: details.sellingprice,
                Product_title: details.producttitle,
                Product_description: details.productdescription,
                Expiry: details.expiry,
                Category: details.category,
                Quantity: details.quantity,
                Front_image: details.frontimage,
                Back_image: details.backimage,
                More_image1: details.moreimage1,
                More_image2: details.moreimage2
            }
        } 
        )
    }).then((response)=>{
        
        resolve(response)
    })
},



    deletefunction:(details) => {
        console.log(details)
        let { brand_name,product_id,maximum_retail_price,selling_price,product_title,
        product_description,expiry,category,quantity,front_image,back_image,more_image1
     ,more_image2 } = details
    
        return new Promise( async(resolve,reject) => {
            let stores = await Store.deleteOne({_id:ObjectId(details)},
          
            )
        }).then((response)=>{
            console.log(response)
            resolve(response)
        })
    },

    getAllTheOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await Order.find().sort({date:-1}).lean()
            resolve(orders)
        })

    },

    getAllDelieveredOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await Order.find({status:delivered}).lean()
            resolve(orders)
        })

    },

    changeOrderStatus: (details) => {
        return new Promise((resolve, reject) => {
            Order.updateOne({ _id: ObjectId(details.order) }, {
                $set: {
                    status: details.status
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    getUsersCount: () => {
        return new Promise(async (resolve, reject) => {
            let usersCount = await User.count()
            resolve(usersCount)
        })
    },

    getProductsCount: () => {
        return new Promise(async (resolve, reject) => {
            let productsCount = await Store.count()
            resolve(productsCount)
        })
    },

    getOrdersCount: () => {
        return new Promise(async (resolve, reject) => {
            let ordersCount = await Order.find({ status: { $ne: "cancelled" } }).count()
            resolve(ordersCount)
        })
    },

    getTotalAmountOrders: () => {
        return new Promise(async (resolve, reject) => {
            let total = await Order.aggregate([
                {
                    $match: { status: 'delivered' }
                },
                {
                    $project: {
                        _id: 0,
                        total: '$totalAmount'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' }
                    }
                }
            ])
            resolve(total[0].total)
        })
    },
    getWeeks: () => {
        return new Promise(async (resolve, reject) => {
            let weeks = await Order.aggregate([
                {
                    $match: {
                        date: {
                            $gte: new Date(new Date() - 7 * 7 * 60 * 60 * 24 * 1000)
                        },
                    }
                },
                {
                    $project: {
                        date: '$date',
                        week: { $week: "$date" },
                    },
                },
                {
                    $group: {
                        _id: "$week",
                        count: { $sum: 1 },
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },

            ])
            resolve(weeks)
        })
    },

    getMonths: () => {
        return new Promise(async (resolve, reject) => {
            let month = await Order.aggregate([
                {
                    $match: {
                        date: {
                            $gte: new Date(new Date().getMonth() - 10)
                        },
                    }
                },
                {
                    $project: {
                        date: '$date',
                        month: { $month: "$date" },
                    },
                },
                {
                    $group: {
                        _id: "$month",
                        count: { $sum: 1 },
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },

            ])
            resolve(month)
        })
    },

    getYears: () => {
        return new Promise(async (resolve, reject) => {
            let year = await Order.aggregate([
                {
                    $match: {
                        date: {
                            $gte: new Date(new Date().getYear() - 10)
                        },
                    }
                },
                {
                    $project: {
                        date: '$date',
                        year: { $year: "$date" },
                    },
                },
                {
                    $group: {
                        _id: "$year",
                        count: { $sum: 1 },
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },

            ])
            resolve(year)
        })
    }



 
}