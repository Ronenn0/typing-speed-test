import { sentences } from './sentences.js';
let testTime;
let WPM;
let restarting;
let charactersWritten;

let currentSentence = '';

const main = document.querySelector('main');

const testSentenceElement = document.querySelector('.test-sentence');
const userInput = document.querySelector('.user-input');

const countDownElement = document.querySelector('.count-down');

const resultsElement = document.querySelector('.results');
const accuracyElement = document.querySelector('.accuracy');

const restartButton = document.querySelector('.restart');

let testEnded = false;


/**
 * 
 * @returns a random test sentence.
 */
function pickRandomSentence() {
    return sentences[Math.floor(Math.random() * sentences.length)];
}

/**
 * - picks a random sentence using another function.
 * Displays the sentence's chars as spans on the test sentence Element.
 * the purpose of the spans is to be able to change their color live.
 */
function displaySentence() {
    currentSentence = normalize(pickRandomSentence());
    // currentSentence = '123';
    let html = '';
    [...currentSentence].forEach(char => {
        html += `
            <span>${char}</span>
        `;
    });
    testSentenceElement.innerHTML = html;
}

/**
 * Starts the preperations of the player for the test.
 */
async function getReadyText() {
    // await sleep(1000);
    restarting = false;
    showElement(countDownElement);
    countDownElement.textContent = 'Be Ready!';
    await sleep(1500);
    countDownElement.textContent = 'The Test starts in...';
    await sleep(2000);
    startCountDown();
}

/**
 * 
 * @param {number} countDownTimer 
 * displays the count down for the test.
 */
async function startCountDown(countDownTimer = 3) {
    countDownElement.textContent = countDownTimer;
    if (restarting) return;
    if (countDownTimer == 2) userInput.disabled = false;
    if (countDownTimer <= 0) {
        startTest();
        return;
    }
    await sleep(1000);
    countDownTimer--;
    startCountDown(countDownTimer);
}

/**
 * Starts the test.
 */
function startTest() {
    hideElement(countDownElement);
    testTime = 0;
    WPM = 0;
    charactersWritten = 0;
    displaySentence();
    startCountingTestTime();
    displayWPM();
    hideElement(accuracyElement);
    showElement(resultsElement);
}

/**
 * Starts to count the test's time and displays it.
 */
async function startCountingTestTime() {
    if (restarting) return;

    //if test is done - show results, hide everything else.
    if (testIsDone()) {
        testEnded = true;
        addClass(main, 'test-ended');
        removeClass(main, 'test-started');
        userInput.disabled = true;

        saveResult();
        showResult();
        return;
    }
    await sleep(100);
    testTime = fixNumber(testTime + 0.1, 1);

    //display Time
    displayTime();

    startCountingTestTime();
    displayWPM();
    displayColorsOnCharacters();
}

/**
 * Displays the words per one minute's rate
 */
function displayWPM(restarted) {
    WPM = getWPM();
    //display WPM
    const wpmElement = document.querySelector('.wpm');
    const bestWPM = Math.round((Number)(load('wpm')));
    const value = restarted ? 0 : ((testTime < 2 && !testEnded) ? '...' : Math.round(WPM));
    wpmElement.textContent = `💨 WPM: ${value} words per minute${testEnded && !!bestWPM ? ` (best: ${bestWPM})` : ''}`;
}

/**
 * 
 * @returns the current WPM
 */
function getWPM() {
    let wordsRight = 0;
    const fullSentence = [...(currentSentence || '')];
    const currentSentenceInput = [...userInput.value];
    for (let i = 0; i < fullSentence.length; i++) {
        const expectedWord = fullSentence[i];
        if (currentSentenceInput.length <= i) break;
        const currentWord = currentSentenceInput[i];
        if (expectedWord === currentWord) wordsRight++;
    }
    if (testTime == 0) return '0';
    WPM = Math.round(wordsRight / testTime * 60);
    return WPM || 0;
}

/**
 * Displays the time counter
 */
function displayTime(restarted) {
    const secondsElement = document.querySelector('.time');
    const bestTime = fixNumber(load('time'), 1);
    const value = restarted ? 0 : (testTime || 0);
    secondsElement.textContent = `⏱️ Time: ${value} seconds${testEnded && !!bestTime ? ` (best: ${bestTime}s)` : ''}`;
}

/**
 * Updates the color of each character in the test sentence based on the user's input.
 * - Correct characters are highlighted in green.
 * - Incorrect characters are highlighted in red.
 * - Unreached characters remain in the default (--primary-color).
 */
function displayColorsOnCharacters() {
    const input = [...userInput.value];
    const testSentence = document.querySelectorAll('.test-sentence span');
    for (let i = 0; i < testSentence.length; i++) {
        const span = testSentence[i];
        if (input.length <= i) {
            span.style.color = 'var(--primary-color)';
        }
        else if (span.textContent === normalize(input[i])) { //right character
            span.style.color = 'green';
        } else {
            span.style.color = 'red';
        }
    }
}
/**
 * 
 * @returns true if the test is done, false if its not
 */
function testIsDone() {
    return currentSentence == normalize(userInput.value);
}

/**
 * Shows the result of the test and hides the test itself
 */
function showResult() {
    displayAccuracy();
    displayWPM();
    displayTime();
}

/**
 * saves best results.
 */
function saveResult() {
    const acc = getAccuracy();
    const savedAcc = Number(load('accuracy'));
    if (acc > savedAcc) {
        save('accuracy', getAccuracy());

    }

    const wpm = getWPM();
    const savedWpm = Number(load('wpm'));
    if (wpm > savedWpm) {
        save('wpm', wpm);
    }
    const time = testTime;
    const savedTime = Number(load('time'));
    if (time < savedTime) {
        save('time', time);
    }

}
/**
 * @returns the test's accuracy
 */
function getAccuracy() {
    return fixNumber(currentSentence.length / charactersWritten * 100);
}

/**
 * calculates and displays the accuracy - length sentence / characters written.
 */
function displayAccuracy() {
    const accuracy = getAccuracy();
    const span = document.querySelector('.results .accuracy');

    const bestAccuracy = fixNumber(load('accuracy'), 1);
    span.textContent = `🎯 Accuracy: ${accuracy}%${testEnded && !!bestAccuracy ? ` (best: ${bestAccuracy}%)` : ''}`;
    showElement(accuracyElement);
}

/**
 * disables copy pasting for both Elements - input Element + sentence Element.
 */
function blockCopyPastingTheSentence() {
    const elements = [testSentenceElement, userInput];
    elements.forEach(element => {
        ['copy', 'cut', 'paste'].forEach(evt =>
            element.addEventListener(evt, e => e.preventDefault())
        );
    });


}
/**
 * handles the Click event listener for the restart button
 */
function restartEventListener() {
    restartButton.addEventListener('click', async () => {
        userInput.value = '';
        testSentenceElement.innerHTML = 'Sentence will display here..';
        removeClass(main, 'test-ended');
        addClass(main, 'test-started');
        restarting = true;
        testEnded = false;
        saveResult();
        resetResult();
        getReadyText();
    });

}
/**
 * on each input - it adds 1 to the charactersWritten parameter.
 */
function userInputEventListener() {
    userInput.addEventListener('input', event => {
        if (!event.data) return;
        charactersWritten++;
    });
}


blockCopyPastingTheSentence();
restartEventListener();
userInputEventListener();


const startButton = document.querySelector('.start-test button');
startButton.addEventListener('click', () => {


    /**
     * Starts the game by:
     * - hiding the start container
     * - showing the test container
     * - starting count down.
     */
    function start() {
        removeClass(main, 'test-ended');
        addClass(main, 'test-started');
        // getReadyText(); // start-game
        testEnded = false;
        resetResult();
        startCountDown();
        // startTest();
    }
    start();
});

/**
 * resets the results' and displays the time and WPM
 */
function resetResult() {
    // [...resultsElement.children].forEach(child => {
    //     if (child.classList.contains('done')) return;
    //     child.textContent = '0 ';
    // });
    displayTime(true);
    displayWPM(true);
}