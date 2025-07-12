// createAdmin.js
const mongoose = require("mongoose");
const User = require("./models/user");
const dotenv = require("dotenv");

dotenv.config();

const dbURL = process.env.ATLASDB_URL; // or use your Mongo URI

mongoose.connect(dbURL)
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

async function createAdmin() {
    try {
        const admin = new User({
            username: "admin", // your admin username
            email: "admin@foodieme.com",
            address: "Admin HQ",
            mobileNo: "9999999999",
            role: "admin",
        });

        const registeredAdmin = await User.register(admin, "admin123"); // set admin password
        console.log("✅ Admin created successfully:", registeredAdmin);
        mongoose.disconnect();
    } catch (err) {
        console.log("❌ Error creating admin:", err.message);
        mongoose.disconnect();
    }
}

createAdmin();