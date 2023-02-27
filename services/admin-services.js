const db = require('./db')
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId


const signup = (name, email, password) => {
    console.log('signup api');
    return db.Admin.countDocuments({}).then((result) => {
        console.log(result);
        if (result != 1) {
            const newAdmin = new db.Admin({
                name,
                email,
                password
            })
            newAdmin.save()
            return {
                statusCode: 200,
                message: 'Registration Successfull'
            }
        } else {
            return {
                statusCode: 403,
                message: 'Admin Already exist'
            }
        }
    })
}

const login = (email, password) => {
    console.log('login function')
    return db.Admin.findOne({
        email,
        password
    }).then((result) => {
        console.log(result);
        if (result) {
            console.log(result);
            // generating token
            const token = jwt.sign({
                email: email
            }, 'secretkey0000')
            return {
                statusCode: 200,
                message: 'login Successfull',
                name: result.name,
                email: result.email,
                id: result._id,
                token: token
            }
        } else {
            return {
                statusCode: 403,
                message: 'Invalid Account or password'
            }
        }
    })
}

const addProduct = (name, category, price, description,imageUrl) => {
    return db.Product.insertMany({
        name,
        category,
        price,
        description,
        imageUrl
    }).then((result) => {
        if (result) {
            return {
                statusCode: 200,
                message: 'Product Added Successfully',
                id: result[0]._id
            }
        } else {
            return {
                statusCode: 403,
                message: 'Product not added'
            }
        }
    })
}

const viewProducts = () => {
    return db.Product.find().then((result) => {
        console.log(result);
        console.log('----------');
        if (result) {
            return {
                statusCode: 200,
                message: 'Products Viewing',
                products: result
            }
        } else {
            return {
                statusCode: 403,
                message: 'Product not added'
            }
        }
    })
}

const editProductDetails = (productId) => {
    return db.Product.findOne({ _id: ObjectId(productId) }).then((result) => {
        console.log(result);
        if (result) {
            return {
                statusCode: 200,
                message: 'Product Viewing',
                product: result
            }
        } else {
            return {
                statusCode: 403,
                message: 'Product not viewed'
            }
        }
    })
}

const editProduct = (productId, products) => {
    return db.Product.updateOne({ _id: ObjectId(productId) }, {
        $set: {
            name: products.name,
            description: products.description,
            price: products.price,
            category: products.category,
            imageUrl:products.imageUrl
        }
    }).then((result) => {
        if (result) {
            return {
                statusCode: 200,
                message: 'Product Edited Successfully',
            }
        } else {
            return {
                statusCode: 403,
                message: 'Please Enter Valid Product Details'
            }
        }
    })
}


const deleteProduct = (productId) => {
    return db.Product.deleteOne({
        _id: ObjectId(productId)
    }).then((result) => {
        if (result) {
            return {
                statusCode: 200,
                message: 'Product deleted Successfully',
            }
        } else {
            return {
                statusCode: 403,
                message: 'Something went wrong'
            }
        }
    })
}

const getUserOrders = () => {
    return db.Order.aggregate([
        {
            $unwind: '$products'
        },
        {
            $project: {
                item: '$products.item',
                quantity: '$products.quantity',
                userDetails: '$deliveryDetails',
                total: '$totalAmount',
                date: '$date',
                status: '$status',
                orderId: '$_id'
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'item',
                foreignField: '_id',
                as: 'products'
            }
        },
        {
            $project: {
                orderId: 1, status: 1, total: 1, date: 1, userDetails: 1, item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
            }
        }
    ]).then((result) => {
        if (result) {
            return {
                statusCode: 200,
                message: 'user orders fetched',
                orders: result
            }
        } else {
            return {
                statusCode: 404,
                message: 'no any orders from users'
            }
        }
    })

}

const shipOrder=(orderId)=>{
   return db.Order
    .updateOne({ _id: ObjectId(orderId) },
      {
        $set: {
          status: 'shipped'
        }
      }
    ).then((result)=>{
        if(result){
            return{
                statusCode:200,
                message:'status updated successfully'
            }
        }else{
            return{
                statusCode:404,
                message:'order not found'
            }
        }
    })
}

const getUserDetails=()=>{
    return db.User.find().then((result)=>{
        if(result){
            return{
                statusCode:200,
                message:'fetched all users',
                users:result
            }
        }else{
            return{
                statusCode:404,
                message:'no users found'
            } 
        }
    })
}

module.exports = {
    signup,
    login,
    addProduct,
    jwt,
    viewProducts,
    editProductDetails,
    editProduct,
    deleteProduct,
    getUserOrders,
    shipOrder,
    getUserDetails
}