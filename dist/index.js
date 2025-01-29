const audioSources = [
  "https://cdn.pixabay.com/audio/2021/12/21/audio_34a0025934.mp3",
  "https://cdn.pixabay.com/audio/2025/01/12/audio_0d11bb4bc7.mp3",
  "https://cdn.pixabay.com/audio/2025/01/28/audio_e0ec06745e.mp3",
  "https://cdn.pixabay.com/audio/2024/03/13/audio_e869ee1c98.mp3",
];

const FFT_SIZE = window.innerWidth <= 768 ? 256 : 2048;
const GAP_SIZE = 2;
const GREED_COLOR = "235, 203, 139";
const MAX_HEIGHT = 255;

const playButton = document.querySelector("#playButton");

const playIcon = document.querySelector(".playIcon");
const pauseIcon = document.querySelector(".pauseIcon");

const audio = new Audio();
audio.src = audioSources[0];
audio.crossOrigin = "anonymous";
audio.volume = 1;

const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audio);
analyser.fftSize = FFT_SIZE;
source.connect(analyser);
analyser.connect(audioContext.destination);

audio.addEventListener("playing", () => {
  playIcon.classList.add("displayNone");
  pauseIcon.classList.remove("displayNone");
});
audio.addEventListener("pause", () => {
  playIcon.classList.remove("displayNone");
  pauseIcon.classList.add("displayNone");
});

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

//canvas
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = "#2e3440";

function drawEqualizer() {
  requestAnimationFrame(drawEqualizer);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  analyser.getByteFrequencyData(dataArray);
  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / MAX_HEIGHT) * canvas.height;
    const barWidth = canvas.width / bufferLength;
    const x = i * (barWidth + GAP_SIZE);
    const y = canvas.height - barHeight;
    ctx.fillStyle = `rgba(${GREED_COLOR}, ${dataArray[i] / MAX_HEIGHT})`;
    const duration = audio.duration;
    const currentTime = audio.currentTime;
    const progress = (currentTime / duration) * 100;
    playButton.style.background = `linear-gradient(to right, rgba(${GREED_COLOR}, 1) ${progress}%, #2e3440 0%)`;
    ctx.fillRect(x, y, barWidth, barHeight);
  }
}
playButton.addEventListener("click", () => {
  if (audio.paused) {
    audioContext.resume();
    audio
      .play()
      .then(() => {})
      .catch((error) => {
        console.log("🚀 -> audio.play() -> catch -> error", error);
      });
    drawEqualizer();
  } else {
    audio.pause();
    cancelAnimationFrame(drawEqualizer);
  }
});
