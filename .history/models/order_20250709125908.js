const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    name: {
        type: String, // ✅ Removed quotes
        required: true,
    },
    image_url: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    veg: {
        type: Boolean, // ✅ Removed quotes
    },
    category: {
        type: String, // ✅ Removed quotes
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    date: {
        type: Date,
        default: Date.now
    },

});


const Order = mongoose.model("Order", orderSchema);

module.exports = Order;