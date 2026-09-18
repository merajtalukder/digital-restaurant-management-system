"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Starting fresh restaurant menu seed...");
    console.log("🧹 Cleaning old menu and order data...");
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.category.deleteMany();
    console.log("✅ Old menu data removed.");
    const categories = [
        {
            name: "Burgers",
            description: "Freshly prepared burgers with chicken, beef and cheese.",
        },
        {
            name: "Pizza",
            description: "Freshly baked pizzas with delicious toppings.",
        },
        {
            name: "Rice & Biryani",
            description: "Traditional rice dishes and flavorful biryani.",
        },
        {
            name: "Chicken & Grill",
            description: "Grilled, fried and spicy chicken dishes.",
        },
        {
            name: "Pasta & Noodles",
            description: "Creamy pasta, spaghetti and Asian-style noodles.",
        },
        {
            name: "Snacks & Appetizers",
            description: "Crispy snacks, fries and delicious appetizers.",
        },
        {
            name: "Drinks",
            description: "Soft drinks, juices, coffee, shakes and refreshing beverages.",
        },
        {
            name: "Desserts",
            description: "Cakes, ice cream, brownies and sweet treats.",
        },
    ];
    const categoryMap = {};
    for (const category of categories) {
        const createdCategory = await prisma.category.create({
            data: {
                name: category.name,
                description: category.description,
                status: true,
            },
        });
        categoryMap[category.name] = createdCategory.id;
        console.log(`📂 Category created: ${category.name}`);
    }
    const menuItems = [
        {
            name: "Classic Chicken Burger",
            description: "Crispy chicken patty with lettuce, tomato and special sauce.",
            price: 220,
            foodType: client_1.FoodType.COOKED,
            category: "Burgers",
        },
        {
            name: "Classic Beef Burger",
            description: "Juicy beef patty with fresh vegetables and burger sauce.",
            price: 280,
            foodType: client_1.FoodType.COOKED,
            category: "Burgers",
        },
        {
            name: "Cheese Burger",
            description: "Beef patty topped with melted cheese and fresh vegetables.",
            price: 300,
            foodType: client_1.FoodType.COOKED,
            category: "Burgers",
        },
        {
            name: "Double Beef Burger",
            description: "Two juicy beef patties with cheese and special sauce.",
            price: 420,
            foodType: client_1.FoodType.COOKED,
            category: "Burgers",
        },
        {
            name: "Double Chicken Burger",
            description: "Double crispy chicken patties with creamy sauce.",
            price: 350,
            foodType: client_1.FoodType.COOKED,
            category: "Burgers",
        },
        {
            name: "BBQ Chicken Burger",
            description: "Grilled chicken burger with smoky BBQ sauce.",
            price: 280,
            foodType: client_1.FoodType.COOKED,
            category: "Burgers",
        },
        {
            name: "Spicy Chicken Burger",
            description: "Spicy crispy chicken patty with hot sauce.",
            price: 250,
            foodType: client_1.FoodType.COOKED,
            category: "Burgers",
        },
        {
            name: "Mushroom Beef Burger",
            description: "Beef burger topped with mushrooms and cheese.",
            price: 340,
            foodType: client_1.FoodType.COOKED,
            category: "Burgers",
        },
        {
            name: "Chicken Cheese Burger",
            description: "Crispy chicken patty with double cheese.",
            price: 280,
            foodType: client_1.FoodType.COOKED,
            category: "Burgers",
        },
        {
            name: "Mega Special Burger",
            description: "Large beef burger with double cheese and special sauce.",
            price: 450,
            foodType: client_1.FoodType.COOKED,
            category: "Burgers",
        },
        {
            name: "Margherita Pizza",
            description: "Classic pizza with tomato sauce and mozzarella cheese.",
            price: 380,
            foodType: client_1.FoodType.COOKED,
            category: "Pizza",
        },
        {
            name: "Chicken Pizza",
            description: "Chicken, mozzarella cheese and fresh pizza toppings.",
            price: 450,
            foodType: client_1.FoodType.COOKED,
            category: "Pizza",
        },
        {
            name: "Beef Pizza",
            description: "Seasoned beef with mozzarella and pizza sauce.",
            price: 500,
            foodType: client_1.FoodType.COOKED,
            category: "Pizza",
        },
        {
            name: "Chicken BBQ Pizza",
            description: "BBQ chicken with smoky sauce and mozzarella cheese.",
            price: 520,
            foodType: client_1.FoodType.COOKED,
            category: "Pizza",
        },
        {
            name: "Pepperoni Pizza",
            description: "Classic pepperoni pizza with melted mozzarella.",
            price: 550,
            foodType: client_1.FoodType.COOKED,
            category: "Pizza",
        },
        {
            name: "Cheese Lovers Pizza",
            description: "Loaded with multiple types of melted cheese.",
            price: 480,
            foodType: client_1.FoodType.COOKED,
            category: "Pizza",
        },
        {
            name: "Spicy Chicken Pizza",
            description: "Spicy chicken with jalapeno and mozzarella cheese.",
            price: 500,
            foodType: client_1.FoodType.COOKED,
            category: "Pizza",
        },
        {
            name: "Beef Mushroom Pizza",
            description: "Beef and mushroom with cheese and special sauce.",
            price: 550,
            foodType: client_1.FoodType.COOKED,
            category: "Pizza",
        },
        {
            name: "Vegetable Pizza",
            description: "Fresh vegetables, olives, tomato and mozzarella.",
            price: 400,
            foodType: client_1.FoodType.COOKED,
            category: "Pizza",
        },
        {
            name: "Special Loaded Pizza",
            description: "Loaded pizza with chicken, beef, vegetables and cheese.",
            price: 650,
            foodType: client_1.FoodType.COOKED,
            category: "Pizza",
        },
        {
            name: "Chicken Biryani",
            description: "Aromatic basmati rice with tender chicken and spices.",
            price: 280,
            foodType: client_1.FoodType.COOKED,
            category: "Rice & Biryani",
        },
        {
            name: "Beef Biryani",
            description: "Flavorful beef biryani with aromatic rice.",
            price: 320,
            foodType: client_1.FoodType.COOKED,
            category: "Rice & Biryani",
        },
        {
            name: "Kacchi Biryani",
            description: "Traditional Bangladeshi kacchi biryani with mutton.",
            price: 380,
            foodType: client_1.FoodType.COOKED,
            category: "Rice & Biryani",
        },
        {
            name: "Chicken Fried Rice",
            description: "Fried rice with chicken, egg and fresh vegetables.",
            price: 250,
            foodType: client_1.FoodType.COOKED,
            category: "Rice & Biryani",
        },
        {
            name: "Beef Fried Rice",
            description: "Fried rice with seasoned beef and vegetables.",
            price: 290,
            foodType: client_1.FoodType.COOKED,
            category: "Rice & Biryani",
        },
        {
            name: "Mixed Fried Rice",
            description: "Fried rice with chicken, beef, egg and vegetables.",
            price: 330,
            foodType: client_1.FoodType.COOKED,
            category: "Rice & Biryani",
        },
        {
            name: "Chicken Pulao",
            description: "Aromatic pulao rice served with tender chicken.",
            price: 260,
            foodType: client_1.FoodType.COOKED,
            category: "Rice & Biryani",
        },
        {
            name: "Mutton Biryani",
            description: "Rich mutton biryani prepared with aromatic spices.",
            price: 420,
            foodType: client_1.FoodType.COOKED,
            category: "Rice & Biryani",
        },
        {
            name: "Egg Fried Rice",
            description: "Fried rice with egg and fresh vegetables.",
            price: 180,
            foodType: client_1.FoodType.COOKED,
            category: "Rice & Biryani",
        },
        {
            name: "Special Mixed Rice",
            description: "Special rice with chicken, beef, egg and vegetables.",
            price: 350,
            foodType: client_1.FoodType.COOKED,
            category: "Rice & Biryani",
        },
        {
            name: "Grilled Chicken",
            description: "Juicy grilled chicken served with special sauce.",
            price: 350,
            foodType: client_1.FoodType.COOKED,
            category: "Chicken & Grill",
        },
        {
            name: "Chicken Tandoori",
            description: "Traditional tandoori chicken with aromatic spices.",
            price: 320,
            foodType: client_1.FoodType.COOKED,
            category: "Chicken & Grill",
        },
        {
            name: "Chicken Shashlik",
            description: "Grilled chicken with capsicum and onion.",
            price: 380,
            foodType: client_1.FoodType.COOKED,
            category: "Chicken & Grill",
        },
        {
            name: "Chicken BBQ",
            description: "Smoky BBQ chicken with special BBQ sauce.",
            price: 350,
            foodType: client_1.FoodType.COOKED,
            category: "Chicken & Grill",
        },
        {
            name: "Crispy Fried Chicken",
            description: "Crispy fried chicken with special seasoning.",
            price: 250,
            foodType: client_1.FoodType.COOKED,
            category: "Chicken & Grill",
        },
        {
            name: "Chicken Wings",
            description: "Crispy chicken wings with spicy sauce.",
            price: 280,
            foodType: client_1.FoodType.COOKED,
            category: "Chicken & Grill",
        },
        {
            name: "Hot & Spicy Chicken",
            description: "Spicy fried chicken tossed in hot sauce.",
            price: 300,
            foodType: client_1.FoodType.COOKED,
            category: "Chicken & Grill",
        },
        {
            name: "Chicken Curry",
            description: "Traditional chicken curry with rich spices.",
            price: 280,
            foodType: client_1.FoodType.COOKED,
            category: "Chicken & Grill",
        },
        {
            name: "Chicken Masala",
            description: "Chicken cooked with creamy masala gravy.",
            price: 320,
            foodType: client_1.FoodType.COOKED,
            category: "Chicken & Grill",
        },
        {
            name: "Chicken Steak",
            description: "Tender grilled chicken steak with sauce.",
            price: 450,
            foodType: client_1.FoodType.COOKED,
            category: "Chicken & Grill",
        },
        {
            name: "Chicken Pasta",
            description: "Creamy pasta with grilled chicken.",
            price: 280,
            foodType: client_1.FoodType.COOKED,
            category: "Pasta & Noodles",
        },
        {
            name: "Beef Pasta",
            description: "Creamy pasta with seasoned beef.",
            price: 320,
            foodType: client_1.FoodType.COOKED,
            category: "Pasta & Noodles",
        },
        {
            name: "Chicken Alfredo",
            description: "Creamy Alfredo pasta with grilled chicken.",
            price: 350,
            foodType: client_1.FoodType.COOKED,
            category: "Pasta & Noodles",
        },
        {
            name: "Spaghetti Bolognese",
            description: "Spaghetti with rich beef Bolognese sauce.",
            price: 350,
            foodType: client_1.FoodType.COOKED,
            category: "Pasta & Noodles",
        },
        {
            name: "Chicken Chow Mein",
            description: "Stir-fried noodles with chicken and vegetables.",
            price: 250,
            foodType: client_1.FoodType.COOKED,
            category: "Pasta & Noodles",
        },
        {
            name: "Beef Chow Mein",
            description: "Stir-fried noodles with beef and vegetables.",
            price: 290,
            foodType: client_1.FoodType.COOKED,
            category: "Pasta & Noodles",
        },
        {
            name: "Mixed Chow Mein",
            description: "Noodles with chicken, beef, egg and vegetables.",
            price: 330,
            foodType: client_1.FoodType.COOKED,
            category: "Pasta & Noodles",
        },
        {
            name: "Vegetable Noodles",
            description: "Stir-fried noodles with fresh vegetables.",
            price: 200,
            foodType: client_1.FoodType.COOKED,
            category: "Pasta & Noodles",
        },
        {
            name: "French Fries",
            description: "Crispy golden french fries.",
            price: 150,
            foodType: client_1.FoodType.INSTANT,
            category: "Snacks & Appetizers",
        },
        {
            name: "Cheese Fries",
            description: "Crispy fries topped with melted cheese.",
            price: 220,
            foodType: client_1.FoodType.INSTANT,
            category: "Snacks & Appetizers",
        },
        {
            name: "Chicken Nuggets",
            description: "Crispy chicken nuggets served with sauce.",
            price: 220,
            foodType: client_1.FoodType.COOKED,
            category: "Snacks & Appetizers",
        },
        {
            name: "Chicken Spring Roll",
            description: "Crispy spring rolls filled with seasoned chicken.",
            price: 160,
            foodType: client_1.FoodType.COOKED,
            category: "Snacks & Appetizers",
        },
        {
            name: "Vegetable Spring Roll",
            description: "Crispy spring rolls filled with vegetables.",
            price: 140,
            foodType: client_1.FoodType.COOKED,
            category: "Snacks & Appetizers",
        },
        {
            name: "Chicken Samosa",
            description: "Crispy samosa filled with spicy chicken.",
            price: 120,
            foodType: client_1.FoodType.COOKED,
            category: "Snacks & Appetizers",
        },
        {
            name: "Chicken Cheese Balls",
            description: "Crispy chicken and cheese balls.",
            price: 220,
            foodType: client_1.FoodType.COOKED,
            category: "Snacks & Appetizers",
        },
        {
            name: "Onion Rings",
            description: "Crispy golden onion rings.",
            price: 150,
            foodType: client_1.FoodType.COOKED,
            category: "Snacks & Appetizers",
        },
        {
            name: "Garlic Bread",
            description: "Toasted garlic bread with butter.",
            price: 180,
            foodType: client_1.FoodType.COOKED,
            category: "Snacks & Appetizers",
        },
        {
            name: "Chicken Popcorn",
            description: "Small crispy chicken pieces with special seasoning.",
            price: 230,
            foodType: client_1.FoodType.COOKED,
            category: "Snacks & Appetizers",
        },
        {
            name: "Coca-Cola",
            description: "Chilled Coca-Cola soft drink.",
            price: 60,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Pepsi",
            description: "Chilled Pepsi soft drink.",
            price: 60,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Sprite",
            description: "Chilled Sprite soft drink.",
            price: 60,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "7UP",
            description: "Refreshing lemon-lime soft drink.",
            price: 60,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Fanta",
            description: "Refreshing orange flavored soft drink.",
            price: 60,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Mountain Dew",
            description: "Chilled Mountain Dew soft drink.",
            price: 70,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Mirinda",
            description: "Refreshing orange flavored drink.",
            price: 60,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Mojo",
            description: "Popular Bangladeshi cola drink.",
            price: 50,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Clemon",
            description: "Refreshing lemon-lime carbonated drink.",
            price: 50,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Speed",
            description: "Chilled energy drink.",
            price: 80,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Red Bull",
            description: "Premium energy drink.",
            price: 280,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Mineral Water",
            description: "Pure bottled drinking water.",
            price: 30,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Borhani",
            description: "Traditional Bangladeshi spiced yogurt drink.",
            price: 100,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Sweet Lassi",
            description: "Creamy and refreshing sweet yogurt drink.",
            price: 120,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Mango Juice",
            description: "Refreshing mango fruit juice.",
            price: 120,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Orange Juice",
            description: "Fresh orange juice.",
            price: 120,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Apple Juice",
            description: "Refreshing apple juice.",
            price: 130,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Pineapple Juice",
            description: "Refreshing pineapple juice.",
            price: 130,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Fresh Lime",
            description: "Fresh lime juice with ice.",
            price: 100,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Mint Lemonade",
            description: "Refreshing lemonade with fresh mint.",
            price: 130,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Cold Coffee",
            description: "Chilled creamy coffee.",
            price: 180,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Cappuccino",
            description: "Hot creamy cappuccino coffee.",
            price: 180,
            foodType: client_1.FoodType.COOKED,
            category: "Drinks",
        },
        {
            name: "Chocolate Milkshake",
            description: "Rich chocolate milkshake.",
            price: 220,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Vanilla Milkshake",
            description: "Creamy vanilla milkshake.",
            price: 200,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Strawberry Milkshake",
            description: "Creamy strawberry milkshake.",
            price: 220,
            foodType: client_1.FoodType.INSTANT,
            category: "Drinks",
        },
        {
            name: "Chocolate Cake",
            description: "Soft chocolate cake with rich chocolate flavor.",
            price: 150,
            foodType: client_1.FoodType.INSTANT,
            category: "Desserts",
        },
        {
            name: "Vanilla Cake",
            description: "Soft vanilla cake with creamy topping.",
            price: 140,
            foodType: client_1.FoodType.INSTANT,
            category: "Desserts",
        },
        {
            name: "Chocolate Brownie",
            description: "Rich and soft chocolate brownie.",
            price: 180,
            foodType: client_1.FoodType.INSTANT,
            category: "Desserts",
        },
        {
            name: "Vanilla Ice Cream",
            description: "Creamy vanilla ice cream.",
            price: 120,
            foodType: client_1.FoodType.INSTANT,
            category: "Desserts",
        },
        {
            name: "Chocolate Ice Cream",
            description: "Rich chocolate ice cream.",
            price: 130,
            foodType: client_1.FoodType.INSTANT,
            category: "Desserts",
        },
        {
            name: "Strawberry Ice Cream",
            description: "Creamy strawberry ice cream.",
            price: 130,
            foodType: client_1.FoodType.INSTANT,
            category: "Desserts",
        },
        {
            name: "Chocolate Sundae",
            description: "Ice cream topped with chocolate sauce.",
            price: 180,
            foodType: client_1.FoodType.INSTANT,
            category: "Desserts",
        },
        {
            name: "Fruit Salad",
            description: "Fresh seasonal fruits with creamy topping.",
            price: 180,
            foodType: client_1.FoodType.INSTANT,
            category: "Desserts",
        },
        {
            name: "Caramel Pudding",
            description: "Soft creamy caramel pudding.",
            price: 140,
            foodType: client_1.FoodType.INSTANT,
            category: "Desserts",
        },
        {
            name: "Cheesecake",
            description: "Creamy cheesecake with a sweet biscuit base.",
            price: 250,
            foodType: client_1.FoodType.INSTANT,
            category: "Desserts",
        },
    ];
    for (const item of menuItems) {
        const categoryId = categoryMap[item.category];
        if (!categoryId) {
            throw new Error(`Category not found: ${item.category}`);
        }
        await prisma.menuItem.create({
            data: {
                name: item.name,
                description: item.description,
                price: item.price,
                foodType: item.foodType,
                isAvailable: true,
                categoryId,
            },
        });
        console.log(`🍽️ Added: ${item.name} — ৳${item.price}`);
    }
    console.log("");
    console.log("======================================");
    console.log("🎉 FRESH MENU SEED COMPLETED!");
    console.log("======================================");
    console.log(`📂 Categories: ${categories.length}`);
    console.log(`🍽️ Menu Items: ${menuItems.length}`);
    console.log("💰 Currency: BDT (৳)");
    console.log("======================================");
}
main()
    .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map