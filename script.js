// Create a single audio instance that we'll reuse
const backgroundAudio = new Audio('audio/song.mp3');
let audioInitialized = false;

// Function to handle audio initialization
function initializeAudio() {
  if (!audioInitialized) {
    backgroundAudio.currentTime = 66; // Start at 1:00
    backgroundAudio.play()
      .then(() => {
        console.log('Audio started playing');
        // Stop the audio after 40 seconds
        setTimeout(() => {
          backgroundAudio.pause();
        }, 40000);
      })
      .catch(error => {
        console.error('Audio playback failed:', error);
      });
    audioInitialized = true;
  }
}

// Paper class
let highestZ = 1;

class Paper {
  constructor() {
    this.holdingPaper = false;
    this.mouseTouchX = 0;
    this.mouseTouchY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.velX = 0;
    this.velY = 0;
    this.rotation = Math.random() * 30 - 15;
    this.currentPaperX = 0;
    this.currentPaperY = 0;
    this.rotating = false;
  }

  init(paper) {
    // Add click/touchstart handler to initialize audio
    paper.addEventListener('click', initializeAudio);
    paper.addEventListener('touchstart', initializeAudio);

    const handleMove = (x, y) => {
      if (!this.rotating) {
        this.mouseX = x;
        this.mouseY = y;

        this.velX = this.mouseX - this.prevMouseX;
        this.velY = this.mouseY - this.prevMouseY;
      }

      const dirX = x - this.mouseTouchX;
      const dirY = y - this.mouseTouchY;
      const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);
      const dirNormalizedX = dirX / dirLength;
      const dirNormalizedY = dirY / dirLength;

      const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
      let degrees = 180 * angle / Math.PI;
      degrees = (360 + Math.round(degrees)) % 360;
      if (this.rotating) {
        this.rotation = degrees;
      }

      if (this.holdingPaper) {
        if (!this.rotating) {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
        }
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;

        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    };

    // Handle mouse and touch move
    const moveHandler = (e) => {
      if (e.touches) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      } else {
        handleMove(e.clientX, e.clientY);
      }
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('touchmove', moveHandler);

    const startHandler = (e) => {
      if (this.holdingPaper) return;

      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;

      this.holdingPaper = true;
      paper.style.zIndex = highestZ;
      highestZ += 1;

      this.mouseTouchX = x;
      this.mouseTouchY = y;
      this.prevMouseX = x;
      this.prevMouseY = y;

      if (e.touches) {
        e.preventDefault(); // Prevent scrolling on touch
      }
    };

    const endHandler = () => {
      this.holdingPaper = false;
      this.rotating = false;
    };

    // Bind mouse and touch start events
    paper.addEventListener('mousedown', startHandler);
    paper.addEventListener('touchstart', startHandler);

    // Bind mouse and touch end events
    window.addEventListener('mouseup', endHandler);
    window.addEventListener('touchend', endHandler);
  }
}

// Initialize the Paper instances for each .paper element
const papers = Array.from(document.querySelectorAll('.paper'));

papers.forEach(paper => {
  const p = new Paper();
  p.init(paper);
});
