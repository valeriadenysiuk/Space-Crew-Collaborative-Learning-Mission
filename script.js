// Space crew data - our amazing astronauts!
const crewMembers = [
    { name: 'Alice', avatar: "👩🏼‍🚀", status: 'pending', score: 9, isCurrentUser: true},
    { name: 'Mika', avatar:"👩🏼‍🚀" , status: 'done', score: 12 },
    { name: 'Selina', avatar: "👩🏼‍🚀", status: 'done', score: 8 },
    { name: 'Thea',avatar: "👩🏼‍🚀",  status: 'done', score: 15 },
    { name: 'Luna', avatar: "👩🏼‍🚀", status: 'pending', score: -2 },
    { name: 'Viola', avatar: "👩🏼‍🚀", status: 'done', score: 18 },
    { name: 'Dasha', avatar: "👩🏼‍🚀", status: 'pending', score: 5 },
    { name: 'Amber',avatar: "👩🏼‍🚀",  status: 'done', score: 11 },
    { name: 'Lexa',avatar: "👩🏼‍🚀",  status: 'pending', score: -1 },
    { name: 'Nora',avatar: "👩🏼‍🚀", status: 'done', score: 7 },
    { name: 'Lyala',avatar: "👩🏼‍🚀",  status: 'done', score: 13 },
    { name: 'Elara',avatar: "👩🏼‍🚀",  status: 'pending', score: 3 }
];

// Game state - the brain of our space mission
let gameState = {
    currentFuel: 0,
    maxFuel: 9.6, 
    minFuelForLaunch: 5.0,
    userChoice: null, // null = not decided, 'studied' or 'not_studied'
    userScore: 9,
    studyDays: 12,
    missedDays: 3,
    launchHistory: [], // Track all our launch attempts
    currentDay: new Date().toDateString(), // Used for daily resets
    newMemberPhoto: null // For adding new crew members
};

// Dynamically adjust max fuel based on crew size
function updateMaxFuel() {
    gameState.maxFuel = crewMembers.length * 0.8;
}

// Create that beautiful starry background - makes it feel like real space!
function createStars() {
    const starsContainer = document.getElementById('stars');

    // Create 150 twinkling stars with random positions and sizes
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = star.style.height = Math.random() * 3 + 1 + 'px';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }

    // Add some shooting stars for that extra cosmic magic
    for (let i = 0; i < 5; i++) {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        shootingStar.style.left = Math.random() * 50 + '%';
        shootingStar.style.top = Math.random() * 50 + '%';
        shootingStar.style.animationDelay = Math.random() * 4 + 's';
        starsContainer.appendChild(shootingStar);
    }
}

// Countdown timer - creates that exciting launch anticipation!
function updateTimer() {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const diff = endOfDay - now;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const timerElement = document.getElementById('timer');
    timerElement.textContent =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Check if it's a new day - reset everything if it is
    const today = new Date().toDateString();
    if (gameState.currentDay !== today) {
        resetForNewDay();
    }

    // Auto-check launch conditions in the last 5 seconds of the day
    if (hours === 0 && minutes === 0 && seconds <= 5) {
        checkLaunchCondition();
    }
}

// Update the visual fuel gauge based on current fuel levels
function updateFuelBar() {
    const fuelPercentage = (gameState.currentFuel / gameState.maxFuel) * 100;
    const fuelBar = document.getElementById('fuel-bar');
    const fuelAmount = document.getElementById('fuel-amount');

    fuelBar.style.width = fuelPercentage + '%';
    fuelAmount.textContent = gameState.currentFuel.toFixed(1);
    updateFuelDisplay();
}

// Calculate total team fuel based on everyone's study status
function calculateTotalFuel() {
    let totalFuel = 0;

    crewMembers.forEach(member => {
        if (member.status === 'done') {
            totalFuel += 0.8; // +0.8 for studying today
        } else if (member.status === 'missed' || member.status === 'pending') {
            totalFuel -= 0.2; // -0.2 for missing or not deciding
        }
    });

    // Fuel can't go negative - we're optimistic like that!
    gameState.currentFuel = Math.max(0, totalFuel);
    updateFuelBar();

    // Check if we can launch yet
    checkLaunchCondition();
}

// Check if we have enough fuel to launch the rocket
function checkLaunchCondition() {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 0, 0);

    // Launch check triggers when everyone has decided OR in the last 5 minutes
    const allMembersDecided = crewMembers.every(member => member.status !== 'pending');
    const nearEndOfDay = (endOfDay - now) < 300000; // Last 5 minutes

    if (allMembersDecided || nearEndOfDay) {
        if (gameState.currentFuel >= gameState.minFuelForLaunch) {
            triggerSuccessfulLaunch();
        } else {
            triggerFailedLaunch();
        }
    }
}

// Rocket launch success! Time to celebrate! 🚀
function triggerSuccessfulLaunch() {
    gameState.launchHistory.unshift({
        date: new Date().toDateString(),
        success: true,
        fuel: gameState.currentFuel,
        participants: crewMembers.filter(m => m.status === 'done').length
    });

    // Animate the rocket taking off
    const rocket = document.getElementById('mainRocket');
    rocket.style.animation = 'launchAnimation 3s ease-out forwards';

    // Add launch animation CSS if it doesn't exist yet
    if (!document.getElementById('launchStyles')) {
        const style = document.createElement('style');
        style.id = 'launchStyles';
        style.textContent = `
            @keyframes launchAnimation {
                0% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-100px) scale(1.2); }
                100% { transform: translateY(-200px) scale(0.5); opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        showRocketMessage(`🚀 SUCCESSFUL LAUNCH! Fuel: ${gameState.currentFuel.toFixed(1)}`);
    }, 1000);
}

// Failed launch - not enough team energy today 😔
function triggerFailedLaunch() {
    gameState.launchHistory.unshift({
        date: new Date().toDateString(),
        success: false,
        fuel: gameState.currentFuel,
        participants: crewMembers.filter(m => m.status === 'done').length
    });

    showRocketMessage(`💥 Not enough fuel for launch! Need: ${gameState.minFuelForLaunch}, have: ${gameState.currentFuel.toFixed(1)}`);
}

// Toggle sidebar collapse/expand - for better space management
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
}

// Show user profile modal with personal stats
function showProfile() {
    const modal = document.getElementById('profileModal');
    updateProfileData();
    modal.classList.add('active');
}

// Display the crew list modal
function showCrewList() {
    const modal = document.getElementById('crewModal');
    renderCrewList();
    modal.classList.add('active');

    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.menu-item')[0].classList.add('active');
}

// Show team results and statistics
function showResults() {
    const modal = document.getElementById('resultsModal');
    renderResults();
    modal.classList.add('active');

    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.menu-item')[1].classList.add('active');
}

// Render team statistics and results
function renderResults() {
    // Calculate team-wide statistics
    const totalStudyDays = crewMembers.reduce((sum, member) => sum + member.studyDays, 0);
    const totalMissedDays = crewMembers.reduce((sum, member) => sum + member.missedDays, 0);
    const totalScore = crewMembers.reduce((sum, member) => sum + member.score, 0);
    const averageScore = (totalScore / crewMembers.length).toFixed(1);
    const successfulLaunches = gameState.launchHistory.filter(launch => launch.success).length;
    const failedLaunches = gameState.launchHistory.filter(launch => !launch.success).length;

    // Update overall statistics display
    document.getElementById('totalStudyDays').textContent = totalStudyDays;
    document.getElementById('totalMissedDays').textContent = totalMissedDays;
    document.getElementById('teamTotalScore').textContent = totalScore;
    document.getElementById('averageScore').textContent = averageScore;
    document.getElementById('successfulLaunches').textContent = successfulLaunches;
    document.getElementById('failedLaunches').textContent = failedLaunches;

    // Render individual member results
    const crewResults = document.getElementById('crewResultsList');
    crewResults.innerHTML = '';

    crewMembers.forEach(member => {
        const memberRow = document.createElement('div');
        memberRow.className = 'crew-result-row';

        memberRow.innerHTML = `
            <div class="crew-avatar-small">${member.avatar}</div>
            <div class="crew-name">${member.name}</div>
            <div class="crew-stats">
                <span class="stat-badge study-days">${member.studyDays} days</span>
                <span class="stat-badge missed-days">${member.missedDays} days</span>
            </div>
            <div class="score ${member.score >= 0 ? 'positive' : 'negative'}">
                ${member.score > 0 ? '+' : ''}${member.score}
            </div>
        `;

        crewResults.appendChild(memberRow);
    });
}

// Initialize demo data for testing and first-time users
function initDemoResults() {
    // Team launch history
    gameState.launchHistory = [
        { date: '2025-06-01', success: true, fuel: 8.2, participants: 8 },
        { date: '2025-06-02', success: false, fuel: 4.5, participants: 5 },
        { date: '2025-06-03', success: true, fuel: 7.8, participants: 9 }
    ];

    // Generate random stats for each member (for demo purposes)
    crewMembers.forEach(member => {
        member.studyDays = Math.floor(Math.random() * 5) + 5;
        member.missedDays = Math.floor(Math.random() * 3);
        member.score = Math.floor(Math.random() * 10) + 5;
    });
}

// Show settings modal
function showSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('active');

    // Reset photo preview
    document.getElementById('avatarPreview').style.display = 'none';
    gameState.newMemberPhoto = null;

    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.menu-item')[2].classList.add('active');
}

// Close modal window
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Update profile data in the modal
function updateProfileData() {
    document.getElementById('studyDays').textContent = gameState.studyDays;
    document.getElementById('missedDays').textContent = gameState.missedDays;
    document.getElementById('totalScore').textContent = gameState.userScore > 0 ? '+' + gameState.userScore : gameState.userScore;

    const scoreElement = document.getElementById('totalScore');
    scoreElement.className = 'stat-value score ' + (gameState.userScore >= 0 ? 'positive' : 'negative');
}

// User marks themselves as having studied today
function markStudied() {
    if (gameState.userChoice !== null) return; // Already decided for today

    gameState.userChoice = 'studied';
    gameState.userScore += 1;
    gameState.studyDays += 1;

    // Update UI
    updateUserChoice();
    updateProfileData();

    // Update user status in crew data
    const currentUser = crewMembers.find(member => member.isCurrentUser);
    if (currentUser) {
        currentUser.status = 'done';
        currentUser.score = gameState.userScore;
    }

    // Recalculate team fuel
    calculateTotalFuel();

    // Show encouragement message
    showRocketMessage('Great job! You helped the team! 🚀✨');
}

// User marks themselves as not having studied today
function markNotStudied() {
    if (gameState.userChoice !== null) return; // Already decided for today

    gameState.userChoice = 'not_studied';
    gameState.userScore -= 1;
    gameState.missedDays += 1;

    // Update UI
    updateUserChoice();
    updateProfileData();

    // Update user status in crew data
    const currentUser = crewMembers.find(member => member.isCurrentUser);
    if (currentUser) {
        currentUser.status = 'missed';
        currentUser.score = gameState.userScore;
    }

    // Recalculate team fuel
    calculateTotalFuel();

    // Show encouraging message
    showRocketMessage('No worries! Tomorrow is a new chance! 💫');
}

// Update the max fuel display
function updateFuelDisplay() {
    document.getElementById('fuel-max').textContent = gameState.maxFuel.toFixed(1);
}

// Update the user's choice display in the profile modal
function updateUserChoice() {
    const userChoice = document.getElementById('userChoice');
    const actionButtons = document.getElementById('userActions');

    if (gameState.userChoice === 'studied') {
        userChoice.innerHTML = '✅ I studied today! Great job!';
        userChoice.style.color = '#6bcf7f';
        actionButtons.style.display = 'none';
    } else if (gameState.userChoice === 'not_studied') {
        userChoice.innerHTML = '💔 Didn\'t study today, but tomorrow for sure!';
        userChoice.style.color = '#ff6b6b';
        actionButtons.style.display = 'none';
    }
}

// Show a temporary message near the rocket
function showRocketMessage(message) {
    const rocket = document.getElementById('mainRocket');
    const originalText = rocket.textContent;

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'absolute';
    messageDiv.style.top = '-50px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.background = 'rgba(100, 255, 218, 0.9)';
    messageDiv.style.color = '#0f0f23';
    messageDiv.style.padding = '10px 20px';
    messageDiv.style.borderRadius = '20px';
    messageDiv.style.fontSize = '0.9rem';
    messageDiv.style.fontWeight = '600';
    messageDiv.style.whiteSpace = 'nowrap';
    messageDiv.style.zIndex = '1000';
    messageDiv.textContent = message;

    rocket.parentElement.style.position = 'relative';
    rocket.parentElement.appendChild(messageDiv);

    // Animate appearance
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateX(-50%) translateY(10px)';

    setTimeout(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);

    // Remove after 3 seconds with fade out
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(-50%) translateY(-10px)';
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.parentElement.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// Show rocket actions or prompt to make a choice
function showRocketActions() {
    if (gameState.userChoice !== null) {
        showRocketMessage('You already made your choice for today! 🚀');
        return;
    }

    showProfile();
}

// Render the crew list with photos and status
function renderCrewList() {
    const crewList = document.getElementById('crewList');
    crewList.innerHTML = '';

    crewMembers.forEach((member, index) => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'crew-member';
        memberDiv.onclick = () => showMemberProfile(member);

        let statusClass = '';
        let statusText = '';

        switch (member.status) {
            case 'done':
                statusClass = 'status-done';
                statusText = 'Studied';
                break;
            case 'pending':
                statusClass = 'status-pending';
                statusText = 'Waiting...';
                break;
            case 'missed':
                statusClass = 'status-missed';
                statusText = 'Missed';
                break;
        }

        memberDiv.innerHTML = `
            <div class="crew-avatar" style="background-image: url('${member.photo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYBx7Xth5Wf6w5E3LFzkOOMm4WsWhlnBMyGQ&s' + member.name[0]}')"></div>
            <div class="crew-name">${member.name}</div>
            <div class="crew-status">
                <div class="status-indicator ${statusClass}"></div>
                <span>${statusText}</span>
            </div>
            <div class="score ${member.score >= 0 ? 'positive' : 'negative'}">
                ${member.score > 0 ? '+' : ''}${member.score}
            </div>
        `;

        crewList.appendChild(memberDiv);
    });
}

// Track currently viewed member in modal
let currentMemberInModal = null;

// Show individual member profile
function showMemberProfile(member) {
    // If it's the current user, show their profile instead
    if (member.isCurrentUser) {
        closeModal('crewModal');
        showProfile();
        return;
    }

    currentMemberInModal = member;
    const modal = document.getElementById('memberModal');
    const title = document.getElementById('memberTitle');
    const actions = document.getElementById('memberActions');
    const choice = document.getElementById('memberChoice');

    // Set title
    title.innerHTML = `${member.avatar} Profile: ${member.name}`;

    // Fill in data
    document.getElementById('memberStudyDays').textContent = member.studyDays;
    document.getElementById('memberMissedDays').textContent = member.missedDays;
    document.getElementById('memberScore').textContent = member.score > 0 ? '+' + member.score : member.score;

    // Set score color
    const scoreElement = document.getElementById('memberScore');
    scoreElement.className = 'stat-value score ' + (member.score >= 0 ? 'positive' : 'negative');

    // Check if current user is admin (for demo, Lera is admin)
    const currentUser = crewMembers.find(m => m.isCurrentUser);
    const isAdmin = currentUser && currentUser.name === "Lera";

    // Show action buttons only for admin and if member hasn't decided yet
    if (isAdmin && member.status === 'pending') {
        actions.style.display = 'flex';
        choice.innerHTML = '';
    } else {
        actions.style.display = 'none';

        // Show current status
        if (member.status === 'done') {
            choice.innerHTML = '✅ Studied today!';
            choice.style.color = '#6bcf7f';
        } else if (member.status === 'missed') {
            choice.innerHTML = '❌ Didn\'t study today';
            choice.style.color = '#ff6b6b';
        } else {
            choice.innerHTML = '⏳ Hasn\'t checked in today';
            choice.style.color = '#ffd93d';
        }
    }

    // Open modal
    modal.classList.add('active');
}

// Mark member as having studied (admin function)
function markMemberStudied() {
    if (!currentMemberInModal || currentMemberInModal.status !== 'pending') return;

    currentMemberInModal.status = 'done';
    currentMemberInModal.studyDays += 1;
    currentMemberInModal.score += 1;

    // Update modal data
    document.getElementById('memberStudyDays').textContent = currentMemberInModal.studyDays;
    document.getElementById('memberMissedDays').textContent = currentMemberInModal.missedDays;
    document.getElementById('memberScore').textContent = currentMemberInModal.score > 0 ? '+' + currentMemberInModal.score : currentMemberInModal.score;

    // Update status display
    document.getElementById('memberChoice').innerHTML = '✅ Studied today!';
    document.getElementById('memberChoice').style.color = '#6bcf7f';
    document.getElementById('memberActions').style.display = 'none';

    // Recalculate fuel
    calculateTotalFuel();

    // Update crew list
    renderCrewList();

    // Show notification
    showRocketMessage(`${currentMemberInModal.name} checked in! +1⚡`);

    // Save state
    saveGameState();
}

// Mark member as not having studied (admin function)
function markMemberNotStudied() {
    if (!currentMemberInModal || currentMemberInModal.status !== 'pending') return;

    currentMemberInModal.status = 'missed';
    currentMemberInModal.missedDays += 1;
    currentMemberInModal.score -= 1;

    // Update modal data
    document.getElementById('memberStudyDays').textContent = currentMemberInModal.studyDays;
    document.getElementById('memberMissedDays').textContent = currentMemberInModal.missedDays;
    document.getElementById('memberScore').textContent = currentMemberInModal.score > 0 ? '+' + currentMemberInModal.score : currentMemberInModal.score;

    // Update status display
    document.getElementById('memberChoice').innerHTML = '❌ Didn\'t study today';
    document.getElementById('memberChoice').style.color = '#ff6b6b';
    document.getElementById('memberActions').style.display = 'none';

    // Recalculate fuel
    calculateTotalFuel();

    // Update crew list
    renderCrewList();

    // Show notification
    showRocketMessage(`${currentMemberInModal.name} missed today 😔`);

    // Save state
    saveGameState();
}

// Handle photo upload for new members
document.getElementById('avatarUpload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            gameState.newMemberPhoto = event.target.result;
            const preview = document.getElementById('avatarPreview');
            preview.style.backgroundImage = `url('${gameState.newMemberPhoto}')`;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Add new member to the crew
function addNewMember() {
    const nameInput = document.getElementById('newMemberName');
    const name = nameInput.value.trim();

    if (!name) {
        showRocketMessage('Enter astronaut name!');
        return;
    }

    if (!gameState.newMemberPhoto) {
        showRocketMessage('Upload a photo!');
        return;
    }

    // Check for duplicate names
    if (crewMembers.some(m => m.name === name)) {
        showRocketMessage('A crew member with this name already exists!');
        return;
    }

    // Add new member with photo
    crewMembers.push({
        name: name,
        avatar: '👩‍🚀',
        photo: gameState.newMemberPhoto,
        status: 'pending',
        score: 0,
        studyDays: 0,
        missedDays: 0,
        isCurrentUser: false
    });

    // Clear input and preview
    nameInput.value = '';
    document.getElementById('avatarPreview').style.display = 'none';
    gameState.newMemberPhoto = null;

    // Update crew list
    renderCrewList();

    // Save state
    saveGameState();
    updateMaxFuel();
    calculateTotalFuel();
    
    // Show success message
    closeModal('settingsModal');
    setTimeout(() => {
        showRocketMessage(`New crew member: ${name} added! 🎉`);
    }, 300);
}

// Save game state to localStorage
function saveGameState() {
    const state = {
        crewMembers: crewMembers,
        gameState: gameState
    };
    localStorage.setItem('spaceAppState', JSON.stringify(state));
}

// Load game state from localStorage
function loadGameState() {
    const saved = localStorage.getItem('spaceAppState');
    if (saved) {
        const state = JSON.parse(saved);

        // Merge with current state
        Object.assign(gameState, state.gameState);

        // Update crew members
        crewMembers.length = 0;
        state.crewMembers.forEach(m => crewMembers.push(m));
    }
}

// Save user choice to localStorage
function saveUserChoice() {
    const today = new Date().toDateString();
    localStorage.setItem('lastChoiceDate', today);
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// Load saved game state
function loadGameState() {
    const saved = localStorage.getItem('gameState');
    if (saved) {
        const savedState = JSON.parse(saved);
        gameState = { ...gameState, ...savedState };
    }
}

// Wrap original functions to auto-save
const originalMarkStudied = markStudied;
const originalMarkNotStudied = markNotStudied;

markStudied = function () {
    originalMarkStudied();
    saveUserChoice();
};

markNotStudied = function () {
    originalMarkNotStudied();
    saveUserChoice();
};

// Reset everything for a new day
function resetForNewDay() {
    gameState.currentDay = new Date().toDateString();
    gameState.userChoice = null;
    gameState.currentFuel = 0;

    // Reset all crew member statuses
    crewMembers.forEach(member => {
        member.status = 'pending';
    });

    updateFuelBar();
    updateUserChoice();

    // Reset rocket animation if it was launched
    const rocket = document.getElementById('mainRocket');
    rocket.style.animation = 'float 4s ease-in-out infinite';
    rocket.style.transform = '';
    rocket.style.opacity = '';
}

// Initialize the entire application
function initApp() {
    loadGameState();
    createStars();
    updateTimer();
    updateFuelBar();
    updateUserChoice();
    updateMaxFuel();
    calculateTotalFuel();
    initDemoResults();
    
    // Update timer every second
    setInterval(updateTimer, 1000);

    // Add fade-in animations to main elements
    document.querySelectorAll('.timer, .main-rocket, .fuel-info').forEach(el => {
        el.classList.add('fade-in');
    });

    // Check if user already made choice today
    const today = new Date().toDateString();
    const lastChoice = localStorage.getItem('lastChoiceDate');

    if (lastChoice !== today) {
        gameState.userChoice = null;
        // Reset user status
        const currentUser = crewMembers.find(member => member.isCurrentUser);
        if (currentUser) {
            currentUser.status = 'pending';
        }
    }
}

// Smooth fuel updates every 5 seconds (simulates real-time progress)
setInterval(function () {
    const doneMembers = crewMembers.filter(member => member.status === 'done').length;
    const targetFuel = (doneMembers / crewMembers.length) * gameState.maxFuel;

    if (Math.abs(gameState.currentFuel - targetFuel) > 0.1) {
        gameState.currentFuel += (targetFuel - gameState.currentFuel) * 0.1;
        updateFuelBar();
    }
}, 5000);

// Close modals when clicking outside
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Keyboard shortcuts for power users
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    if (e.key === 'p' || e.key === 'P') {
        showProfile();
    }

    if (e.key === 'c' || e.key === 'C') {
        showCrewList();
    }

    if (e.key === 'r' || e.key === 'R') {
        showResults();
    }
});

// Rocket hover effects for that interactive feel
document.getElementById('mainRocket').addEventListener('mouseenter', function () {
    this.style.transform = 'scale(1.05)';
});

document.getElementById('mainRocket').addEventListener('mouseleave', function () {
    this.style.transform = 'scale(1)';
});

// Initialize oath name updating
document.addEventListener('DOMContentLoaded', function () {
    const nameInput = document.getElementById('newMemberName');
    nameInput.addEventListener('input', function () {
        document.getElementById('oathName').textContent = this.value || 'new astronaut';
    });
});

// Start the app when page loads
document.addEventListener('DOMContentLoaded', function () {
    loadGameState();
    initApp();
});