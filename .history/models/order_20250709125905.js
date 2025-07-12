const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodItem",
    }, ],
    totalAmount: Number,
    paymentId: String,
    address: String,
    mobileNo: String,
    status: {
        type: String,
        enum: ["Placed", "Preparing", "Out for Delivery", "Delivered"],
        default: "Placed",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Order", orderSchema);