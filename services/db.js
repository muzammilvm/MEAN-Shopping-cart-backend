const mongoose = require('mongoose')
mongoose.set('strictQuery', false);
useNewUrlParser: true,

mongoose.connect('mongodb://localhost:27017/Angular-shopping', () => {
    console.log('Database Connected Successfully...')
})

const Admin = mongoose.model('Admin', {
    name: String,
    email:String,
    password:String
})

const Product = mongoose.model('Product',{
    name:String,
    category:String,
    price:Number,
    description:String,
    imageUrl:String
})

const User = mongoose.model('User', {
    name: String,
    email:String,
    password:String
})

const Cart=mongoose.model('Cart',{
    userId:String,
    products:Array
})

const Order=mongoose.model('Order',{
    deliveryDetails:{
        mobile:Number,
        address:String,
        pincode:Number,
        paymentMethod:String,
    },
    userId:String,
    products:Array,
    totalAmount:Number,
    status:String,
    date:Number
})

module.exports={
    Admin,
    Product,
    User,
    Cart,
    Order
}