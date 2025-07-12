const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    name: { type: String, required: true },
    image_url: { type: String },
    price: { type: Number, required: true },
    veg: { type: Boolean },
    category: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ["Processing", "Cooking", "On the Way", "Delivered"],
        default: "Processing",
    },
    cancelled: {
        type: Boolean,
        default: false,
    },
});


const Order = mongoose.model("Order", orderSchema);

module.exports = Order;