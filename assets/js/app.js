$(function() {
    $('#startGame').modal('show');  // Open the Bootrap 4 modal on start

    const config = {
        apiKey: "AIzaSyAjFVg3kJbDmAhjdxTarhD4d7u0tR7xabs",
        authDomain: "rps-homework-a5b81.firebaseapp.com",
        databaseURL: "https://rps-homework-a5b81.firebaseio.com",
        projectId: "rps-homework-a5b81",
        storageBucket: "",
        messagingSenderId: "648767764205"
    };
    // Firebase database init
    firebase.initializeApp(config);

    // Reference the database
    const db = firebase.database();

    // Firebase Reference collections
    const p1Ref = db.ref().child('/p1'); // P1 folder
    const p2Ref = db.ref().child('/p2'); // P2 folder
    const connectionsRef = db.ref("/connections"); // Folder to store each connection
    const connectedRef = db.ref(".info/connected");// Firebase's default Ref to track connections (boolean)

    // Variables
    let pNameVal = '';
    const p1Wins = 0;
    const p1Losses = 0;
    const p1Choice = '';
    const p2Wins = 0;
    const p2Losses = 0;
    const p2Choice = '';

    // DOM caching
    const $lego = $('#lego');
    const $pName = $('#name');
    const $pOneNameSpan = $('span.playerOneName');
    const $p1choice = $('#p1ChoiceDiv');
    const $p2choice = $('#p2ChoiceDiv');

 

    // Functions
    const playerName = () => {
        pNameVal = $pName.val(); // Get the name of the user

        connectedRef.on('value', (snap) => { // Check if someone connected/disconnected
            if(snap.val()){ // If someone connected
                const justConnected = connectionsRef.push(true);
                justConnected.onDisconnect().remove(); // Remove user from the connection list when they disconnect
            }
        });
        connectionsRef.on('value', (snap) => { // If I just moved someone to my connection folder
            console.log(snap.numChildren()); 
            const activeP = snap.numChildren();
            if(activeP == 1) { // If you're the 1st player
                // Create the object
                const p1 = {
                    choice: '',
                    name: pNameVal,
                    wins: p1Wins,
                    losses: p1Losses,
                };
                // Sync object changes
                p1Ref.set(p1);
            }
            else if(activeP == 2) {
                // Create the object
                const p2 = {
                    choice: '',
                    name: pNameVal,
                    wins: p2Wins,
                    losses: p2Losses,
                };
                // Sync object changes
                p2Ref.set(p2);
            }
        });
    }

    const getP1Choice = e => {
        p1Choice = $(e.target).attr('data-userChoice');    // Get p1 choice
    }


   // Event Binders
   $lego.on('click', playerName);
   $p1choice.on('click', getP1Choice);
});
