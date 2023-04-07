/**
 * Author: Sarvarbek Usmonov
 * Purpose: Client side script for Ostaa app
 */
// Define the endpoint URL for making requests to the server
const port = 3000;
const IP = "localhost";
const URL = "http://" + IP + ":" + port + '/';

// Function to add a new user to the database
function addUser(event){
    event.preventDefault(); // prevents the form from submitting and refreshing the page

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


function logIn(event){
    event.preventDefault(); // prevents the form from submitting and refreshing the page
    
    let username = document.getElementById("UsernameLoginUser").value;
    let password = document.getElementById("PasswordLoginUser").value;

    let data = {"username": username, "password": password};
    
    // Send a POST request to the server with the new user data
    fetch(URL + "login/user", {
        method: "POST",
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status === 401) {
            alert("Invalid username or password");
            return;
        }
        console.log('Response status:', response.status);
        response.json().then(data => {
            console.log('Response body:', data);
            let cookieValue = data.cookie;

            if (response.ok) {
                // Save the session ID in a cookie
                document.cookie = "sessionID=" + cookieValue;
                // Redirect the user to the home page
                window.location.href = "/home.html";
            } else {
                // Display an error message
                alert("Invalid username or password");
            }
        });
    })
    .catch((error) => {console.error(error); alert('error')});

    // Clear the input fields
    document.getElementById("UsernameLoginUser").value = "";
    document.getElementById("PasswordLoginUser").value = "";
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
    window.location.href = "/home.html";
}



// Function to search items
function searchItems(event){
    event.preventDefault();

    let item = document.getElementById("searchItems").value;

    if(item == ''){
        console.log('empty');
        return;
    }

    fetch(URL + 'search/items/' + encodeURIComponent(item))
    .then(response => response.json())
    .then(data => {
        // Convert the data to a string and display it in the HTML page
        let jsonString = JSON.stringify(data, null, 2);
        console.log(jsonString);
        stringForHtml = '';

        for(let i = 0; i < data.length; i++) {
            stringForHtml += `<div class='container' style='border: 2px solid black'><h1>${data[i].title}</h1><h3>${data[i].price}</h3><h3>${data[i].description}</h3></div>`
        }
        // document.getElementById('data').innerText = jsonString;
        document.getElementById('secondSide').innerHTML = stringForHtml;
    })
    .catch(error => console.error(error));
}

function viewYourListings(event){
    fetch(URL + 'search/usersByCookie')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        stringForHtml = '';

        for(let i = 0; i < data.length; i++) {
            stringForHtml += `<div class='container' style='border: 2px solid black'><h1>${data[i].title}</h1><h3>${data[i].price}</h3><h3>${data[i].description}</h3></div>`
        }

        document.getElementById('secondSide').innerHTML = stringForHtml;
    })
    .catch(error => console.error(error));

    
}


function welcomeText(){
    fetch(URL + 'getUserName')
    .then(response => response.json())
    .then(data => {
        document.getElementById("welcomeTexthere").innerHTML = "Welcome " + data.username + "! What would you like to do?"
    })
}
