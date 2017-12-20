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
    const turnRef = db.ref().child('/turn'); // to track the turns
    const connectionsRef = db.ref("/connections"); // Folder to store each connection
    const connectedRef = db.ref(".info/connected");// Firebase's default Ref to track connections (boolean)

    // Variables
    let pNameVal = '';
    let p1Wins = 0;
    let p1Losses = 0;
    let p1Choice = '';
    let p2Wins = 0;
    let p2Losses = 0;
    let p2Choice = '';
    let turn = 'p1turn';

    // DOM caching
    const $lego = $('#lego');
    const $pName = $('#name');
    const $pOneNameSpan = $('span.playerOneName');
    const $p1choice = $('#p1ChoiceDiv');
    const $p2choice = $('#p2ChoiceDiv');
    const $imgP1 = $('#playerOne').find('img');
    const $imgP2 = $('#playerTwo').find('img');;

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
                const t = { whoseturn: turn };
                // Sync object
                p1Ref.set(p1);
                turnRef.set(t);

                // Wait for player two
                console.log('Waiting for player 2');
                turn = 'p2turn';
                turnRef.update({ whoseturn: turn }); // Update the turn in the db

            }
            else if(activeP == 2) {
                // Create the object
                const p2 = {
                    choice: '',
                    name: pNameVal,
                    wins: p2Wins,
                    losses: p2Losses,
                };
                // Sync object
                p2Ref.set(p2);
                console.log('play now');
                turn = 'p1turn';
                turnRef.update({ whoseturn: turn });
            }
        });
    }

    const getP1Choice = e => {  // Save user choice to Firebase
        if (turn == 'p2turn') {

        }
        let leTarget = $(e.target);
        p1Choice = leTarget.attr('data-userChoice');    // Get p1 choice
        $imgP1.attr('src', `./assets/imgs/${p1Choice}.png`); // Change the img to match the user's choice
        p1Ref.update({ choice: p1Choice }); //Update the user choice
    }


   // Event Binders
   $lego.on('click', playerName);
   $p1choice.on('click', getP1Choice);
});
