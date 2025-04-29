const sampleData = [
    // 📌 ITALIAN - PIZZAS 🍕
    {
        "name": "Margherita Pizza",
        "price": 199,
        "veg": true,
        "category": "Pizza",
        "description": "Classic Italian pizza with tomato sauce, fresh mozzarella, and basil.",
        "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002"
    },
    {
        "name": "Pepperoni Pizza",
        "price": 269,
        "veg": false,
        "category": "Pizza",
        "description": "Cheesy delight topped with spicy pepperoni slices and marinara sauce.",
        "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3"
    },

    // 📌 ITALIAN - PASTAS 🍝
    {
        "name": "Pasta Alfredo",
        "price": 249,
        "veg": true,
        "category": "Pasta",
        "description": "Creamy Alfredo sauce served with fettuccine pasta and parmesan cheese.",
        "image_url": "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg"
    },
    {
        "name": "Spaghetti Carbonara",
        "price": 279,
        "veg": false,
        "category": "Pasta",
        "description": "Traditional Italian pasta with eggs, pancetta, and Parmesan cheese.",
        "image_url": "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb"
    },

    // 📌 CHINESE - RICE & NOODLES 🍜
    {
        "name": "Veg Hakka Noodles",
        "price": 189,
        "veg": true,
        "category": "Noodles",
        "description": "Stir-fried noodles with fresh vegetables and soy sauce.",
        "image_url": "https://images.unsplash.com/photo-1555126634-323283e090fa"
    },
    {
        "name": "Schezwan Fried Rice",
        "price": 219,
        "veg": true,
        "category": "Rice",
        "description": "Spicy Indo-Chinese fried rice tossed with vegetables and Schezwan sauce.",
        "image_url": "https://images.pexels.com/photos/3926124/pexels-photo-3926124.jpeg"
    },

    // 📌 CHINESE - STARTERS 🥡
    {
        "name": "Chicken Manchurian",
        "price": 249,
        "veg": false,
        "category": "Appetizer",
        "description": "Crispy chicken balls tossed in spicy Manchurian sauce.",
        "image_url": "https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg"
    },


    // 📌 INDIAN - CURRIES 🍛
    {
        "name": "Butter Chicken",
        "price": 299,
        "veg": false,
        "category": "Curry",
        "description": "Creamy tomato-based curry with tender chicken, served with naan.",
        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950"
    },


    // 📌 INDIAN - BIRYANI 🍚
    {
        "name": "Chicken Biryani",
        "price": 299,
        "veg": false,
        "category": "Biryani",
        "description": "Fragrant basmati rice cooked with marinated chicken and aromatic spices.",
        "image_url": "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a"
    },


    // 📌 INDIAN - BREADS 🥖
    {
        "name": "Tandoori Roti",
        "price": 30,
        "veg": true,
        "category": "Bread",
        "description": "Soft whole wheat bread cooked in a traditional clay oven.",
        "image_url": "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg"
    },
    {
        "name": "Butter Naan",
        "price": 40,
        "veg": true,
        "category": "Bread",
        "description": "Soft, fluffy Indian bread made with refined flour, baked in a tandoor.",
        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950"
    },

    // 📌 STREET FOOD 🌯
    {
        "name": "Pani Puri",
        "price": 99,
        "veg": true,
        "category": "Street Food",
        "description": "Crispy puris filled with tangy tamarind water and spiced potatoes.",
        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950"
    },
    {
        "name": "Vada Pav",
        "price": 49,
        "veg": true,
        "category": "Street Food",
        "description": "Mumbai-style spicy potato fritter served in a bun.",
        "image_url": "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg"
    },

    // 📌 DESSERTS 🍰

    {
        "name": "Choco Lava Cake",
        "price": 89,
        "veg": true,
        "category": "Dessert",
        "description": "Warm, rich chocolate cake with a gooey molten chocolate center.",
        "image_url": "https://images.unsplash.com/photo-1571115177098-24ec42ed204d"
    },

    // 📌 BEVERAGES 🥤
    {
        "name": "Masala Chai",
        "price": 40,
        "veg": true,
        "category": "Beverage",
        "description": "Traditional Indian spiced tea brewed with milk, ginger, and cardamom.",
        "image_url": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9"
    },
    {
        "name": "Mango Lassi",
        "price": 99,
        "veg": true,
        "category": "Beverage",
        "description": "Thick, creamy yogurt-based mango drink with a touch of cardamom.",
        "image_url": "https://images.unsplash.com/photo-1603569283847-aa295f0d016a"
    },
    // 📌 ITALIAN - PIZZAS 🍕
    {
        "name": "BBQ Chicken Pizza",
        "price": 289,
        "veg": false,
        "category": "Pizza",
        "description": "Juicy BBQ chicken chunks, caramelized onions, and mozzarella on a crispy crust.",
        "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
    },
    {
        "name": "Four Cheese Pizza",
        "price": 269,
        "veg": true,
        "category": "Pizza",
        "description": "A blend of mozzarella, cheddar, parmesan, and gouda on a golden crust.",
        "image_url": "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47"
    },

    // 📌 ITALIAN - PASTAS 🍝
    {
        "name": "Penne Arrabbiata",
        "price": 239,
        "veg": true,
        "category": "Pasta",
        "description": "Spicy tomato-based sauce with garlic, chili flakes, and fresh basil.",
        "image_url": "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb"
    },
    {
        "name": "Lasagna Verde",
        "price": 289,
        "veg": true,
        "category": "Pasta",
        "description": "Spinach and ricotta cheese layered between sheets of pasta with béchamel sauce.",
        "image_url": "https://images.unsplash.com/photo-1611270629569-8b357cb88da9"
    },

    // 📌 CHINESE - STARTERS 🥡
    {
        "name": "Dragon Chicken",
        "price": 259,
        "veg": false,
        "category": "Appetizer",
        "description": "Crispy chicken strips tossed in a spicy honey-chili sauce.",
        "image_url": "https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg"
    },


    // 📌 CHINESE - RICE & NOODLES 🍜
    {
        "name": "Egg Fried Rice",
        "price": 229,
        "veg": false,
        "category": "Rice",
        "description": "Classic wok-fried rice with scrambled eggs, spring onions, and soy sauce.",
        "image_url": "https://images.unsplash.com/photo-1603133872878-684f208fb84b"
    },
    {
        "name": "Schezwan Hakka Noodles",
        "price": 219,
        "veg": true,
        "category": "Noodles",
        "description": "Spicy schezwan-flavored noodles stir-fried with vegetables.",
        "image_url": "https://images.unsplash.com/photo-1555126634-323283e090fa"
    },

    // 📌 INDIAN - CURRIES 🍛
    {
        "name": "Rogan Josh",
        "price": 319,
        "veg": false,
        "category": "Curry",
        "description": "Kashmiri-style lamb curry slow-cooked with aromatic spices.",
        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950"
    },


    // 📌 INDIAN - BIRYANI 🍚
    {
        "name": "Hyderabadi Mutton Biryani",
        "price": 329,
        "veg": false,
        "category": "Biryani",
        "description": "Slow-cooked basmati rice with tender mutton and saffron-infused flavors.",
        "image_url": "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a"
    },
    {
        "name": "Paneer Tikka Biryani",
        "price": 259,
        "veg": true,
        "category": "Biryani",
        "description": "Tandoori paneer cubes layered with fragrant rice and spices.",
        "image_url": "https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg"
    },

    // 📌 STREET FOOD 🌯
    {
        "name": "Kachori Chaat",
        "price": 99,
        "veg": true,
        "category": "Street Food",
        "description": "Crispy kachori topped with tangy tamarind chutney, yogurt, and sev.",
        "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641"
    },
    {
        "name": "Dabeli",
        "price": 79,
        "veg": true,
        "category": "Street Food",
        "description": "Gujarati-style spicy potato mix stuffed in a bun with peanuts and pomegranate.",
        "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641"
    },

    // 📌 DESSERTS 🍰

    {
        "name": "Tiramisu",
        "price": 189,
        "veg": true,
        "category": "Dessert",
        "description": "Classic Italian dessert made with coffee-soaked ladyfingers and mascarpone cheese.",
        "image_url": "https://images.unsplash.com/photo-1571115177098-24ec42ed204d"
    },

    {
        "name": "Cold Coffee",
        "price": 129,
        "veg": true,
        "category": "Beverage",
        "description": "Chilled coffee blended with ice, milk, and chocolate syrup.",
        "image_url": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5"
    },
    {
        "name": "Sugarcane Juice",
        "price": 60,
        "veg": true,
        "category": "Beverage",
        "description": "Freshly squeezed sugarcane juice with a dash of lemon and mint.",
        "image_url": "https://images.unsplash.com/photo-1603569283847-aa295f0d016a"
    }
];

module.exports = { data: sampleData };