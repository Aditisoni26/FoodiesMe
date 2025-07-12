if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const { runInNewContext } = require("vm");
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressErrors.js");
const MongoStore = require('connect-mongo');
const Card = require("./models/card.js");
const Order = require("./models/order.js");
const compression = require("compression");
const razorpay = require("./razorpayInstance");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const crypto = require("crypto");
const transporter = require("./utils/mailer");
const bcrypt = require("bcrypt"); // make sure it's installed


app.use(express.json());
app.use(compression());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});
store.on("error", () => {
    console.log("Error in  MONGO SESSION  STORE", err);
});
const sessionOptions = {
    store,
    secret: process.env.SECRET || "fallbackSecret", // add fallback to avoid undefined
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};


app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// app.js or your main server file
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.user = req.user;
    next();
});

const dburl = process.env.ATLASDB_URL;
main()
    .then(() => {
        console.log("connected to db");
    }).catch((err) => {
        console.log(err);
    });
async function main() {
    await mongoose.connect(dburl);
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.returnTo = req.originalUrl; // Save the URL they were trying to access
    req.flash("error", "You must be logged in first!");
    return res.redirect("/login");
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === "admin") {
        return next();
    }
    req.flash("error", "You are not authorized to access this page.");
    res.redirect("/");
}


app.get("/", async(req, res) => {
    const { category } = req.query;
    let allListing;
    if (category) {
        allListing = await Listing.find({ category: category });
    } else {
        allListing = await Listing.find({});
    }
    res.render("listings/index.ejs", { allListing });
});

app.get("/show/:id", async(req, res) => {
    const { id } = req.params;
    let item = await Listing.findById(id);
    res.render("listings/show.ejs", { item });
});
app.get("/login", (req, res) => {
    res.render("user/login.ejs");
});
app.get("/signup", (req, res) => {
    res.render("user/signup.ejs");
});
app.post("/signup", async(req, res) => {
    const { username, email, password } = req.body;
    const token = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
        username,
        email,
        password,
        emailToken: token,
        emailTokenExpires: Date.now() + 3600000, // 1 hour
    });

    await newUser.save();

    const verificationLink = `http://localhost:8080/verify-email?token=${token}&email=${email}`;

    await transporter.sendMail({
        to: email,
        subject: "Verify your email - FoodieMe",
        html: `<h3>Hello ${username},</h3>
           <p>Please click the link below to verify your email:</p>
           <a href="${verificationLink}">Verify Email</a>`
    });

    res.send("Verification email sent. Please check your inbox.");
});
app.post("/login", passport.authenticate('local', { failureRedirect: '/login', failureFlash: true, }),
    async(req, res) => {
        try {
            req.flash("success", "welcome to FoodieMe");
            res.redirect("/");
        } catch (err) {
            req.flash("error", err.message);
            res.redirect("/login");
        }

    });
app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
});
app.get("/:id/buynow", isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const orderedItem = await Listing.findById(id);
    const user = await User.findById(req.user._id); // Get full user with addresses

    let defaultAddress = null;

    if (user.addresses && user.addresses.length > 0) {
        defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
    }



    res.render("orders/buynow.ejs", { orderedItem, user, defaultAddress });
});


app.post("/show/:id/order", isLoggedIn, async(req, res) => {
    if (req.user.role === "admin") {
        req.flash("error", "Admin cannot place orders.");
        return res.redirect("/");
    }

    const { id } = req.params;
    const { scheduledAt } = req.body;

    if (!scheduledAt || new Date(scheduledAt) < new Date()) {
        req.flash("error", "Please select a future delivery time.");
        return res.redirect("back");
    }

    const orderedItem = await Listing.findById(id);

    const newOrderItem = new Order({
        name: orderedItem.name,
        image_url: orderedItem.image_url,
        price: orderedItem.price,
        veg: orderedItem.veg,
        category: orderedItem.category,
        user: req.user ? req.user._id : null,
        scheduledAt: new Date(scheduledAt), // Save schedule
    });

    await newOrderItem.save();
    req.flash("success", "Order placed and scheduled successfully!");
    res.redirect("/order");
});



app.post("/show/:id/Add-to-card", isLoggedIn, async(req, res) => {

    if (req.user.role === "admin") {
        req.flash("error", "Admin cannot add items to cart.");
        return res.redirect("/");
    }
    const { id } = req.params;
    const item = await Listing.findById(id);
    // Check if this item is already in the cart for this user
    const alreadyInCart = await Card.findOne({
        name: item.name,
        user: req.user._id
    });

    if (alreadyInCart) {
        req.flash("error", "Item already in cart!");
        return res.redirect("/card");
    }

    const newCard = new Card({
        name: item.name,
        image_url: item.image_url,
        price: item.price,
        veg: item.veg,
        category: item.category,
        user: req.user._id,
    });

    await newCard.save();
    req.flash("success", "Item added to cart!");
    res.redirect("/card");
});

app.get("/card", isLoggedIn, async(req, res) => {
    const items = await Card.find({ user: req.user._id });

    const totalItems = items.length;

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const discount = totalPrice * 0.10; // 10% discount
    const afterDiscount = totalPrice - discount;
    const gst = afterDiscount * 0.18; // 18% GST
    const finalAmount = Math.round(afterDiscount + gst); // total rounded

    res.render("orders/card.ejs", {
        items,
        totalItems,
        totalPrice,
        discount,
        gst,
        finalAmount
    });
});

app.delete("/card/:id/delete", isLoggedIn, async(req, res) => {
    const { id } = req.params;
    await Card.findByIdAndDelete(id);
    res.redirect("/card");
});
app.get("/order", isLoggedIn, async(req, res) => {
    const items = await Order.find({ user: req.user._id });

    res.render("orders/order.ejs", { items });
});
app.get("/search", async(req, res) => {
    const { q } = req.query;
    let allListing;

    if (q) {
        const regex = new RegExp(q, 'i');
        allListing = await Listing.find({ name: regex });
    } else {
        allListing = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListing });
});
app.post("/card/order-all", isLoggedIn, async(req, res) => {
    if (req.user.role === "admin") {
        req.flash("error", "Admin cannot place orders.");
        return res.redirect("/");
    }

    try {
        // Fetch all items in the cart
        const itemsInCart = await Card.find({ user: req.user._id });


        if (itemsInCart.length === 0) {
            req.flash("error", "Your cart is empty!");
            return res.redirect("/card");
        }

        // Create a new order for each item in the cart
        const orders = itemsInCart.map(item => {
            return new Order({
                name: item.name,
                image_url: item.image_url,
                price: item.price,
                veg: item.veg,
                category: item.category,
                user: req.user ? req.user._id : null, // Optional: track who added it
            });
        });

        // Save all the orders to the database
        await Order.insertMany(orders);

        // Clear the cart (remove all items)
        await Card.deleteMany({});

        req.flash("success", "Thank you for your order! All items have been successfully ordered.");
        res.redirect("/order");
    } catch (err) {
        req.flash("error", "Something went wrong while placing the order. Please try again.");
        res.redirect("/card");
    }
});
app.post("/login", passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
}), async(req, res) => {
    const redirectUrl = req.session.returnTo || "/";
    delete req.session.returnTo;
    req.flash("success", "Welcome back to FoodieMe!");
    res.redirect(redirectUrl);
});


app.post("/create-order", async(req, res) => {
    const { amount } = req.body;

    const options = {
        amount: amount * 100, // Amount in paise (₹1 = 100 paise)
        currency: "INR",
        receipt: "receipt_order_001",
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error("Razorpay Order Error:", err);
        res.status(500).send("Error creating Razorpay order");
    }
});
app.post("/create-cart-order", async(req, res) => {
    const { amount } = req.body;
    const options = {
        amount: amount * 100, // paise
        currency: "INR",
        receipt: "cart_rcptid_" + Math.floor(Math.random() * 10000)
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.log("Error creating Razorpay order:", err);
        res.status(500).send("Error");
    }
});
app.get("/card/order-all-success", isLoggedIn, async(req, res) => {
    const scheduledAt = req.query.scheduledAt;

    if (!scheduledAt || new Date(scheduledAt) < new Date()) {
        req.flash("error", "Invalid or missing scheduled time.");
        return res.redirect("/card");
    }

    try {
        const itemsInCart = await Card.find({ user: req.user._id });

        if (itemsInCart.length === 0) {
            req.flash("error", "Your cart is empty!");
            return res.redirect("/card");
        }

        const orders = itemsInCart.map(item => ({
            name: item.name,
            image_url: item.image_url,
            price: item.price,
            veg: item.veg,
            category: item.category,
            user: req.user._id,
            scheduledAt: new Date(scheduledAt),
        }));

        await Order.insertMany(orders);
        await Card.deleteMany({ user: req.user._id });

        req.flash("success", "Payment successful & order scheduled!");
        res.redirect("/order");
    } catch (err) {
        console.error("Order after payment failed:", err);
        req.flash("error", "Something went wrong.");
        res.redirect("/card");
    }
});


app.get("/admin/orders", isLoggedIn, isAdmin, async(req, res) => {
    const allOrders = await Order.find({}).populate("user");
    res.render("admin/orders.ejs", { allOrders });
});



app.post("/admin/orders/:id/status", isLoggedIn, async(req, res) => {
    if (req.user.username !== "admin") {
        req.flash("error", "Unauthorized access!");
        return res.redirect("/");
    }

    const { id } = req.params;
    const { status } = req.body;

    // Update order status in database
    await Order.findByIdAndUpdate(id, { status });

    // ✅ Emit real-time event to all clients
    const io = req.app.get("io");
    io.emit("orderStatusUpdate", {
        orderId: id,
        status: status
    });

    req.flash("success", "Order status updated!");
    res.redirect("/admin/orders");
});


app.post("/order/:id/cancel", isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);

    // Check if user owns this order
    if (!order || String(order.user) !== String(req.user._id)) {
        req.flash("error", "Unauthorized or order not found.");
        return res.redirect("/order");
    }

    order.cancelled = true;
    order.status = "Cancelled";
    await order.save();

    req.flash("success", "Order cancelled.");
    res.redirect("/order");
});

app.post("/admin/orders/:id/cancel", isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
        req.flash("error", "Order not found.");
        return res.redirect("/admin/orders");
    }

    order.cancelled = true;
    order.status = "Cancelled";
    await order.save();

    req.flash("success", "Order cancelled by admin.");
    res.redirect("/admin/orders");
});

app.post("/admin/orders/:id/cancel", isLoggedIn, async(req, res) => {
    const { id } = req.params;

    try {
        await Order.findByIdAndUpdate(id, {
            cancelled: true,
            status: "Cancelled"
        });

        req.flash("success", "Order cancelled successfully.");
        res.redirect("/admin/orders");
    } catch (err) {
        console.error("Error cancelling order:", err);
        req.flash("error", "Something went wrong.");
        res.redirect("/admin/orders");
    }
});
// Show Edit Form
app.get("/edit/:id", isLoggedIn, async(req, res) => {
    if (req.user.role !== "admin") {
        req.flash("error", "Unauthorized");
        return res.redirect("/");
    }
    const item = await Listing.findById(req.params.id);
    res.render("admin/editItem.ejs", { item });
});

// Handle Edit Submit
app.post("/edit/:id", isLoggedIn, async(req, res) => {
    if (req.user.role !== "admin") {
        req.flash("error", "Unauthorized");
        return res.redirect("/");
    }
    const { price } = req.body;
    await Listing.findByIdAndUpdate(req.params.id, { price });
    req.flash("success", "Price updated");
    res.redirect("/show/" + req.params.id);
});

// Handle Delete
app.delete("/delete/:id", isLoggedIn, async(req, res) => {
    if (req.user.role !== "admin") {
        req.flash("error", "Unauthorized");
        return res.redirect("/");
    }
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Item deleted");
    res.redirect("/");
});
app.post("/wishlist/:id/toggle", isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const index = user.wishlist.findIndex(itemId => itemId.toString() === id);

    if (index > -1) {
        user.wishlist.splice(index, 1); // remove
        req.flash("success", "Removed from wishlist");
    } else {
        user.wishlist.push(id); // add
        req.flash("success", "Added to wishlist");
    }

    await user.save();
    res.redirect(`/show/${id}`);
});


app.get("/wishlist", isLoggedIn, async(req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    if (user.role === "admin") {
        req.flash("error", "Admins do not have wishlists.");
        return res.redirect("/");
    }

    res.render("user/wishlist.ejs", { wishlistItems: user.wishlist });
});
app.get("/show/:id", async(req, res) => {
    const { id } = req.params;
    const item = await Listing.findById(id);

    let user = null;
    if (req.user) {
        user = await User.findById(req.user._id).populate("wishlist");
    }

    res.render("listings/show.ejs", { item, user });
});

app.post("/user/address", isLoggedIn, async(req, res) => {
    const { street, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
        await User.updateMany({ _id: req.user._id, "addresses.isDefault": true }, {
            $set: { "addresses.$.isDefault": false }
        });
    }

    await User.findByIdAndUpdate(req.user._id, {
        $push: {
            addresses: { street, city, state, pincode, isDefault: !!isDefault }
        }
    });

    req.flash("success", "Address added successfully!");
    res.redirect("/user/profile");
});
app.delete("/user/address/:index", isLoggedIn, async(req, res) => {
    const { index } = req.params;
    const user = await User.findById(req.user._id);
    user.addresses.splice(index, 1);
    await user.save();
    req.flash("success", "Address removed.");
    res.redirect("/user/profile");
});
app.post("/user/address/:index/default", isLoggedIn, async(req, res) => {
    const { index } = req.params;
    const user = await User.findById(req.user._id);

    user.addresses.forEach((addr, idx) => {
        addr.isDefault = idx == index;
    });

    await user.save();
    req.flash("success", "Default address updated.");
    res.redirect("/user/profile");
});

app.get("/user/profile", isLoggedIn, async(req, res) => {
    res.render("user/profile", { user: req.user });
});
// Show form to add a new item (only for admins)
app.get("/admin/new", isLoggedIn, isAdmin, (req, res) => {
    res.render("admin/newItem.ejs");
});
// Handle new item form submission
app.post("/admin/new", isLoggedIn, isAdmin, async(req, res) => {
    const { name, price, image_url, veg, category } = req.body;

    const newItem = new Listing({
        name,
        price,
        image_url,
        veg: veg === "true", // convert to boolean
        category,
    });

    await newItem.save();
    req.flash("success", "New item added successfully!");
    res.redirect("/");
});

app.get("/verify-email", async(req, res) => {
    const { token, email } = req.query;
    const user = await User.findOne({
        email,
        emailToken: token,
        emailTokenExpires: { $gt: Date.now() },
    });

    if (!user) return res.send("Token invalid or expired.");

    user.emailVerified = true;
    user.emailToken = undefined;
    user.emailTokenExpires = undefined;
    await user.save();

    res.send("✅ Email verified successfully!");
});
app.post("/forgot-password", async(req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.send("No user found.");

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `http://localhost:8080/reset-password?token=${token}&email=${email}`;

    await transporter.sendMail({
        to: email,
        subject: "Reset your password",
        html: `<p>Click below to reset:</p><a href="${resetLink}">Reset Password</a>`,
    });

    res.send("Password reset email sent!");
});
app.get("/reset-password", (req, res) => {
    const { token, email } = req.query;

    res.render("auth/reset-password", {
        email,
        token,
    });
});


app.post("/reset-password", async(req, res) => {
    const { email, token, password } = req.body;
    const user = await User.findOne({
        email,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.send("Token invalid or expired.");

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.send("Password reset successfully!");
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
});

// make `io` accessible in routes
app.set("io", io);

http.listen(8080, () => console.log("Server running on port 8080"));