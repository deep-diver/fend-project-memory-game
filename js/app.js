// define when user loses stars
let FIRST_STAR_THRESHOLD = 10;
let SECOND_STAR_THRESHOLD = 20;

// define how many matches there are
let MAX_MATCHING = 8;

/* GameState Class Scope Begins */
var GameState = function() {
    this.init();
}

// initialize all GameState variable.
GameState.prototype.init = function() {
    this.successCount = 0;
    this.trialCount = 0;
    this.timeCount = 0;

    // when a card is selected, the card is pushed into this array.
    // this array is empty when users have selected two cards. - otherwise, it needs to be reported as a bug
    // this array is used to compare two cards to check if they are a match
    this.selectedCards = [];

    //invalidate timer - timer is to count how many seconds users have played.
    clearInterval(this.timeInterval);
}

// when user select two cards, one move is added to the trialCount variable.
// change move value displayed on screen.
// change star displayed on screen, when user's move meets each losing thresholds.
GameState.prototype.increaseMove = function() {
    this.trialCount += 1;
    $('.moves').text(this.trialCount);
    
    if (this.trialCount == FIRST_STAR_THRESHOLD) {
        $('.score-panel .stars-container .fa-star:eq( 0 )').addClass('fa-star-o');
        $('.modal-body .stars-container .fa-star:eq( 0 )').addClass('fa-star-o');
    }
    else if (this.trialCount == SECOND_STAR_THRESHOLD) {
        $('.score-panel .stars-container .fa-star:eq( 1 )').addClass('fa-star-o');
        $('.modal-body .stars-container .fa-star:eq( 1 )').addClass('fa-star-o');
    }
}
/* GameState Class Scope Ends */


// global object variable for GameState.
var gameState = new GameState();


// when document is fully loaded.
$(function() {
    init();

    // when restart button is clicked, re-initialize the card list.
    $('.restart').click(function() {
        init();
    });

    // after finishing a game, a modal pops up, then ask to play again.
    // when say "yes"
    $('#play-again-btn').click(function() {
        $(".modal").css('display', 'none');
        init();
    });

    // when say "no"
    $('#no-play-again-btn').click(function() {
        $(".modal").css('display', 'none');
    });
});

/*
    @description initialize everything including UI.
    @total initializer
*/
function init() {
    // obtain current list of cards, and shuffle them
    const cards = shuffle($('.card i'));

    // remove current elements under the class 'deck' which holds the list of cards
    $('.card').removeClass("match open show");
    $('.deck').empty();

    // reassign (append) shuffled list of cards into the 'deck' class.
    for (const card of cards) {
        let newCardWrapper = $('<li></li>');
        newCardWrapper.addClass('card');
        newCardWrapper.append(card);

        $('.deck').append(newCardWrapper);
    }
    
    $('.card').click(whenCardClicked);

    // refresh move and star information along with display
    $('.fa-star:eq( 0 )').removeClass('fa-star-o');
    $('.fa-star:eq( 1 )').removeClass('fa-star-o');
    $('.moves').text('0');

    gameState.init();

    //re-assign second timer
    $('.timer span').text("0 hr 0 min 0 sec");

    gameState.timeInterval = setInterval(function() {
        gameState.timeCount += 1;

        let hour = parseInt(gameState.timeCount / 360);
        let minute = parseInt((gameState.timeCount  % 360) / 60);
        let second = parseInt((gameState.timeCount  % 360) % 60);

        $('.timer span').text(hour + " hr " + minute + " min " + second + " sec");
    }, 1000);
}

/*
    @description - when cards are selected, this function figures out weather they are a match.
    @click event callback function for cards
    @param {object} event - The event object
*/
function whenCardClicked(event) {
    // disable the currently interacting card to be clicked.
    $(this).unbind("click", whenCardClicked);

    // open and show class to reveal the content of a card.
    $(this).addClass("open show");
    
    // adding the open card to the list
    gameState.selectedCards.push($(this).find(".fa"));

    // unbind click event attatched to the cards
    // this is to make sure users can't touch other remaining cards before checking a match between two cards.
    if (gameState.selectedCards.length == 2) {
        $('.card').unbind("click", whenCardClicked);
    }

    // this timeout is set to make sure to show appropriate UI behaviour when users have selected two cards.
    // when this is not set, some UI change can't be seen because it is too quick.
    setTimeout(function(){
        if (gameState.selectedCards.length == 2) {
            // increase move when two cards are selected
            gameState.increaseMove();

            // get the selected two cards after removing them from the list
            // they are DOMs
            const firstCard = gameState.selectedCards.pop();
            const secondCard = gameState.selectedCards.pop();
    
            // get the symbol of the two cards from the DOMs.
            const firstCardSymbol = firstCard.attr('class').split(" ")[1];
            const secondCardSymbol = secondCard.attr('class').split(" ")[1];

            firstCard.parent().removeClass("open show");
            secondCard.parent().removeClass("open show");
    
            // when two symbols are matched
            if (firstCardSymbol === secondCardSymbol) { 
                twoCardsMatched(firstCard, secondCard);
            }
            
            // reactivate click event 
            $('.card').click(whenCardClicked);
        }
    }, 1000);
}

/*
    @description - triggered when two cards are matched. when there is no more match to find, this functions pops up a modal dialogue.
    @twoCardsMatched
    @param {object} firstCard - the card users have selected at first
    @param {object} secondCard - the card users have selected at second
*/
function twoCardsMatched(firstCard, secondCard) {
    // increase the number of correct match
    gameState.successCount += 1;
    
    firstCard.parent().addClass("match");
    secondCard.parent().addClass("match");

    // showing modal if users got everything correct.
    if (gameState.successCount == MAX_MATCHING) {
        clearInterval(gameState.timeInterval);

        let hour = parseInt(gameState.timeCount / 360);
        let minute = parseInt((gameState.timeCount  % 360) / 60);
        let second = parseInt((gameState.timeCount  % 360) % 60);

        $(".modal").css('display', 'block');
        $(".modal-body p").text("You finished with " + gameState.trialCount + " moves in \"" + hour + " hr " + minute + " min " + second + " sec\"");
    }
}

/*
    Shuffle function from http://stackoverflow.com/a/2450976
    
    @description - shuffle existing array and return a new suffled array instance
    @shuffle
    @param {object} array - array to be shuffled
*/
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}