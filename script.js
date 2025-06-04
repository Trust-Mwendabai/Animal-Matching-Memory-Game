document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const gameBoard = document.getElementById('game-board');
    const movesCount = document.getElementById('moves-count');
    const timerElement = document.getElementById('timer');
    const bestTimeElement = document.getElementById('best-time');
    const hintButton = document.getElementById('hint');
    const hintCountElement = document.getElementById('hint-count');
    const pauseButton = document.getElementById('pause');
    const restartButton = document.getElementById('restart');
    const difficultySelect = document.getElementById('difficulty');
    const themeSelect = document.getElementById('theme');
    const tabButtons = document.querySelectorAll('.tab-button');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const victoryModal = document.getElementById('victory-modal');
    const pauseModal = document.getElementById('pause-modal');
    const victoryMovesElement = document.getElementById('victory-moves');
    const victoryTimeElement = document.getElementById('victory-time');
    const newRecordElement = document.getElementById('new-record');
    const playAgainButton = document.getElementById('play-again');
    const changeSettingsButton = document.getElementById('change-settings');
    const resumeGameButton = document.getElementById('resume-game');
    const closeModalButton = document.querySelector('.close-modal');
    const confettiCanvas = document.getElementById('confetti-canvas');
    
    // Game state variables
    let cards = [];
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let moves = 0;
    let hintsRemaining = 3;
    let timer = null;
    let seconds = 0;
    let isGameActive = false;
    let isPaused = false;
    let currentDifficulty = 'easy';
    let currentTheme = 'jungle';
    let confettiInstance = null;
    
    // Sound effects
    const sounds = {
        flip: new Audio('https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3'),
        match: new Audio('https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3'),
        noMatch: new Audio('https://assets.mixkit.co/active_storage/sfx/2/2-preview.mp3'),
        victory: new Audio('https://assets.mixkit.co/active_storage/sfx/1010/1010-preview.mp3'),
        hint: new Audio('https://assets.mixkit.co/active_storage/sfx/2039/2039-preview.mp3')
    };
    
    // Preload sounds
    Object.values(sounds).forEach(sound => {
        sound.load();
        sound.volume = 0.5;
    });
    
    // Theme definitions
    const themes = {
        jungle: {
            name: 'Jungle',
            class: 'theme-jungle',
            cardBack: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M9 18l6-6-6-6\'/></svg>")'
        },
        ocean: {
            name: 'Ocean',
            class: 'theme-ocean',
            cardBack: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M7 16l10-10M7 6h10v10\'/></svg>")'
        },
        farm: {
            name: 'Farm',
            class: 'theme-farm',
            cardBack: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\'/></svg>")'
        }
    };
    
    // Difficulty settings
    const difficulties = {
        easy: { rows: 4, cols: 4, hints: 3 },
        medium: { rows: 4, cols: 5, hints: 2 },
        hard: { rows: 6, cols: 6, hints: 1 }
    };
    
    // Animal collections for different themes
    const jungleAnimals = [
        {
            name: 'cat',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M290.59 192c-20.18 0-106.82 1.98-162.59 85.95V192c0-52.94-43.06-96-96-96-17.67 0-32 14.33-32 32s14.33 32 32 32c17.64 0 32 14.36 32 32v256c0 35.3 28.7 64 64 64h176c8.84 0 16-7.16 16-16v-16c0-17.67-14.33-32-32-32h-32l128-96v144c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V289.86c-10.29 2.67-20.89 4.54-32 4.54-61.81 0-113.52-44.05-125.41-102.4zM448 96h-64l-64-64v134.4c0 53.02 42.98 96 96 96s96-42.98 96-96V32l-64 64zm-72 80c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16zm80 0c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16z"/></svg>'
        },
        {
            name: 'dog',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M298.06,224,448,277.55V496a16,16,0,0,1-16,16H368a16,16,0,0,1-16-16V384H192V496a16,16,0,0,1-16,16H112a16,16,0,0,1-16-16V282.09C58.84,268.84,32,233.66,32,192a32,32,0,0,1,64,0,32.06,32.06,0,0,0,32,32ZM544,112v32a64,64,0,0,1-64,64H448v35.58L320,197.87V48c0-14.25,17.22-21.39,27.31-11.31L374.59,64h53.63c10.91,0,23.75,7.92,28.62,17.69L464,96h64A16,16,0,0,1,544,112Zm-112,0a16,16,0,1,0-16,16A16,16,0,0,0,432,112Z"/></svg>'
        },
        {
            name: 'elephant',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M512 32c-46.7 0-86.7 27.4-105.3 67.2-11.8-12.3-28.3-20-46.7-20-35.3 0-64 28.7-64 64v64.8c-26.4 4.2-50.5 14.5-70.3 29.7C208.2 177.5 174.7 128 128 128H32c-17.7 0-32 14.3-32 32v192c0 17.7 14.3 32 32 32h96c41.8 0 77-26.7 90.2-64h5.6c23.5 0 45.3 6.7 64 18.2 15.8 9.6 34.2 15.8 54 15.8 5.6 0 11-.6 16.3-1.5 0 .5-.1 1-.1 1.5v32c0 53 43 96 96 96s96-43 96-96v-32c0-.5 0-1-.1-1.5 5.3.9 10.7 1.5 16.3 1.5 19.8 0 38.2-6.2 54-15.8 18.6-11.5 40.5-18.2 64-18.2h5.6c13.2 37.3 48.4 64 90.2 64h64c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-64c-35.3 0-64 28.7-64 64v49.6c-18.6-10.5-40.5-17.6-64-17.6h-5.6c-.2-2.8-.4-5.6-.4-8.5V160c0-70.7-57.3-128-128-128zm64 256c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z"/></svg>'
        },
        {
            name: 'fish',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M327.1 96c-89.97 0-168.54 54.77-212.27 101.63L27.5 131.58c-12.13-9.18-30.24.6-27.14 14.66L24.54 256 .35 365.77c-3.1 14.06 15.01 23.83 27.14 14.66l87.33-66.05C158.55 361.23 237.13 416 327.1 416 464.56 416 576 288 576 256S464.56 96 327.1 96zm87.43 184c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24 13.26 0 24 10.74 24 24 0 13.25-10.75 24-24 24z"/></svg>'
        },
        {
            name: 'frog',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M446.53 97.43C439.67 60.23 407.19 32 368 32c-39.23 0-71.72 28.29-78.54 65.54C126.75 112.96-.5 250.12 0 416.98.11 451.9 29.08 480 64 480h304c8.84 0 16-7.16 16-16 0-17.67-14.33-32-32-32h-79.49l35.8-48.33c24.14-36.23 10.35-88.28-33.71-106.6-23.89-9.93-51.55-4.65-72.24 10.88l-32.76 24.59c-7.06 5.31-17.09 3.91-22.41-3.19-5.3-7.08-3.88-17.11 3.19-22.41l34.78-26.09c36.84-27.66 88.28-27.62 125.13 0 10.87 8.15 45.87 39.06 40.8 93.21L469.62 480H560c8.84 0 16-7.16 16-16 0-17.67-14.33-32-32-32h-53.63l-98.52-104.68 154.44-86.65A58.16 58.16 0 0 0 576 189.94c0-21.4-11.72-40.95-30.48-51.23-40.56-22.22-98.99-41.28-98.99-41.28zM368 136c-13.26 0-24-10.75-24-24 0-13.26 10.74-24 24-24 13.25 0 24 10.74 24 24 0 13.25-10.75 24-24 24z"/></svg>'
        },
        {
            name: 'lion',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M464 256h-80v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8c-88.4 0-160 71.6-160 160v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48zm-288 0H96v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8C71.6 32 0 103.6 0 192v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z"/></svg>'
        },
        {
            name: 'penguin',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M156.8 411.8l31.22-31.22-60.04-53.09-52.29 52.28 81.11 32.03zm-96.12-160.2l60.04-60.04L76.06 136 35.17 176.9l25.51 74.7zM56 0C25.12 0 0 25.12 0 56c0 22.05 12.99 41.01 31.67 49.84l86.98 86.98C63.94 192.82 0 256.77 0 336c0 97.2 78.8 176 176 176 70.7 0 131.72-41.75 159.73-101.82l-30.04-12.95A128.006 128.006 0 0 1 176 464c-70.69 0-128-57.31-128-128 0-46.94 25.34-87.91 63.02-109.97l15.45 15.45C89.52 257.67 64 295.03 64 336c0 61.86 50.14 112 112 112 41.08 0 78.55-25.66 94.73-63.18l-30.4-13.08A64.002 64.002 0 0 1 176 416c-44.12 0-80-35.89-80-80 0-18.21 6.31-34.93 16.71-48.21l-43.17-43.17C86.02 238.96 97.06 228.02 112 228.02c8.84 0 16-7.16 16-16s-7.16-16-16-16c-30.62 0-57.01 22.16-62.52 51.96L8.92 207.41C3.43 201.93 0 194.27 0 186.26V169c0-11.07 3.44-21.26 9.28-29.72L75.61 73c10.46-13.34 23.05-24.76 37.51-33.77C120.44 13.67 145.68 0 173.38 0H184c48.53 0 88 39.47 88 88 0 18.84-6.03 36.25-16.22 50.53l-41.34 41.34c-.5 .5-1.1 .75-1.68 1.19-2.31 1.71-4.72 3.28-7.19 4.77-8.92 5.4-18.64 9.5-28.97 11.87-9.43 2.18-19.35 2.8-29.4 1.63-5.65-.66-11.1-1.93-16.38-3.72l-12.21 12.21c13.3 7.79 28.66 12.48 45.14 12.48 49.12 0 89.03-39.92 89.03-89.03 0-27.64-12.73-52.44-32.69-68.84C219.97 20.64 192.43 0 160 0L56 0zm72 344c-13.25 0-24 10.74-24 24 0 13.25 10.75 24 24 24s24-10.75 24-24c0-13.26-10.75-24-24-24z"/></svg>'
        },
        {
            name: 'turtle',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M64 160C28.7 160 0 188.7 0 224v96c0 35.3 28.7 64 64 64h32v64c0 35.3 28.7 64 64 64s64-28.7 64-64v-64h96v64c0 35.3 28.7 64 64 64s64-28.7 64-64v-64h32c35.3 0 64-28.7 64-64v-96c0-35.3-28.7-64-64-64H64zm384 32a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM96 224a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm272-96c0-35.3-28.7-64-64-64s-64 28.7-64 64v96h128V128z"/></svg>'
        }
    ];
    
    // Timer functions
    function startTimer() {
        clearInterval(timer);
        seconds = 0;
        timerElement.textContent = '00:00';
        timer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
        isGameActive = true;
    }
    
    function stopTimer() {
        clearInterval(timer);
        isGameActive = false;
    }
    
    function resetTimer() {
        clearInterval(timer);
        seconds = 0;
        timerElement.textContent = '00:00';
    }
    
    // Load best time from localStorage
    function loadBestTime() {
        const bestTime = localStorage.getItem(`bestTime-${currentDifficulty}`);
        if (bestTime) {
            bestTimeElement.textContent = formatTime(parseInt(bestTime));
        } else {
            bestTimeElement.textContent = '--:--';
        }
    }
    
    // Format time as MM:SS
    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Save best time to localStorage
    function saveBestTime() {
        const currentBestTime = localStorage.getItem(`bestTime-${currentDifficulty}`);
        if (!currentBestTime || seconds < parseInt(currentBestTime)) {
            localStorage.setItem(`bestTime-${currentDifficulty}`, seconds.toString());
            return true; // New record
        }
        return false; // Not a new record
    }
    
    // Initialize game
    function initGame() {
        moves = 0;
        movesCount.textContent = moves;
        firstCard = null;
        secondCard = null;
        lockBoard = false;
        hintsRemaining = difficulties[currentDifficulty].hints;
        hintCountElement.textContent = hintsRemaining;
        resetTimer();
        loadBestTime();
        
        // Set grid columns dynamically for the selected difficulty
        gameBoard.style.setProperty('--grid-cols', difficulties[currentDifficulty].cols);
    gameBoard.style.setProperty('--grid-rows', difficulties[currentDifficulty].rows);

        // Get animals based on current theme and difficulty
    let animals;
    if (currentTheme === 'jungle') {
        animals = jungleAnimals;
    } else if (currentTheme === 'ocean') {
        animals = oceanAnimals;
    } else if (currentTheme === 'farm') {
        animals = farmAnimals;
    } else {
        animals = jungleAnimals;
    }

    // Calculate pairs based on grid size
    const rows = difficulties[currentDifficulty].rows;
    const cols = difficulties[currentDifficulty].cols;
    const totalCards = rows * cols;
    const pairs = totalCards / 2;

    // Ensure enough pairs, repeat animals if needed
    let selectedAnimals = [];
    while (selectedAnimals.length < pairs) {
        let needed = pairs - selectedAnimals.length;
        let toAdd = shuffleArray(animals).slice(0, Math.min(needed, animals.length));
        selectedAnimals = selectedAnimals.concat(toAdd);
    }

    // Create the deck: two of each animal
    cards = shuffleArray([...selectedAnimals, ...selectedAnimals]);

    // Clear previous cards
    gameBoard.innerHTML = '';

    // Generate cards
    cards.forEach((animal, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;
        card.dataset.name = animal.name;

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-face', 'card-front');
        cardFront.innerHTML = animal.icon;

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-face', 'card-back');

        card.appendChild(cardFront);
        card.appendChild(cardBack);

        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
    }
    
    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    // Flip card function
    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        if (isPaused) return;
        
        // Start timer on first card flip if game is not active
        if (!isGameActive) {
            startTimer();
        }
        
        // Play flip sound
        sounds.flip.currentTime = 0;
        sounds.flip.play();
        
        this.classList.add('flipped');
        
        if (!firstCard) {
            firstCard = this;
            return;
        }
        
        secondCard = this;
        lockBoard = true;
        
        checkForMatch();
    }
    
    // Check if cards match
    function checkForMatch() {
        const isMatch = firstCard.dataset.name === secondCard.dataset.name;
        
        if (isMatch) {
            // Play match sound
            sounds.match.currentTime = 0;
            sounds.match.play();
            disableCards();
        } else {
            // Play no match sound
            sounds.noMatch.currentTime = 0;
            sounds.noMatch.play();
            unflipCards();
        }
        
        // Increment moves
        moves++;
        movesCount.textContent = moves;
        
        // Check if game is over
        checkGameOver();
    }
    
    // Disable matched cards
    function disableCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        // Add a slight delay before resetting the board to allow for animation
        setTimeout(() => {
            resetBoard();
        }, 300);
    }
    
    // Unflip cards if no match
    function unflipCards() {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            
            resetBoard();
        }, 1000);
    }
    
    // Reset board after each turn
    function resetBoard() {
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
    }
    
    // Check if game is over
    function checkGameOver() {
        const matchedCards = document.querySelectorAll('.matched');
        if (matchedCards.length === cards.length) {
            // Stop the timer
            stopTimer();
            
            // Play victory sound
            sounds.victory.currentTime = 0;
            sounds.victory.play();
            
            // Start confetti animation
            startConfetti();
            
            // Update victory modal
            victoryMovesElement.textContent = moves;
            victoryTimeElement.textContent = formatTime(seconds);
            
            // Check if this is a new record
            const isNewRecord = saveBestTime();
            if (isNewRecord) {
                newRecordElement.classList.remove('hidden');
            } else {
                newRecordElement.classList.add('hidden');
            }
            
            // Update leaderboard
            updateLeaderboard();
            
            // Show victory modal after a short delay
            setTimeout(() => {
                victoryModal.classList.add('show');
            }, 1000);
        }
    }
    
    // Start confetti animation
    function startConfetti() {
        confettiCanvas.style.display = 'block';
        const confettiSettings = { target: 'confetti-canvas', max: 150, size: 1.5, animate: true, props: ['circle', 'square', 'triangle', 'line'], colors: [[165,104,246],[230,61,135],[0,199,228],[253,214,126]], clock: 25 };
        confettiInstance = new ConfettiGenerator(confettiSettings);
        confettiInstance.render();
    }
    
    // Stop confetti animation
    function stopConfetti() {
        if (confettiInstance) {
            confettiInstance.clear();
            confettiCanvas.style.display = 'none';
        }
    }
    
    // Leaderboard functionality
    function updateLeaderboard() {
        const leaderboard = getLeaderboard();
        
        // Add current game to leaderboard
        leaderboard.push({
            difficulty: currentDifficulty,
            time: seconds,
            moves: moves,
            date: new Date().toISOString()
        });
        
        // Sort by time (ascending)
        leaderboard.sort((a, b) => a.time - b.time);
        
        // Keep only top 5 entries
        const topEntries = leaderboard.slice(0, 5);
        
        // Save to localStorage
        localStorage.setItem('leaderboard', JSON.stringify(topEntries));
        
        // Display leaderboard
        displayLeaderboard();
    }
    
    function getLeaderboard() {
        const leaderboard = localStorage.getItem('leaderboard');
        return leaderboard ? JSON.parse(leaderboard) : [];
    }
    
    function displayLeaderboard(sortBy = 'time') {
        const leaderboard = getLeaderboard();
        
        // Sort by specified criteria
        if (sortBy === 'time') {
            leaderboard.sort((a, b) => a.time - b.time);
        } else if (sortBy === 'moves') {
            leaderboard.sort((a, b) => a.moves - b.moves);
        }
        
        // Clear current entries
        leaderboardBody.innerHTML = '';
        
        // Add entries to table
        leaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            
            const rankCell = document.createElement('td');
            rankCell.textContent = index + 1;
            
            const difficultyCell = document.createElement('td');
            difficultyCell.textContent = entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1);
            
            const timeCell = document.createElement('td');
            timeCell.textContent = formatTime(entry.time);
            
            const movesCell = document.createElement('td');
            movesCell.textContent = entry.moves;
            
            const dateCell = document.createElement('td');
            dateCell.textContent = new Date(entry.date).toLocaleDateString();
            
            row.appendChild(rankCell);
            row.appendChild(difficultyCell);
            row.appendChild(timeCell);
            row.appendChild(movesCell);
            row.appendChild(dateCell);
            
            leaderboardBody.appendChild(row);
        });
    }
    
    // Difficulty level and theme switching
    difficultySelect.addEventListener('change', (e) => {
        currentDifficulty = e.target.value;
        hintsRemaining = difficulties[currentDifficulty].hints;
        hintCountElement.textContent = hintsRemaining;
        loadBestTime();
        initGame();
    });
    
    themeSelect.addEventListener('change', (e) => {
        currentTheme = e.target.value;
        document.body.className = themes[currentTheme].class;
        initGame();
    });
    
    // Hint functionality
    hintButton.addEventListener('click', () => {
        if (hintsRemaining <= 0 || lockBoard || isPaused || !isGameActive) return;
        
        // Find unmatched cards
        const unmatchedCards = Array.from(document.querySelectorAll('.card:not(.matched)'));
        if (unmatchedCards.length <= 0) return;
        
        // Find a matching pair
        const cardNames = {};
        let matchingPair = null;
        
        unmatchedCards.forEach(card => {
            const name = card.dataset.name;
            if (cardNames[name]) {
                matchingPair = [cardNames[name], card];
            } else {
                cardNames[name] = card;
            }
        });
        
        if (matchingPair) {
            // Play hint sound
            sounds.hint.currentTime = 0;
            sounds.hint.play();
            
            // Highlight the matching pair
            matchingPair.forEach(card => card.classList.add('hint'));
            
            // Remove highlight after 2 seconds
            setTimeout(() => {
                matchingPair.forEach(card => card.classList.remove('hint'));
            }, 2000);
            
            // Decrement hint count
            hintsRemaining--;
            hintCountElement.textContent = hintsRemaining;
        }
    });
    
    // Pause game functionality
    pauseButton.addEventListener('click', () => {
        if (!isGameActive) return;
        
        if (isPaused) {
            // Resume game
            isPaused = false;
            pauseButton.innerHTML = '<i class="fas fa-pause"></i><span class="sr-only">Pause</span>';
            pauseModal.classList.remove('show');
            startTimer();
        } else {
            // Pause game
            isPaused = true;
            pauseButton.innerHTML = '<i class="fas fa-play"></i><span class="sr-only">Resume</span>';
            pauseModal.classList.add('show');
            stopTimer();
        }
    });
    
    // Resume game from pause modal
    resumeGameButton.addEventListener('click', () => {
        if (isPaused) {
            isPaused = false;
            pauseButton.innerHTML = '<i class="fas fa-pause"></i><span class="sr-only">Pause</span>';
            pauseModal.classList.remove('show');
            startTimer();
        }
    });
    
    // Victory modal buttons
    playAgainButton.addEventListener('click', () => {
        victoryModal.classList.remove('show');
        stopConfetti();
        initGame();
    });
    
    changeSettingsButton.addEventListener('click', () => {
        victoryModal.classList.remove('show');
        stopConfetti();
    });
    
    closeModalButton.addEventListener('click', () => {
        victoryModal.classList.remove('show');
        stopConfetti();
    });
    
    // Leaderboard tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Display leaderboard sorted by selected criteria
            displayLeaderboard(button.dataset.tab);
        });
    });
    
    // Card shuffle animation
    function animateCardShuffle() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.classList.add('shuffle-animation');
            // Remove animation class after animation completes
            setTimeout(() => {
                card.classList.remove('shuffle-animation');
            }, 800);
        });
    }
    
    // Restart game with animation
    restartButton.addEventListener('click', () => {
        animateCardShuffle();
        setTimeout(() => {
            initGame();
            startTimer();
        }, 800);
    });
    
    // Set initial theme
    document.body.className = themes[currentTheme].class;
    
    // Display initial leaderboard
    displayLeaderboard();
    
    // Initialize game on load
    initGame();
});
