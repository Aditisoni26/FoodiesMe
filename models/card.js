const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cardSchema = new Schema({
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

});


const Card = mongoose.model("Card", cardSchema);

module.exports = Card;