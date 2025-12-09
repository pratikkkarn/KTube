// --- CENTRAL VIDEO DATA SOURCE ---
const videoData = [
    { id: 1, title: "Yaadein Teri", channel: "Pratik karn", views: 2400000, likes: 120500, thumb: "Images/1.jpg", url: "Videos/1.mp4" },
    { id: 2, title: "Bewafa", channel: "Pratik karn", views: 1100000, likes: 89000, thumb: "Images/2.jpg", url: "Videos/2.mp4" },
    { id: 3, title: "For Bigger Blazes", channel: "Google Tech", views: 850000, likes: 45000, thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg", url: "https://youtu.be/Yd8EDpIB1To?si=rUuI-PR2ZcDmraIV" },
    { id: 4, title: "Sintel", channel: "Blender Animation", views: 5200000, likes: 250000, thumb: "https://resizing.flixster.com/lwylYKMnTXTpfziN5lzxWbSzrGQ=/fit-in/705x460/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p10892939_v_h9_aa.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
    { id: 5, title: "Tears of Steel", channel: "Sci-Fi Hub", views: 300000, likes: 12000, thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
    { id: 6, title: "Subaru Outback Adventure", channel: "AutoVlog", views: 120000, likes: 5600, thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4" },
    { id: 7, title: "The Smoking Tire", channel: "Car Reviews", views: 900000, likes: 67000, thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/VolkswagenGTIReview.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4" },
    { id: 8, title: "Bullrun Rally", channel: "Garage 419", views: 2000000, likes: 110000, thumb: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/WeAreGoingOnBullrun.jpg", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4" }
];

// --- DOM ELEMENTS ---
const grid = document.getElementById('videoGrid');
const modal = document.getElementById('videoModal');
const videoPlayer = document.getElementById('mainVideo');
const videoFrame = document.getElementById('videoFrame');
const recList = document.getElementById('recList');
const searchInput = document.getElementById('searchInput');
const toast = document.getElementById('videoToast');
const loader = document.getElementById('loadingSpinner');

// Controls
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const progressArea = document.getElementById('progressArea');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const fullScreenBtn = document.getElementById('fullScreenBtn');
const volumeBtn = document.getElementById('volumeBtn');

// Likes
const likeBtnWrapper = document.getElementById('likeButtonWrapper');
const likeCountDisplay = document.getElementById('likeCountDisplay');

// --- HELPER FUNCTIONS ---
function formatCompactNumber(number) {
    return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(number);
}

function formatTime(time) {
    let seconds = Math.floor(time % 60);
    let minutes = Math.floor(time / 60);
    if(seconds < 10) seconds = `0${seconds}`;
    return `${minutes}:${seconds}`;
}

let toastTimeout;
function showToast(iconClass, text) {
    if(!toast) return;
    toast.innerHTML = `<i class="${iconClass}"></i><span>${text}</span>`;
    toast.classList.remove('show');
    void toast.offsetWidth; 
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 1200);
}

// --- RENDER ---
function renderGrid(customList = videoData) {
    if (!grid) return;
    grid.innerHTML = "";
    
    if (customList.length === 0) {
        // Special message if favorites is empty
        grid.innerHTML = `<h3 style="color:#555; grid-column: 1/-1; text-align:center; padding-top: 50px;">No videos found here.</h3>`;
        return;
    }

    customList.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.onclick = () => openPlayer(video);
        card.innerHTML = `
            <div class="thumb-box">
                <img src="${video.thumb}" loading="lazy" alt="${video.title}">
                <div class="overlay"><div class="play-circle"><i class="fa-solid fa-play"></i></div></div>
            </div>
            <div class="card-details">
                <div class="card-title">${video.title}</div>
                <div class="card-footer">
                    <span class="channel-badge">${video.channel}</span>
                    <span class="meta-text">${formatCompactNumber(video.views)} views</span>
                </div>
            </div>`;
        grid.appendChild(card);
    });
}

function renderRecs(currentId) {
    if (!recList) return;
    recList.innerHTML = "";
    videoData.forEach(video => {
        if (video.id === currentId) return;
        const item = document.createElement('div');
        item.className = 'rec-item';
        item.onclick = () => openPlayer(video);
        item.innerHTML = `
            <img src="${video.thumb}" class="rec-img" alt="thumb">
            <div class="rec-info"><h4>${video.title}</h4><p>${video.channel}</p></div>`;
        recList.appendChild(item);
    });
}

// --- PLAYER LOGIC ---
let currentVideoId = null;

function updatePlayerUI(video) {
    document.getElementById('playerTitle').innerText = video.title;
    document.getElementById('playerChannel').innerText = video.channel;
    document.getElementById('playerViews').innerText = formatCompactNumber(video.views) + " Views";
    
    progressBar.style.width = "0%";
    currentTimeEl.innerText = "0:00";
    totalTimeEl.innerText = "0:00";
    playPauseBtn.className = "fa-solid fa-play control-btn";
    
    videoPlayer.src = video.url;
    videoPlayer.play().then(() => {
        playPauseBtn.className = "fa-solid fa-pause control-btn";
    }).catch(e => console.log("Autoplay blocked"));
    
    renderRecs(video.id);
    currentVideoId = video.id;
    updateLikeUI(video.id);
}

function openPlayer(video) {
    updatePlayerUI(video);
    history.pushState({ active: true, videoId: video.id }, "", "#player"); 
    modal.classList.add('active');
}

function closePlayer() {
    if (modal.classList.contains('active')) {
        history.back();
    }
}

// --- LIKE SYSTEM ---
function getLikedVideos() {
    return JSON.parse(localStorage.getItem('liked_videos')) || [];
}

function updateLikeUI(videoId) {
    const likedVideos = getLikedVideos();
    const isLiked = likedVideos.includes(videoId);
    const video = videoData.find(v => v.id === videoId);
    
    let displayCount = video.likes + (isLiked ? 1 : 0);
    likeCountDisplay.innerText = formatCompactNumber(displayCount);
    
    if (isLiked) likeBtnWrapper.classList.add('active');
    else likeBtnWrapper.classList.remove('active');
}

function toggleLike() {
    if (!currentVideoId) return;
    let likedVideos = getLikedVideos();
    const index = likedVideos.indexOf(currentVideoId);
    
    if (index === -1) {
        likedVideos.push(currentVideoId);
        showToast('fa-solid fa-heart', 'Liked');
    } else {
        likedVideos.splice(index, 1);
        showToast('fa-regular fa-heart', 'Removed');
    }
    
    localStorage.setItem('liked_videos', JSON.stringify(likedVideos));
    updateLikeUI(currentVideoId);
}

// --- LIVE SIMULATION ---
setInterval(() => {
    const randomVideo = videoData[Math.floor(Math.random() * videoData.length)];
    const action = Math.random();
    
    if (action > 0.7) { 
        randomVideo.likes += Math.floor(Math.random() * 5) + 1; 
        if (currentVideoId === randomVideo.id) updateLikeUI(currentVideoId);
    } 
    
    if (action > 0.3) {
        randomVideo.views += Math.floor(Math.random() * 20) + 1; 
    }
}, 3000);

// --- AUTOPLAY ---
videoPlayer.addEventListener('ended', () => {
    const currentIndex = videoData.findIndex(v => v.id === currentVideoId);
    if (currentIndex >= 0 && currentIndex < videoData.length - 1) {
        const nextVideo = videoData[currentIndex + 1];
        showToast('fa-solid fa-forward', `Up Next: ${nextVideo.title}`);
        setTimeout(() => {
            updatePlayerUI(nextVideo);
            history.replaceState({ active: true, videoId: nextVideo.id }, "", "#player");
        }, 1500);
    }
});

// --- CONTROLS ---
playPauseBtn.addEventListener('click', togglePlay);
videoPlayer.addEventListener('click', togglePlay);

function togglePlay() {
    if(videoPlayer.paused) {
        videoPlayer.play();
        playPauseBtn.className = "fa-solid fa-pause control-btn";
        showToast('fa-solid fa-play', 'Play');
    } else {
        videoPlayer.pause();
        playPauseBtn.className = "fa-solid fa-play control-btn";
        showToast('fa-solid fa-pause', 'Pause');
    }
}

videoPlayer.addEventListener('timeupdate', (e) => {
    let current = e.target.currentTime;
    let duration = e.target.duration;
    let progressWidth = (current / duration) * 100;
    progressBar.style.width = `${progressWidth}%`;
    currentTimeEl.innerText = formatTime(current);
    if(!isNaN(duration)) totalTimeEl.innerText = formatTime(duration);
});

progressArea.addEventListener('click', (e) => {
    let width = progressArea.clientWidth;
    let clickX = e.offsetX;
    let duration = videoPlayer.duration;
    videoPlayer.currentTime = (clickX / width) * duration;
});

volumeBtn.addEventListener('click', () => {
    videoPlayer.muted = !videoPlayer.muted;
    if(videoPlayer.muted) {
        volumeBtn.className = "fa-solid fa-volume-xmark control-btn";
        showToast('fa-solid fa-volume-xmark', 'Muted');
    } else {
        volumeBtn.className = "fa-solid fa-volume-high control-btn";
        showToast('fa-solid fa-volume-high', 'Unmuted');
    }
});

fullScreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        if(videoFrame.requestFullscreen) videoFrame.requestFullscreen();
        else if(videoFrame.webkitRequestFullscreen) videoFrame.webkitRequestFullscreen();
    } else {
        if(document.exitFullscreen) document.exitFullscreen();
    }
});

videoPlayer.addEventListener('waiting', () => loader.style.display = "block");
videoPlayer.addEventListener('playing', () => loader.style.display = "none");

// --- KEYBOARD ---
document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    const keys = ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyM", "KeyF"];
    if(keys.includes(e.code)) {
        e.preventDefault();
        switch(e.code) {
            case 'Space': togglePlay(); break;
            case 'ArrowUp': 
                videoPlayer.volume = Math.min(1, videoPlayer.volume + 0.1); 
                showToast('fa-solid fa-volume-high', `${Math.round(videoPlayer.volume*100)}%`); 
                break;
            case 'ArrowDown': 
                videoPlayer.volume = Math.max(0, videoPlayer.volume - 0.1);
                showToast('fa-solid fa-volume-low', `${Math.round(videoPlayer.volume*100)}%`);
                break;
            case 'ArrowRight': 
                videoPlayer.currentTime += 10; 
                showToast('fa-solid fa-forward', '+10s'); 
                break;
            case 'ArrowLeft': 
                videoPlayer.currentTime -= 10; 
                showToast('fa-solid fa-backward', '-10s'); 
                break;
            case 'KeyM': volumeBtn.click(); break;
            case 'KeyF': fullScreenBtn.click(); break;
        }
    }
    if(e.code === 'Escape') closePlayer();
});

// --- HISTORY ---
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.active && event.state.videoId) {
        const video = videoData.find(v => v.id === event.state.videoId);
        if (video) {
            updatePlayerUI(video);
            modal.classList.add('active');
        }
    } else {
        modal.classList.remove('active');
        setTimeout(() => {
            videoPlayer.pause();
            videoPlayer.src = ""; 
        }, 400);
    }
});

// --- SIDEBAR LOGIC (UPDATED FOR FAVORITES) ---
function filterByMode(element, mode) {
    document.querySelectorAll('.nav-icon').forEach(icon => icon.classList.remove('active'));
    if(element) element.classList.add('active');
    
    let filteredData = [...videoData];
    
    // Switch between modes
    switch(mode) {
        case 'trending': 
            // Sort by most views
            filteredData.sort((a, b) => b.views - a.views); 
            break;
            
        case 'explore': 
            // Random shuffle
            filteredData.sort(() => Math.random() - 0.5); 
            break;
            
        case 'favorites': 
            // NEW: Filter based on Local Storage Likes
            const likedIds = getLikedVideos();
            filteredData = filteredData.filter(v => likedIds.includes(v.id));
            break;
            
        case 'profile': 
            alert("User Profile\n\nName: Pratik Karn\nStatus: Premium"); 
            return;
    }
    
    renderGrid(filteredData);
}

if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        renderGrid(videoData.filter(v => v.title.toLowerCase().includes(term)));
    });
}

// Init
renderGrid();