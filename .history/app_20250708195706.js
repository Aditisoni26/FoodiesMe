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
    req.session.returnTo = req.originalUrl; // optional: redirect back after login
    req.flash("error", "You must be logged in first!");
    return res.redirect("/login");
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
    try {
        let { username, email, address, mobileNo, password } = req.body;
        let newUser = new User({ username, email, address, mobileNo });
        const registerUser = await User.register(newUser, password);
        registerUser.email = email;
        registerUser.address = address;
        registerUser.mobileNo = mobileNo;
        await registerUser.save();
        req.login(registerUser, (err) => {
            if (err) {
                return next;
            }
            req.flash("success", "welcome to FoodieMe");
            res.redirect("/");
        })
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }


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
    console.log(orderedItem);
    res.render("orders/buynow.ejs", { orderedItem });

});
app.post("/show/:id/order", isLoggedIn, async(req, res) => {
    const { id } = req.params;
    const orderedItem = await Listing.findById(id);
    const newOrderItem = new Order({
        name: orderedItem.name,
        image_url: orderedItem.image_url,
        price: orderedItem.price,
        veg: orderedItem.veg,
        category: orderedItem.category,
        user: req.user ? req.user._id : null, // Optional: track who added it
    });

    await newOrderItem.save();
    req.flash("success", "Thank you for ordering from FoodieMe!");
    res.redirect("/order");

});

app.post("/show/:id/Add-to-card", async(req, res) => {
    const { id } = req.params;
    const item = await Listing.findById(id);
    const newCard = new Card({
        name: item.name,
        image_url: item.image_url,
        price: item.price,
        veg: item.veg,
        category: item.category,
        user: req.user ? req.user._id : null, // Optional: track who added it
    });

    await newCard.save();
    res.redirect("/card");

});
app.get("/card", async(req, res) => {
    const items = await Card.find({});
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

app.delete("/card/:id/delete", async(req, res) => {
    const { id } = req.params;
    await Card.findByIdAndDelete(id);
    res.redirect("/card");
});
app.get("/order", async(req, res) => {
    const items = await Order.find({});
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
app.post("/card/order-all", async(req, res) => {
    try {
        // Fetch all items in the cart
        const itemsInCart = await Card.find({});

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



app.listen(8080, () => {
    console.log("working");
});