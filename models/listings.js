const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    name: {
        type: String, // ✅ Removed quotes
        required: true,
    },
    description: {
        type: String, // ✅ Removed quotes
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

});


const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;