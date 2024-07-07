/* DOM references */
const guessFieldInput = document.querySelector(".guess-field");

const guessSubmitInput = document.querySelector(".guess-submit");

const guessesParagraph = document.querySelector(".guesses");

const lastResultParagraph = document.querySelector(".last-result");

const lowerOrHihgerParagraph = document.querySelector(".lower-or-higher");

const resetButton = document.querySelector(".reset-button");

/* Constants */
const initialGuessCount = 0;

const maxGuessCount = 5;

const guessNumberLowerBoundary = 1;

const guessNumberHigherBoundary = 100;

/* State */
let guessCount = initialGuessCount;

let randomNumber = getRandomNumber();

/* Initial setup */
guessFieldInput.value = "";

guessFieldInput.focus();

/* Event listeners */
guessFieldInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkGuess();
  }
});

guessSubmitInput.addEventListener("click", checkGuess);

resetButton.addEventListener("keyup", (event) => {
  if (event.key === "Enter" && event.target.style.display !== "none") {
    resetButton.addEventListener("click", resetGame);
  }
});

/* Functions */
function getRandomNumber(min = guessNumberLowerBoundary, max = guessNumberHigherBoundary) {
  return Math.floor(Math.random() * max) + min;
}

function checkGuess() {
  const userGuess = Number(guessFieldInput.value);

  if (++guessCount === 1) {
    guessesParagraph.textContent = "Previous guesses:";
  }

  guessesParagraph.textContent = `${guessesParagraph.textContent} ${userGuess}`;

  if (userGuess === randomNumber) {
    lastResultParagraph.textContent = "Congratulations! You got it right!";

    lastResultParagraph.style.backgroundColor = "green";

    lowerOrHihgerParagraph.textContent = "";

    setGameOver();
  } else if (guessCount === maxGuessCount) {
    lastResultParagraph.textContent = "!!!GAME OVER!!!";

    lastResultParagraph.style.backgroundColor = "red";

    lowerOrHihgerParagraph.textContent = "";

    setGameOver();
  } else {
    lastResultParagraph.textContent = "Wrong!";

    lastResultParagraph.style.backgroundColor = "red";

    if (userGuess < randomNumber) {
      lowerOrHihgerParagraph.textContent = "Last guess was too low!";
    } else {
      lowerOrHihgerParagraph.textContent = "Last guess was too high!";
    }
  }

  guessFieldInput.value = "";

  guessFieldInput.focus();
}

function setGameOver() {
  guessFieldInput.disabled = true;

  guessSubmitInput.disabled = true;

  resetButton.style.display = "revert";

  resetButton.focus();
}

function resetGame() {
  guessCount = initialGuessCount;

  const resetParagrahs = document.querySelectorAll(".result-paragraghs p");

  for (const resetParagrah of resetParagrahs) {
    resetParagrah.textContent = "";
  }

  resetButton.style.display = "none";
  resetButton.removeEventListener("click", resetGame);

  guessFieldInput.disabled = false;
  guessFieldInput.value = "";
  guessFieldInput.focus();

  guessSubmitInput.disabled = false;

  lastResultParagraph.style.backgroundColor = "revert";

  randomNumber = getRandomNumber();
}
