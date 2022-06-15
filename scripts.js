const cardsList = document.querySelectorAll('.card');
const cardFronts = document.querySelectorAll('.card-front');
const timePane = document.querySelectorAll('span')[0];
const highscorePane = document.querySelectorAll('#highscores')[0];
const startButton = document.querySelectorAll('#start-btn')[0];
const formContainer = document.querySelectorAll('.form-container')[0];
const form = document.querySelectorAll('.submit-highscore')[0];
const buttonClose = document.querySelectorAll('#close')[0];
const formMessage = document.querySelectorAll('.submit-highscore .error-message')[0];
let hasFlipped = false;
let cardA, cardB;
let lockBoard = false;
let seconds = 0;
let player = '';
let highscore = 12000;
let timerInterval;

const MESSAGES = {
    emptyHighscoresString: 'Win your first game!'
};

const COLORS = {
    MARIO: '255, 110, 110',
    LUIGI: '110, 255, 110',
    PEACH: '255, 167, 251',
    ROSALINA: '129, 238, 247',
    TOAD: '100, 160, 255',
};

// TO DO: sons

const VOICES = {
    MARIO: new Audio('./static/sounds/SeResourceStdSystem_000000BC.wav'), /* https://www.sounds-resource.com/wii_u/supermario3dworld/sound/38612/ */
    LUIGI: new Audio('./static/sounds/SeResourceStdSystem_000000C9.wav'), /* https://www.sounds-resource.com/wii_u/supermario3dworld/sound/38613/ */
    PEACH: new Audio('./static/sounds/SeResourceStdSystem_000000CC.wav'), /* https://www.sounds-resource.com/wii_u/supermario3dworld/sound/38633/ */
    ROSALINA: new Audio('./static/sounds/SeResourceStdSystem_000000DD.wav'), /* https://www.sounds-resource.com/wii_u/supermario3dworld/sound/40077/ */
    TOAD: new Audio('./static/sounds/SeResourceStdSystem_00000216.wav'), /* https://www.sounds-resource.com/wii_u/supermario3dworld/sound/4729/ */
};

function getCharacterOf(card) {
    return card.dataset.card;
}

function playSoundOf(character) {
    VOICES[character].play();
}

function paintFace(card, color) {
    card.children[0].style.background = color;
}

function paintCard(card) {
    const character = getCharacterOf(card);
    paintFace(card, `rgb(${COLORS[character]})`);
}

function paintCards() {
    cardsList.forEach(card => {
        paintCard(card);
    })
}

function isMatch(cardA, cardB) {
    if (!cardA || !cardB) return false;
    return getCharacterOf(cardA) === getCharacterOf(cardB);
}

function disableCard(card) {
    card.removeEventListener('click', processClick);
}

function disableCards(cardA, cardB) {
    disableCard(cardA);
    disableCard(cardB);
    resetBoard();
}

function isDisabled(card) {
    return card.classList.contains('disabled');
}

function unflipCard(card) {
    if (!card) return;
    card.classList.remove('flipped');
}

function unflipCards(cardA, cardB) {
    lockBoard = true;
    setTimeout(() => {
        unflipCard(cardA);
        unflipCard(cardB);
        resetBoard();
    }, 1500);
}

function resetBoard() {
    [hasFlipped, lockBoard] = [false, false];
    [cardA, cardB] = [null, null];
}

function flipCard(card) {
    card.classList.add('flipped');
}

function checkForMatch() {
    if (isMatch(cardA, cardB)) {
        playSoundOf(getCharacterOf(cardB));
        disableCards(cardA, cardB);
        return;
    }
    unflipCards(cardA, cardB);
}

function areAllCardsFlipped() {
    let result = true;
    cardsList.forEach(card => {
        if (!card.classList.contains('flipped')) result = false;
    })
    return result;
}

function checkForWin() {
    if (areAllCardsFlipped()) {
        clearInterval(timerInterval);
        insertHighscore();
        startButton.disabled = false;
        return true;
    }
}

function processClick() {
    if (lockBoard) return;
    if (cardA === this) return;

    flipCard(this);
    if (!hasFlipped) {
        hasFlipped = true;
        cardA = this;
        return;
    }
    
    cardB = this;
    hasFlipped = false;
    checkForMatch();
    checkForWin();
    //if(checkForWin()) alert('Vc ganhou');
    
    debug(this);
}

function findAPlaceFor(card) {
    card.style.order = Math.floor(Math.random() * 8);
}

function shuffleCards() {
    cardsList.forEach(card => {
        findAPlaceFor(card);
    });
}
/*
cardsList.forEach((card) => {
    card.addEventListener('click', processClick);
})
shuffleCards();
*/
function debug(card) {
    console.log('-- DEBUG SECTION');
    console.log(cardA, cardB);
    console.log('isMatch', isMatch(cardA, cardB));
    console.log(card);
}

function createEmptyListItem() {
    return createHighscoreElement(MESSAGES.emptyHighscoresString);
}

function startGame() {
    startButton.disabled = true;
    resetTimer();
    closeForm();
    resetBoard();
    shuffleCards();
    cardsList.forEach((card) => {
        card.addEventListener('click', processClick);
        unflipCard(card);
    })
    timerInterval = window.setInterval(showTime, 1000);
}
paintCards();
listenToSubmit();

// FORM

function exhibit(element) {
    element.classList.add('show');
}

function hide(element) {
    element.classList.remove('show');
}

function openForm() {
    exhibit(form);
}

function closeForm() {
    hide(formMessage);
    hide(form);
}

function eliminateEmptyHighscoresString() {
    if (highscorePane.children[0].innerHTML === MESSAGES.emptyHighscoresString) {
        highscorePane.removeChild(highscorePane.children[0]);
    }
}

function createAndInsertHighscore(seconds, player) {
    eliminateEmptyHighscoresString();
    const highscoreString = createHighscoreFrom(getDisplayStringOfSeconds(seconds), player);
    const newHighscoreElement = createHighscoreElement(highscoreString);
    highscorePane.insertBefore(newHighscoreElement, highscorePane.children[0]);
}

function submitForm(event) {
    event.preventDefault();
    console.log(event.target);
    const formInput = document.querySelector('form .name');
    player = formInput.value;
    if (!player) {
        exhibit(formMessage);
        return;
    }
    createAndInsertHighscore(highscore, player);
    hide(formMessage);
    closeForm();
}

function listenToSubmit() {
    form.addEventListener('submit', (event) => {
        submitForm(event);
    });
    buttonClose.addEventListener('click', closeForm);
}

// TIMER

function showTime() {
    seconds++;
    timePane.innerText = `time: ${getDisplayStringOfSeconds(seconds)}`;
}

function resetTimer() {
    clearInterval(timerInterval);
    seconds = -1;
    showTime();
}

// HIGHSCORES

function createHighscoreFrom(seconds, name) {
    return `${name} - ${seconds}`;
}

function createHighscoreElement(highscoreString) {
    const li = document.createElement('li');
    li.innerText = highscoreString;
    return li;
}

function insertHighscore() {
    if (seconds <= highscore) {
        const cheers = new Audio('./static/sounds/SeResourceStdSystem_00000187.wav'); /* https://www.sounds-resource.com/wii_u/supermario3dworld/sound/4729/ */
        cheers.play();
        highscore = seconds;
        openForm();
    } else {
        setTimeout(() => {
            const ops = new Audio('./static/sounds/SeResourceStd1st_00000006.wav'); /* https://www.sounds-resource.com/wii_u/supermario3dworld/sound/4727/ */
            ops.play();
        }, 1000);
    }
}

function getDisplayStringOfSeconds(seconds) {
    return `${Math.floor(seconds/60)}:${seconds%60}s`;
}
