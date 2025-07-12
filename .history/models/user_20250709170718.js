const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const addressSchema = new Schema({
    street: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: { type: Boolean, default: false }
});

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobileNo: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Listing" }],
    addresses: [addressSchema],
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailToken: String,
    emailTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date


});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);