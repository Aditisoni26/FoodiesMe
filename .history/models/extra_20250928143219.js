const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const listingSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image_url: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    veg: {
        type: Boolean,
    },
    category: {
        type: String,
    },
    reviews: [reviewSchema], // Add reviews array
    averageRating: {
        type: Number,
        default: 0,
    },
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;