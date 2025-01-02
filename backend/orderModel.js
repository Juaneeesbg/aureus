const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: String,
    name: String,
    address: String,
    phone: String,
    email: String,
    city: String,
    notes: String,
    paymentMethod: String,
    cart: Array,
    total: Number,
    discountCode: {
        type: String,
        default: '---'
    },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: 'pendiente' },
    tracking: {
        type: String,
        enum: ['confirmado', 'preparando', 'enruta', 'entregado', ''],
        default: ''
    }
});

const Order = mongoose.model('Order', orderSchema, 'admin-orders2');

module.exports = Order;