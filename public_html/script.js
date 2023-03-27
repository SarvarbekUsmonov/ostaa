/**
 * Author: Sarvarbek Usmonov
 * Purpose: Client side script for Ostaa app
 */
// Define the endpoint URL for making requests to the server
const port = 3001;
const IP = "localhost";
const URL = "http://" + IP + ":" + port + '/';

// Function to add a new user to the database
function addUser(event){
    event.preventDefault(); // prevents the form from submitting and refreshing the page
    // Get the values of the username and password fields
    let username = document.getElementById("UsernameAddUser").value;
    let password = document.getElementById("PasswordAddUser").value;
    // Create an object with the username and password to send to the server
    let data = {"username": username, "password": password};
    // Send a POST request to the server with the new user data
    fetch(URL + "add/user", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error(error));

    // Clear the input fields
    document.getElementById("UsernameAddUser").value = "";
    document.getElementById("PasswordAddUser").value = "";
}

// Function to add a new item to the database
function addItem(event){
    event.preventDefault(); // prevents the form from submitting and refreshing the page
    // Get the values of the item fields
    let titleItem = document.getElementById("titleAddItem").value;
    let descItem = document.getElementById("descAddItem").value;
    let imageItem = document.getElementById("imageAddItem").value;
    let priceItem = document.getElementById("priceAddItem").value;
    let statusItem = document.getElementById("statusAddItem").value;
    let usernameItem = document.getElementById("usernameAddItem").value;
    // Create an object with the item data to send to the server
    let data = {
        "title": titleItem, 
        "description": descItem, 
        "image": imageItem,
        "price": priceItem,
        "status": statusItem
    }
    // Send a POST request to the server with the new item data
    fetch(URL + "add/item/" + usernameItem, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    // Clear the input fields
    document.getElementById("titleAddItem").value = "";
    document.getElementById("descAddItem").value = "";
    document.getElementById("imageAddItem").value = "";
    document.getElementById("priceAddItem").value = "";
    document.getElementById("statusAddItem").value = "";
    document.getElementById("usernameAddItem").value = "";
}
