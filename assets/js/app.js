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
    const playersRef = db.ref().child('/players'); // Reference entire players folder 
    const p1Ref = playersRef.child('/p1'); // Reference entire P1 folder
    const p2Ref = playersRef.child('/p2'); // Reference entire P2 folder
    const p2ChoiceRef = p2Ref.child('choice'); // Reference to P2 choices
    const winsRef = db.ref().child('/win');    // Reference both player losses
    const losesRef = db.ref().child('/losses');    // Reference both player wins
    const turnRef = db.ref().child('/turn'); // to track the turns
    const connectionsRef = db.ref("/connections"); // Folder to store each connection
    const connectedRef = db.ref(".info/connected");// Firebase's default Ref to track connections (boolean)

    // Variables
    let p2NameVal = '';
    let p1NameVal = '';
    let p1Wins = 0;
    let p1Losses = 0;
    let p1Choice = '';
    let p2Wins = 0;
    let p2Losses = 0;
    let p2Choice = '';
    let turn = '';
    let activePnum = 0;
    let resultsin = '';

    // DOM caching
    const $lego = $('#lego');
    const $pName = $('#name');
    const $p1NameSpan = $('.playerOneName');
    const $p2NameSpan = $('.playerTwoName');
    const $pOneNameSpan = $('span.playerOneName');
    const $p1choice = $('#p1ChoiceDiv');
    const $p2choice = $('#p2ChoiceDiv');
    const $imgP1 = $('#playerOne').find('img');
    const $imgP2 = $('#playerTwo').find('img');
    const $rPanel = $('#resultsPanel').find('h4');

    // Functions
    const playerName = () => {
        

        connectedRef.on('value', (snap) => { // Check if someone connected/disconnected
            if(snap.val()){ // If someone connected
                const justConnected = connectionsRef.push(true);
                justConnected.onDisconnect().remove(); // Remove user from the connection list when they disconnect
            }
        });
        connectionsRef.on('value', (snap) => { // If I just moved someone to my connection folder
            console.log(`Number of players online ${snap.numChildren()}`); 
            activePnum = snap.numChildren();
            if(activePnum == 1) { // If you're the 1st player
                p1NameVal = $pName.val(); // Get the name of the user
                $p1NameSpan.html(` ${p1NameVal}`); // Greet current player

                // Create the object
                const p1 = {
                    choice: '',
                    name: p1NameVal,
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
            else if(activePnum == 2) {  // If you are the 2nd player
                p2NameVal = $pName.val(); // Get the name of the user
                $p2NameSpan.html(` ${p2NameVal}`); // Greet current player

                // Create the object
                const p2 = {
                    choice: '',
                    name: p2NameVal
                };
                const w = {
                    p1: p1Wins,
                    p2: p2Wins
                }
                const l = {
                    p1: p1Losses,
                    p2: p2Losses
                }
                // Sync object
                p2Ref.set(p2); 
                winsRef.set(w);
                losesRef.set(l);
                console.log('play now');
                turn = 'p1turn';
                turnRef.update({ whoseturn: turn });
            }
        });
    }

    turnRef.on('child_changed', (snap) => { // Listen for turn changes
        let pturn = snap.val();
        console.log(`It's ${pturn}`);
        if(pturn == 'p1turn' && activePnum == 2) {  // If it's p1 turn and there's 2 players online
            $p1choice.on('click', getPchoice(pturn)); // Listen for p1 click events on the choice btns
        }
        else if(pturn == 'p2turn' && activePnum == 2) { //If it's p1 turn and there's 2 players online
            $p2choice.on('click', getPchoice(pturn)); // Liste for p2 click events
        }
    });

    playersRef.on('value', (snap) => {   // When P2 makes a choice
        if(turn == 'p2turn' && activePnum == 2) {   // Only compute results when is player 2's turn and there are 2 people connected
            let p1name = snap.val().p1.name;
            let p2name = snap.val().p2.name;
            let p1hand = snap.val().p1.choice;
            let p2hand = snap.val().p2.choice;
            if( p1hand == 'rock' && p2hand == 'rock'){
                resultsin = 'Tie';
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'rock' && p2hand == 'paper'){
                resultsin = `Player 2:<br>${p2name}<br>Won`;
                p1Losses++;
                p2Wins++;
                winsRef.update({ p1: p1Wins, p2: p2Wins});
                losesRef.update({ p1: p1Losses, p2: p2Losses });
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'rock' && p2hand == 'scissors'){
                resultsin = `Player 1:<br>${p1name}<br>Won`;
                p2Losses++;
                p1Wins++;
                winsRef.update({ p1: p1Wins, p2: p2Wins});
                losesRef.update({ p1: p1Losses, p2: p2Losses });
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'paper' && p2hand == 'paper'){
                resultsin = 'Tie';
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'paper' && p2hand == 'rock'){
                resultsin = `Player 1:<br>${p1name}<br>Won`;
                p2Losses++;
                p1Wins++;
                winsRef.update({ p1: p1Wins, p2: p2Wins});
                losesRef.update({ p1: p1Losses, p2: p2Losses })
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'paper' && p2hand == 'scissors'){
                resultsin = `Player 2:<br>${p2name}<br>Won`;
                p1Losses++;
                p2Wins++;
                winsRef.update({ p1: p1Wins, p2: p2Wins});
                losesRef.update({ p1: p1Losses, p2: p2Losses })
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'scissors' && p2hand == 'scissors'){
                resultsin = 'Tie';
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'scissors' && p2hand == 'rock'){
                resultsin = `Player 2:<br>${p2name}<br>Won`;
                p1Losses++;
                p2Wins++;
                winsRef.update({ p1: p1Wins, p2: p2Wins});
                losesRef.update({ p1: p1Losses, p2: p2Losses })
                $rPanel.html(resultsin);
            }
            else if( p1hand == 'scissors' && p2hand == 'paper'){
                resultsin = `Player 1:<br>${p1name}<br>Won`;
                p2Losses++;
                p1Wins++;
                winsRef.update({ p1: p1Wins, p2: p2Wins});
                losesRef.update({ p1: p1Losses, p2: p2Losses })
                $rPanel.html(resultsin);
            }
        }
    });

    const getPchoice = (pturn) => {  // Save user choice to Firebase
        return e => {
            let leTarget = $(e.target);
            let pChoice = leTarget.attr('data-userChoice');    // Get player choice attr from the clicked button
            leTarget.closest('div.card').find('img').attr('src', `./assets/imgs/${pChoice}.png`); // Change the img to match the user's choice
            if (pturn == 'p1turn'){
                p1Choice = pChoice;
                p1Ref.update({ choice: p1Choice }); //Update the user choice
                turn = 'p2turn';
                turnRef.update({ whoseturn: turn });
                $p1choice.off('click'); // Removes the event listener 
            }
            else {
                p2Choice = pChoice;
                p2Ref.update({ choice: p2Choice }); //Update the user choice
                turn = 'p1turn';
                turnRef.update({ whoseturn: turn });
                $p2choice.off('click');
            }
        }
    }
   // Event Binders
   $lego.on('click', playerName);
   
});
