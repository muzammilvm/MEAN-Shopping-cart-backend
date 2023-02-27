const express = require('express')
const cors = require('cors')
const adminService = require('./services/admin-services')
const userService = require('./services/user-services')
// const hello = require('../shopping-cart/src/assets/images')
const fileUpload = require('express-fileupload')


const jwt = adminService.jwt




const server = express()


server.use(cors({
    origin: 'http://localhost:4200'
}))

server.use(express.json())

server.listen(3000, () => {
    console.log('Server Started at 3000');
})


// admin token verify middleware
const jwtMiddleware = (req, res, next) => {
    console.log('router specific middleware')
    // get token from headers
    const token = req.headers['acces-token']
    try {
        // verify token
        const data = jwt.verify(token, 'secretkey0000')
        console.log(data);
        console.log('Valid token');
        next()
    }
    catch {
        console.log('Invalid token');
        res.status(401).json({
            message: 'Please Login'
        })
    }

}



server.get("/", (req, res) => {
    res.send('hello')
    console.log('hello');
})


server.post('/admin-signup', (req, res) => {
    console.log(req.body);
    adminService.signup(req.body.name, req.body.email, req.body.password).then((result) => {
        console.log(result);
        res.status(result.statusCode).json(result)
    })
})

server.post('/admin-login', (req, res) => {
    console.log('Login Api');
    console.log(req.body);
    adminService.login(req.body.email, req.body.password).then((result) => {
        res.status(result.statusCode).json(result)
    })
})

server.post('/add-product', jwtMiddleware, (req, res) => {
    adminService.addProduct(req.body.name, req.body.category, req.body.price, req.body.description, req.body.imageUrl).then((result) => {
        console.log(result);
        res.status(result.statusCode).json(result)
    })
})

server.get('/admin-viewProducts', (req, res) => {
    adminService.viewProducts().then((result) => {
        console.log('success');
        console.log(result);
        res.status(result.statusCode).json(result)
    })
})

server.get('/view-product-to-edit/:productId', jwtMiddleware, (req, res) => {
    console.log(req.params.productId);
    adminService.editProductDetails(req.params.productId).then((result) => {
        console.log(result);
        res.status(result.statusCode).json(result)
    })
})

server.post('/edit-product', jwtMiddleware, (req, res) => {
    let productId = req.body.productId
    let products = req.body
    adminService.editProduct(productId, products).then((result) => {
        res.status(result.statusCode).json(result)
    })
})

server.delete('/delete-product/:productId', jwtMiddleware, (req, res) => {
    console.log(req.params.productId);
    adminService.deleteProduct(req.params.productId).then((result) => {
        res.status(result.statusCode).json(result)
    })
})

server.get('/get-user-orders', jwtMiddleware, (req, res) => {
    adminService.getUserOrders().then((result) => {
        console.log(result);
        res.status(result.statusCode).json(result)
    })
})

server.get('/ship-orders/:orderId', jwtMiddleware, (req, res) => {
    adminService.shipOrder(req.params.orderId).then((result) => {
        console.log('status');
        res.status(result.statusCode).json(result)
    })
})

server.get('/get-user-details', jwtMiddleware, (req, res) => {
    adminService.getUserDetails().then((result) => {
        res.status(result.statusCode).json(result)
    })
})


server.post('/test', (req, res) => {
    console.log(req.body);
})


// ----------------------------------------------------------------------------------------

// Users

server.post('/user-signup', (req, res) => {
    userService.signup(req.body.name, req.body.email, req.body.password).then((result) => {
        console.log(result);
        res.status(result.statusCode).json(result)
    })
})

server.post('/user-login', (req, res) => {
    console.log('Login Api');
    console.log(req.body);
    userService.login(req.body.email, req.body.password).then((result) => {
        res.status(result.statusCode).json(result)
    })
})

server.post('/add-to-cart', (req, res) => {
    console.log(req.body);
    userService.addtocart(req.body.productId, req.body.userId).then((result) => {
        if (result) {
            console.log(result);
            res.status(result.statusCode).json(result)
        }
    })
})


// for ajax 
// server.get('/add-to-cart/:userId/:productId',  (req, res) => {
//     console.log(req.params);
//     userService.addtocart(req.params.productId, req.params.userId).then((result) => {
//         if (result) {
//             console.log(result);
//             res.status(result.statusCode).json(result)
//         }
//     })
// })

server.get('/view-cart/:userId', jwtMiddleware, (req, res) => {
    console.log('---' + req.params.userId);
    userService.viewCart(req.params.userId).then((result) => {
        console.log(result);
        res.status(result.statusCode).json(result)
    })
})

server.get('/cart-count/:userId', jwtMiddleware, (req, res) => {
    userService.cartCount(req.params.userId).then((result) => {
        console.log(result);
        res.status(result.statusCode).json(result)
    })
})

server.post('/remove-cartProduct', jwtMiddleware, (req, res) => {
    console.log(req.body);
    userService.removeCartProduct(req.body.cartId, req.body.productId).then((result) => {
        if (result) {
            console.log(result);
            res.status(result.statusCode).json(result)
        }
    })
})

server.get('/view-totalAmount/:userId', jwtMiddleware, (req, res) => {
    userService.gettotalamount(req.params.userId).then((result) => {
        console.log(result);
        res.status(result.statusCode).json(result)
    })
})

server.post('/change-quantity', (req, res) => {
    console.log(req.body);
    userService.changeProductQuantity(req.body).then((result) => {
        res.status(result.statusCode).json(result)
    })
})

server.post('/place-order', jwtMiddleware, async (req, res) => {
    let products = ''
    console.log(req.body);
    await userService.getCartProduct(req.body.userId).then((data) => {
        products = data.product
        res.status(data.statusCode)
    })
    if (products) {
        await userService.placeOrder(req.body, products).then((result) => {
            console.log('-----');
            console.log(result);
            console.log('-----');

            res.status(result.statusCode).json(result)
        })
    }
})

server.get('/get-orders/:userId', jwtMiddleware, (req, res) => {
    userService.getOrders(req.params.userId).then((result) => {
        console.log(result);
        res.status(result.statusCode).json(result)
    })

})

server.get('/get-order-products/:orderId', jwtMiddleware, (req, res) => {
    console.log(req.params.orderId);
    userService.getOrderProducts(req.params.orderId).then((result) => {
        console.log(result);
        res.status(result.statusCode).json(result)
    })
})

server.get('/get-delivery-details/:orderId', jwtMiddleware, (req, res) => {
    userService.getDeliverDetails(req.params.orderId).then((result) => {
        console.log(result);
        res.status(result.statusCode).json(result)
    })
})



