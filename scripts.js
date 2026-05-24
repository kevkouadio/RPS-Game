const TOTAL_ROUNDS = 10;
const CHOICES = ['rock', 'paper', 'scissors'];

const beats = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper',
};

const game = () => {
    let playerScore = 0;
    let computerScore = 0;
    let moves = 0;
    let animationIndex = 0;
    let intervalHandle = null;

    const computerDisplay = document.getElementById('computer-choice');
    const playerDisplay = document.getElementById('player-choice');
    const roundResult = document.querySelector('.round-result');
    const playerScoreBoard = document.querySelector('.p-count');
    const computerScoreBoard = document.querySelector('.c-count');
    const movesLeft = document.querySelector('.movesleft');
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    const playButton = document.querySelector('.play');
    const reloadButton = document.querySelector('.reload');
    const choiceButtons = Array.from(document.querySelectorAll('.choice-btn'));

    const setupDisplay = (container) => {
        const placeholder = container.querySelector('.fighter-placeholder');
        const images = Object.fromEntries(
            CHOICES.map((choice) => [
                choice,
                container.querySelector(`[data-choice="${choice}"]`),
            ])
        );

        return { container, placeholder, images };
    };

    const computerState = setupDisplay(computerDisplay);
    const playerState = setupDisplay(playerDisplay);

    const setDisplayChoice = (state, choice, { shuffling = false, revealed = false } = {}) => {
        const { container, placeholder, images } = state;

        placeholder.hidden = Boolean(choice);
        CHOICES.forEach((name) => {
            images[name].hidden = name !== choice;
        });

        container.classList.toggle('is-shuffling', shuffling);
        container.classList.toggle('is-revealed', revealed);
    };

    const showPlaceholder = (state) => {
        setDisplayChoice(state, null);
    };

    const stopAnimation = () => {
        if (intervalHandle !== null) {
            clearInterval(intervalHandle);
            intervalHandle = null;
        }
        computerState.container.classList.remove('is-shuffling');
    };

    const animateComputerChoice = () => {
        const choice = CHOICES[animationIndex % CHOICES.length];
        setDisplayChoice(computerState, choice, { shuffling: true });
        animationIndex += 1;
    };

    const startAnimation = () => {
        stopAnimation();
        computerState.container.classList.add('is-shuffling');
        animateComputerChoice();
        intervalHandle = setInterval(animateComputerChoice, 180);
    };

    const setChoicesEnabled = (enabled) => {
        choiceButtons.forEach((button) => {
            button.disabled = !enabled;
            button.classList.toggle('is-selected', false);
        });
    };

    const updateProgress = () => {
        const percent = (moves / TOTAL_ROUNDS) * 100;
        movesLeft.textContent = `Round ${moves} of ${TOTAL_ROUNDS}`;
        progressFill.style.width = `${percent}%`;
        progressBar.setAttribute('aria-valuenow', String(moves));
    };

    const getRoundOutcome = (player, computer) => {
        if (player === computer) {
            return 'tie';
        }
        return beats[player] === computer ? 'win' : 'loss';
    };

    const showRoundResult = (outcome) => {
        roundResult.hidden = false;
        roundResult.classList.remove('game-over', 'game-over-win', 'game-over-loss', 'game-over-tie');

        if (outcome === 'tie') {
            roundResult.innerHTML = '<h2 class="result-tie">Tie round</h2>';
            return;
        }

        if (outcome === 'win') {
            roundResult.innerHTML = '<h2 class="result-win">You won this round</h2>';
            playerScore += 1;
            playerScoreBoard.textContent = playerScore;
            return;
        }

        roundResult.innerHTML = '<h2 class="result-loss">Computer won this round</h2>';
        computerScore += 1;
        computerScoreBoard.textContent = computerScore;
    };

    const handleChoice = (playerChoice, button) => {
        if (moves >= TOTAL_ROUNDS) {
            return;
        }

        moves += 1;
        updateProgress();

        const computerChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];

        stopAnimation();
        setDisplayChoice(computerState, computerChoice, { revealed: true });
        setDisplayChoice(playerState, playerChoice, { revealed: true });

        choiceButtons.forEach((btn) => btn.classList.toggle('is-selected', btn === button));
        showRoundResult(getRoundOutcome(playerChoice, computerChoice));

        setChoicesEnabled(false);
        playButton.hidden = false;

        if (moves === TOTAL_ROUNDS) {
            endGame();
        }
    };

    const endGame = () => {
        stopAnimation();
        setChoicesEnabled(false);
        playButton.hidden = true;

        document.querySelector('.move').hidden = true;
        document.querySelector('.versus').hidden = true;
        document.querySelector('.choices-panel').hidden = true;
        document.querySelector('.rounds-track').hidden = true;

        roundResult.hidden = false;
        roundResult.classList.add('game-over');

        if (playerScore > computerScore) {
            roundResult.innerHTML = 'Game over<br><strong>You win!</strong>';
            roundResult.classList.add('game-over-win');
        } else if (playerScore < computerScore) {
            roundResult.innerHTML = 'Game over<br><strong>Computer wins</strong>';
            roundResult.classList.add('game-over-loss');
        } else {
            roundResult.innerHTML = 'Game over<br><strong>It\'s a draw</strong>';
            roundResult.classList.add('game-over-tie');
        }

        reloadButton.hidden = false;
        reloadButton.addEventListener('click', () => window.location.reload(), { once: true });
    };

    choiceButtons.forEach((button) => {
        button.addEventListener('click', () => handleChoice(button.value, button));
    });

    playButton.addEventListener('click', () => {
        roundResult.hidden = true;
        roundResult.classList.remove('game-over', 'game-over-win', 'game-over-loss', 'game-over-tie');
        playButton.hidden = true;
        showPlaceholder(playerState);
        playerState.container.classList.remove('is-revealed');
        computerState.container.classList.remove('is-revealed');
        setChoicesEnabled(true);
        startAnimation();
    });

    updateProgress();
    startAnimation();
};

game();
