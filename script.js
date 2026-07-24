const birthDate = new Date(2003, 6, 25, 0, 0, 0);
const screenOrder = ["intro", "math", "message", "research", "gift"];
const experience = document.querySelector("[data-experience]");
const screens = [...document.querySelectorAll("[data-screen]")];
const giftBox = document.querySelector("[data-gift-box]");
const wishOverlay = document.querySelector("[data-wish-overlay]");
const closeWishButton = document.querySelector("[data-close-wish]");
const birthdayAudio = document.querySelector("[data-birthday-audio]");
const ageNodes = {
  years: document.querySelector("[data-years]"),
  days: document.querySelector("[data-days]"),
  hours: document.querySelector("[data-hours]"),
  minutes: document.querySelector("[data-minutes]"),
  countDays: document.querySelector("[data-count-days]"),
  countHours: document.querySelector("[data-count-hours]"),
  countMinutes: document.querySelector("[data-count-minutes]"),
  countSeconds: document.querySelector("[data-count-seconds]"),
};

let audioContext;
let masterGain;
let musicTimer;
let musicStopTimer;
let musicPlaying = false;
let masterGainConnected = false;
let celebrationFrame;
let celebrationActive = false;

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function fullYearsSince(date, now) {
  let years = now.getFullYear() - date.getFullYear();
  const hadBirthdayThisYear =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());

  return hadBirthdayThisYear ? years : years - 1;
}

function nextBirthdayFrom(now) {
  const birthday = new Date(now.getFullYear(), 6, 25, 0, 0, 0);

  if (birthday <= now) {
    birthday.setFullYear(now.getFullYear() + 1);
  }

  return birthday;
}

function updateCounters() {
  const now = new Date();
  const elapsed = now - birthDate;
  const minutes = Math.floor(elapsed / 60000);
  const hours = Math.floor(elapsed / 3600000);
  const days = Math.floor(elapsed / 86400000);
  const years = fullYearsSince(birthDate, now);
  const nextBirthday = nextBirthdayFrom(now);
  const remaining = nextBirthday - now;
  const remainingDays = Math.floor(remaining / 86400000);
  const remainingHours = Math.floor((remaining % 86400000) / 3600000);
  const remainingMinutes = Math.floor((remaining % 3600000) / 60000);
  const remainingSeconds = Math.floor((remaining % 60000) / 1000);

  ageNodes.years.textContent = formatNumber(years);
  ageNodes.days.textContent = formatNumber(days);
  ageNodes.hours.textContent = formatNumber(hours);
  ageNodes.minutes.textContent = formatNumber(minutes);
  ageNodes.countDays.textContent = formatNumber(remainingDays);
  ageNodes.countHours.textContent = String(remainingHours).padStart(2, "0");
  ageNodes.countMinutes.textContent = String(remainingMinutes).padStart(2, "0");
  ageNodes.countSeconds.textContent = String(remainingSeconds).padStart(2, "0");
}

function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });

  window.location.hash = name === "intro" ? "" : name;
}

function setupJourney() {
  document.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", () => showScreen(button.dataset.next));
  });

  const initial = window.location.hash.replace("#", "");
  showScreen(screenOrder.includes(initial) ? initial : "intro");
}

function setupStarfield() {
  const canvas = document.querySelector("[data-starfield]");
  const context = canvas.getContext("2d");
  const stars = [];
  let width = 0;
  let height = 0;

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    stars.length = 0;

    for (let index = 0; index < 90; index += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.5 + 0.16,
        speed: Math.random() * 0.32 + 0.06,
      });
    }
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    stars.forEach((star) => {
      star.y -= star.speed;

      if (star.y < -5) {
        star.y = height + 5;
        star.x = Math.random() * width;
      }

      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(201, 154, 83, ${star.alpha})`;
      context.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
}

function burstConfetti() {
  const canvas = document.querySelector("[data-confetti]");
  const context = canvas.getContext("2d");
  const colors = ["#fff8ee", "#f1bdc8", "#c99a53", "#8faf9c", "#d67288", "#425f70"];
  const pieces = [];
  let width = 0;
  let height = 0;
  let frame = 0;

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function createPiece(sourceX, sourceY) {
    return {
      x: sourceX,
      y: sourceY,
      vx: Math.random() * 14 - 7,
      vy: Math.random() * -13 - 4,
      gravity: Math.random() * 0.24 + 0.16,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      spin: Math.random() * 0.28 - 0.14,
    };
  }

  function draw() {
    context.clearRect(0, 0, width, height);

    if (frame < 54) {
      const centerX = width / 2;
      const centerY = height * 0.55;

      for (let index = 0; index < 10; index += 1) {
        pieces.push(createPiece(centerX + Math.random() * 90 - 45, centerY));
      }
    }

    pieces.forEach((piece) => {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.vy += piece.gravity;
      piece.rotation += piece.spin;

      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.58);
      context.restore();
    });

    frame += 1;

    if (pieces.some((piece) => piece.y < height + 60) || frame < 140) {
      requestAnimationFrame(draw);
    } else {
      context.clearRect(0, 0, width, height);
    }
  }

  resize();
  draw();
}

function startCelebrationConfetti() {
  const canvas = document.querySelector("[data-confetti]");
  const context = canvas.getContext("2d");
  const colors = ["#fff8ee", "#f1bdc8", "#c99a53", "#8faf9c", "#d67288", "#425f70"];
  const pieces = [];
  let width = 0;
  let height = 0;

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function makePiece(y = -20) {
    return {
      x: Math.random() * width,
      y,
      vx: Math.random() * 1.2 - 0.6,
      vy: Math.random() * 1.8 + 1.1,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      spin: Math.random() * 0.12 - 0.06,
    };
  }

  function draw() {
    context.clearRect(0, 0, width, height);

    if (pieces.length < 130) {
      for (let index = 0; index < 5; index += 1) {
        pieces.push(makePiece());
      }
    }

    pieces.forEach((piece, index) => {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.rotation += piece.spin;

      if (piece.y > height + 40) {
        pieces[index] = makePiece();
      }

      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.58);
      context.restore();
    });

    if (celebrationActive) {
      celebrationFrame = requestAnimationFrame(draw);
    }
  }

  if (celebrationActive) return;

  celebrationActive = true;
  resize();
  for (let index = 0; index < 90; index += 1) {
    pieces.push(makePiece(Math.random() * height));
  }
  window.addEventListener("resize", resize, { once: true });
  draw();
}

function stopCelebrationConfetti() {
  const canvas = document.querySelector("[data-confetti]");
  const context = canvas.getContext("2d");

  celebrationActive = false;
  cancelAnimationFrame(celebrationFrame);
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function playTone(frequency, startTime, duration, gainValue) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.05);
}

function scheduleMusic() {
  if (!musicPlaying) return;

  const now = audioContext.currentTime;
  const notes = [392, 493.88, 587.33, 739.99, 659.25, 493.88];

  notes.forEach((note, index) => {
    playTone(note, now + index * 0.42, 1.05, 0.045);
    playTone(note / 2, now + index * 0.42, 1.3, 0.025);
  });

  musicTimer = window.setTimeout(scheduleMusic, 2600);
}

function startMusic() {
  if (musicPlaying) return;

  if (birthdayAudio) {
    birthdayAudio.currentTime = 0;
    birthdayAudio.volume = 0.7;
    birthdayAudio.play().then(() => {
      musicPlaying = true;
      musicStopTimer = window.setTimeout(stopMusic, 14000);
    }).catch(() => {
      startGeneratedTune();
    });
    return;
  }

  startGeneratedTune();
}

function startGeneratedTune() {
  if (musicPlaying) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return;
  }

  audioContext = audioContext || new AudioContext();
  masterGain = masterGain || audioContext.createGain();
  masterGain.gain.value = 0.42;
  if (!masterGainConnected) {
    masterGain.connect(audioContext.destination);
    masterGainConnected = true;
  }
  audioContext.resume();
  musicPlaying = true;
  scheduleMusic();
  musicStopTimer = window.setTimeout(stopMusic, 14000);
}

function stopMusic() {
  musicPlaying = false;
  window.clearTimeout(musicTimer);
  window.clearTimeout(musicStopTimer);

  if (birthdayAudio) {
    birthdayAudio.pause();
    birthdayAudio.currentTime = 0;
  }

  if (masterGain) {
    masterGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.08);
  }
}

giftBox.addEventListener("click", () => {
  giftBox.classList.add("is-open");
  experience.classList.add("is-blurred");
  wishOverlay.classList.add("is-visible");
  wishOverlay.setAttribute("aria-hidden", "false");
  burstConfetti();
  window.setTimeout(burstConfetti, 550);
  window.setTimeout(startCelebrationConfetti, 900);
  startMusic();
});

closeWishButton.addEventListener("click", () => {
  wishOverlay.classList.remove("is-visible");
  wishOverlay.setAttribute("aria-hidden", "true");
  experience.classList.remove("is-blurred");
  stopCelebrationConfetti();
  stopMusic();
});

updateCounters();
setInterval(updateCounters, 1000);
setupJourney();
setupStarfield();
