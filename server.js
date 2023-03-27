// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create an Express app and set up middleware
const app = express();
app.use(express.static('public_html'));
app.use(bodyParser.json());

// Set up the server port and database URL
const port = process.env.PORT || 3001;
const dbUrl = process.env.DB_URL || 'mongodb://localhost/ostaa';

// Set CORS headers to allow cross-origin requests from any domain
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Connect to the MongoDB database using Mongoose
mongoose.connect(dbUrl, {useNewUrlParser: true})
    .then(() => console.log('Connected to database'))
    .catch(err => console.error('Error connecting to database:', err));

// Define the User schema and create a Mongoose model
const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    listings: [{ type: String, required: true }],
    purchases: [{ type: String, required: true }]
})
const User = mongoose.model('Users', userSchema);

// Define the Item schema and create a Mongoose model
const itemSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},
    price: {type: Number, required: true},
    status: {type: String, required: true}
})
const Item = mongoose.model('Items', itemSchema);

// Add a new user to the database
app.post('/add/user', (req, res) => {
    let passwordAddUser = req.body.password;
    let usernameAddUser = req.body.username;

    let newUser = new User({
        username: usernameAddUser,
        password: passwordAddUser,
        listings: [],
        purchases: []
    });

    newUser.save()
        .then(savedUser => {
            console.log(`User ${savedUser.username} saved to the database`);
            res.status(201).send("User saved successfully");
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error saving user");
        });
});

// Add a new item to the database
app.post('/add/item/:username', (req, res) => {
    let itemTitle = req.body.title;
    let itemDescription = req.body.description;
    let itemImage = req.body.image;
    let itemPrice = req.body.price;
    let itemStatus = req.body.status;
    let itemUsername = req.params.username;

    let newItem = new Item({
        title: itemTitle,
        description: itemDescription,
        image: itemImage,
        price: itemPrice,
        status: itemStatus
    })

    newItem.save()
        .then(savedItem => {
            console.log(`Item ${savedItem.title} saved to the database`);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error saving user");
        })

    User.findOne({username: itemUsername})
        .then((u) => {
          u.listings.push(newItem._id);
          return u.save();
        })
        .then((su) => {
          console.log('Saved user:', su);
          res.send('Item ' + su.title + ' saved to the database');
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('Error saving item to the database');
        });
      
})

// Get all users from database
app.get('/get/users', (req, res) => {
    User.find()
        .then(users => {
            // Send JSON response containing all users
            res.json(users);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error retrieving users");
        })
})

// Get all items from database
app.get('/get/items', (req, res) => {
    Item.find()
        .then(items => {
            // Send JSON response containing all items
            res.json(items);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error retrieving items");
        })
})

// Get the listings of a particular user from the database
app.get('/get/listings/:username', (req, res) => {
    User.findOne({"username":req.params.username})
        .then(userFound => {
            // Send JSON response containing the listings of the user
            res.json(userFound.listings);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error getting listings");
        })
})

// Get the purchases of a particular user from the database
app.get('/get/purchases/:username', (req, res) => {
    User.findOne({"username": req.params.username})
        .then(userFound => {
            // Send JSON response containing the purchases of the user
            res.json(userFound.purchases);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error getting purchases");
        })
})

// Search for users whose usernames match the keyword
app.get('/search/users/:keyword', (req, res) => {
    let keyword = req.params.keyword;
    User.find({username: {$regex: keyword, $options: 'i'}})
    .lean()
    .then(users => {
        // Send JSON response containing all matching users
        res.json(users);
    })
    .catch(err => {
        console.error(err);
        res.status(500).send("Error getting users");
    })
})

// Search for items whose descriptions match the keyword
app.get('/search/items/:keyword', (req, res)=> {
    let keyword = req.params.keyword;

    Item.find({description: {$regex: keyword, $options: 'i'}})
    .lean()
    .then(items => {
        // Send JSON response containing all matching items
        res.json(items);
    })
    .catch(err => {
        console.error(err);
        res.status(500).send("Error getting items");
    })
})


// Serve index.html as the default page
app.get("/", (req, res) => {
    res.sendFile("index.html");
})

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log("Server is running");
})
