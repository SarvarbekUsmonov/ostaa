// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var cookieIdsList = [];
// Create an Express app and set up middleware
const app = express();
app.use(bodyParser.json());
app.use(express.static('public_html'));
app.use(cookieParser());


// Set up the server port and database URL
const port = process.env.PORT || 3000;
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



function checkLoggedIn(sessionID){
        if(cookieIdsList.includes(sessionID)){
            return true;
        } else {
            return false;
        }
    }

app.use((req, res, next) => {
        let loggedInCheck = checkLoggedIn(req.cookies.sessionID);
        console.log(req.cookies.sessionID); // Check the value of the cookie
        const allowedRoutes = ['/', '/add/user', '/login/user'];
        
        if (allowedRoutes.includes(req.path) || loggedInCheck) {
            // User is accessing an allowed route or is already logged in
            next();
        } else if (req.path === '/home.html' && !loggedInCheck) {
            // User is not logged in and trying to access home.html
            res.redirect('/');
        } else {
            // User is not logged in and trying to access another route
            res.redirect('/');
        }
    });
    


// Define the User schema and create a Mongoose model
const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    cookie: {type: String, required: true},
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
    let generatedCookie = '' + Math.floor(Math.random() * 10000000);
    cookieIdsList.push(generatedCookie);

    setTimeout(() => {
        for(let i = 0; i < cookieIdsList.length; i++) {
          if (cookieIdsList[i] === generatedCookie) {
            cookieIdsList.splice(i, 1);
            break;
          }
        }
      }, 600000);
      

    let newUser = new User({
        username: usernameAddUser,
        password: passwordAddUser,
        cookie: generatedCookie,
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
            res.status(201).send("Item saved successfully");
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Error saving item");
        })

    User.findOne({username: itemUsername})
        .then((u) => {
          u.listings.push(newItem._id);
          return u.save();
        })
        .then((su) => {
          console.log('Saved user:', su);
        })
        .catch((err) => {
          console.error(err);
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

app.get('/getUserName', (req, res) => {
    let sessionID = req.cookies.sessionID;
    User.findOne({cookie: sessionID})
    .lean()
    .then(userFound => {
        res.json(userFound);
    })
    .catch(err => {
        console.error(err);
        res.status(500).send("Error getting users");
    })
})

app.get('/search/usersByCookie', (req, res) => {
    let sessionID = req.cookies.sessionID;
    User.findOne({cookie: sessionID})
    .lean()
    .then(userFound => {
        console.log(userFound.listings);
        Item.find({_id: {$in: userFound.listings}})
            .then(items => {
                res.status(200).json(items);
            })
            .catch(err => {
                console.error(err);
                res.status(500).send("Error getting items");
            })

    })
    .catch(err => {
        console.error(err);
        res.status(500).send("Error getting users");
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

  
app.post("/login/user", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    User.findOne({ username: username, password: password })
      .then(user => {
        if (!user) {
          // Username or password not found
          res.status(401).send('Invalid username or password');
          return;
        }

        let cookieToSave = user.cookie;
        cookieIdsList.push(cookieToSave);

        // console.log(cookieIdsList);

        setTimeout(() => {
          for (let i = 0; i < cookieIdsList.length; i++) {
            if (cookieIdsList[i] === cookieToSave) {
              cookieIdsList.splice(i, 1);
              console.log("deleted: " + cookieToSave);
              break;
            }
          }
        }, 600000);

       // Send the cookie value in the response body
       res.status(200).json({ cookie: cookieToSave });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Internal server error');
      });
});


// Serve index.html as the default page
app.get("/", (req, res) => {
    res.sendFile("index.html");
})


app.get('/checkSession/:id', (req, res) => {
    if(cookieIdsList.includes(req.params.id)){
        res.status(200).json({'loggedin': 'yes'});
    } else {
        res.status(401).json({'loggedin': 'no'});
    }
})
app.get('*', (req, res) => {
    res.redirect('/');
});


// Start the server and listen on the specified port
app.listen(port, () => {
    console.log("Server is running");
})


