(function($) {
    // This is non-DOM dependant so it can go up here
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

    $(function() {
        const game = {
            pNameVal: '',
            p1Wins: 0,
            p1Losses: 0,
            p1Choice: '',
            p2Wins: 0,
            p2Losses: 0,
            p2Choice: '',

            startModal() {
                $('#startGame').modal('show');  // Open the Bootrap 4 modal on start
                this.dom_cache();
                this.event_binders();
                // this.firebase_init();
            },
            dom_cache(){
                this.$lego = $('#lego');
                this.$pName = $('#name');
                this.$pOneNameSpan = $('span.playerOneName');
                this.$p1choice = $('#p1ChoiceDiv');
                this.$p2choice = $('#p2ChoiceDiv');
            },
            event_binders(){
                this.$lego.on('click', this.playerName.bind(this));
                this.$p1choice.on('click', this.p1Choice.bind(this));

            },
            playerName(){
                this.pNameVal = this.$pName.val();
                this.firebase_init(); // Init firebase AFTER you have the name
            },
            p1Choice(e) {
                this.p1Choice = $(e.target).attr('data-userChoice');    // Get p1 choice
                
            },            
            firebase_init(){
                // Create references
                const p1Ref = db.ref().child('/p1'); // P1 folder
                const p2Ref = db.ref().child('/p2'); // P2 folder
                const connectionsRef = db.ref("/connections"); // Folder to store each connection
                const connectedRef = db.ref(".info/connected");// Firebase's default Ref to track connections (boolean)

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
                            name: this.pNameVal,
                            wins: this.p1Wins,
                            losses: this.p1Losses,
                        };
                        // Sync object changes
                        p1Ref.set(p1);
                    }
                    else if(activeP == 2) {
                        // Create the object
                        const p2 = {
                            choice: '',
                            name: this.pNameVal,
                            wins: this.p2Wins,
                            losses: this.p2Losses,
                        };
                        // Sync object changes
                        p2Ref.set(p2);
                    }
                });
            },

        }
        game.startModal();
    })
})(jQuery);