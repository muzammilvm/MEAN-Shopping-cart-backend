const db = require('./db')
const jwt = require('jsonwebtoken')
const ObjectId = require('mongodb').ObjectId


const signup = (name, email, password) => {
    console.log('user signup api');
    return db.User.findOne({
        email
    }).then((result) => {
        console.log(result);
        if (result) {
            return {
                statusCode: 403,
                message: 'User Already exist'
            }
        } else {
            const newUser = new db.User({
                name,
                email,
                password
            })
            newUser.save()
            return {
                statusCode: 200,
                message: 'Registration Successfull'
            }
        }
    })
}

const login = (email, password) => {
    console.log('login function')
    return db.User.findOne({
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

const addtocart = (productId, userId) => {
    let productObj = {
        item: ObjectId(productId),
        quantity: 1
    }

    return db.Cart.findOne({ userId: userId }).then((result) => {
        if (result) {
            let productExist = result.products.findIndex(product => product.item == productId)
            console.log(productExist);
            if (productExist != -1) {
                return db.Cart.updateOne({ userId: userId, 'products.item': ObjectId(productId) },
                    {
                        $inc: { 'products.$.quantity': 1 }
                    }
                ).then((result) => {
                    if (result) {
                        return {
                            statusCode: 200,
                            message: 'quantity incremented'
                        }
                    }
                })
            } else {
                return db.Cart.updateOne({ userId: userId },
                    {
                        $push: { products: productObj }
                    }
                ).then((result) => {
                    if (result) {
                        return {
                            statusCode: 200,
                            message: 'product added to existing cart'
                        }
                    }
                })
            }
        } else {
            let cartobj = {
                userId: userId,
                products: [productObj]
            }
            return db.Cart.insertMany(cartobj).then((result) => {
                if (result) {
                    return {
                        statusCode: 200,
                        message: 'new cart collection added to the user and product added to the cart'
                    }
                }
            })
        }
    })
}


const viewCart = (userId) => {
    console.log('inside viewcart');
    return db.Cart.aggregate([
        {
            $match: ({ userId: userId })
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
                from: 'products',
                localField: 'item',
                foreignField: '_id',
                as: 'products'
            }
        },
        {
            $project: {
                item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
            }
        }
    ]).then((result) => {
        if (result) {
            return {
                statusCode: 200,
                message: 'showing products from cart',
                products: result
            }
        } else {
            return {
                statusCode: 401,
                message: 'no products in cart'
            }
        }
    })

}


const gettotalamount = (userId) => {

    return db.Cart.aggregate([
        {
            $match: ({ userId: userId })
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
                from: 'products',
                localField: 'item',
                foreignField: '_id',
                as: 'products'
            }
        },
        {
            $project: {
                item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.price' }] } }
            }
        }

    ]).then((result) => {
        if (result[0]) {
            return {
                statusCode: 200,
                message: 'fetched total amount',
                total: result[0].total
            }
        } else {
            return {
                statusCode: 401,
                message: 'no products to display total amount'
            }
        }
    })
}

const cartCount = (userId) => {

    let count = 0
    return db.Cart.findOne({ userId: userId }).then((result) => {
        if (result) {
            console.log(result);
            count = result.products.length
            return {
                statusCode: 200,
                message: 'showing cart count',
                cartcount: count
            }
        } else {
            return {
                statusCode: 200,
                message: 'no products in cart'
            }
        }

    })

}

const removeCartProduct = (cartId, productId) => {
    return db.Cart.updateOne({ _id: ObjectId(cartId) },
        {
            $pull: { products: { item: ObjectId(productId) } }
        }).then((result) => {
            if (result) {
                return {
                    statusCode: 200,
                    message: "product removed successfully"
                }
            } else {
                return {
                    statusCode: 401,
                    message: 'product not available to remove'
                }
            }
        })

}

const changeProductQuantity = (details) => {
    if (details.count == -1 && details.quantity == 1) {
        return db.Cart.updateOne({ _id: ObjectId(details.cartId) },
            {
                $pull: { products: { item: ObjectId(details.productId) } }
            }).then((result) => {
                if (result) {
                    return {
                        statusCode: 200,
                        message: 'item removed from cart',
                    }
                } else {
                    return {
                        statusCode: 404,
                        message: 'no product to change quantity and to remove'
                    }
                }
            })
    } else {
        return db.Cart.updateOne({ _id: ObjectId(details.cartId), 'products.item': ObjectId(details.productId) },
            {
                $inc: { 'products.$.quantity': details.count }
            }).then((result) => {
                if (result) {
                    console.log(result);
                    return {
                        statusCode: 200,
                        message: 'quantity incremented or decremented successfully'
                    }
                } else {
                    return {
                        statusCode: 404,
                        message: 'no products to increment or decrement the quantity'
                    }
                }
            })
    }
}

const getCartProduct = (userId) => {
    console.log(userId);
    return db.Cart.findOne({ userId: ObjectId(userId) }).then((result) => {
        if (result) {
            return {
                statusCode: 200,
                message: 'fetched product from cart',
                product: result.products
            }
        } else {
            return {
                statusCode: 404,
                message: 'no product to fetch'
            }
        }
    })
}

const placeOrder = (orderDetails, products) => {
    let status = orderDetails.details.payment === 'COD' ? 'placed' : 'pending'
    let orderObject = {
        deliveryDetails: {
            mobile: orderDetails.details.mobile,
            address: orderDetails.details.address,
            pincode: orderDetails.details.pincode,
            paymentMethod: orderDetails.details.payment
        },

        userId: ObjectId(orderDetails.userId),
        products: products,
        totalAmount: orderDetails.total,
        status: status,
        date: new Date()
    }
   
    return db.Order.insertMany(orderObject).then((result) => {
        if (result) {
            let orderId = result[0]._id
            console.log(orderId);
            return db.Cart.deleteOne({ userId: ObjectId(orderDetails.userId) }).then((result) => {
                if (result) {
                    return {
                        statusCode: 200,
                        message: 'order completed and removed items from cart',
                        orderId: orderId
                    }
                } else {
                    return {
                        statusCode: 404,
                        message: 'products not found to delete from cart'
                    }
                }
            })
        } else {
            return {
                statusCode: 404,
                message: 'no products in cart to place order'
            }
        }
    })
}

const getOrders = (userId) => {
    return db.Order.find({ userId: ObjectId(userId) }).then((result) => {
        if (result) {
            return {
                statusCode: 200,
                message: 'ordered product details fetched',
                orders: result
            }
        } else {
            return {
                statusCode: 404,
                message: 'no orders to fetch',
            }
        }
    })

}

const getOrderProducts = (orderId) => {
    return db.Order.aggregate([
        {
            $match: ({ _id: ObjectId(orderId) })
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
                from: 'products',
                localField: 'item',
                foreignField: '_id',
                as: 'products'
            }
        },
        {
            $project: {
                item: 1, quantity: 1, product: { $arrayElemAt: ['$products', 0] }
            }
        }
    ]).then((result) => {
        if (result) {
            return {
                statusCode: 200,
                message: 'ordered products fetched',
                orderItems: result
            }
        } else {
            return {
                statusCode: 404,
                message: 'no orderd products'
            }
        }
    })
}

const getDeliverDetails=(orderId)=>{
    return db.Order.find({ _id: ObjectId(orderId) }).then((result) => {
        if (result) {
            console.log(result);
            return {
                statusCode: 200,
                message: 'ordered product details fetched',
                deliveryDetails: result
            }
        } else {
            return {
                statusCode: 404,
                message: 'no orders to fetch',
            }
        }
    })
}

module.exports = {
    signup,
    login,
    addtocart,
    viewCart,
    gettotalamount,
    cartCount,
    removeCartProduct,
    changeProductQuantity,
    getCartProduct,
    placeOrder,
    getOrders,
    getOrderProducts,
    getDeliverDetails
}
