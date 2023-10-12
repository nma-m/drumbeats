const tempoSlider = document.getElementById('tempo-slider');
const tempoValue = document.getElementById('tempo-value');
const tapButton = document.getElementById('tap-tempo-btn');
const MIN_TEMPO = 30;
const MAX_TEMPO = 218;

// Change value in tempo display
function changeTempoDisplay() {
    tempoValue.innerText = tempoSlider.value;
}

tempoSlider.addEventListener('input', changeTempoDisplay);

document.getElementById('dec-tempo-btn').addEventListener('click', () => {
    tempoSlider.value --;
    changeTempoDisplay();
});

document.getElementById('inc-tempo-btn').addEventListener('click', () => {
    tempoSlider.value ++;
    changeTempoDisplay();
});

// Tap to set tempo
let tapTempoMode = false;
let lastTapTime = 0;
let tempo = tempoSlider.value;
let tapCount = 0;
let timeElapsed = 0;

function tapTempo() {
    tapTempoMode = true;

    // Calculate time since last tap
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;
    lastTapTime = now;

    // Calculate tempo based on time between taps
    if (tapCount === 0) { 
        tempoValue.innerText = 'TAP';
    } else {
        // Before adding the next tap time, ask if it's valid i.e. if it's within 20 bpm of the current tempo
        if (Math.abs(60000/timeSinceLastTap - 60000/((timeElapsed + timeSinceLastTap) / tapCount)) < 20) {
            timeElapsed += timeSinceLastTap;
            tempo = 60000 / ((timeElapsed / tapCount) || 1);

            if (tempo < MIN_TEMPO || tempo > MAX_TEMPO) {
                // Reset tap history if tempo is out of range
                resetTapTempo();
                tapTempo();
                return;
            } else {
                // Update tempo
                tempoSlider.value = Math.round(tempo);
                tempoValue.innerText = Math.round(tempo);
            }
        } else {
            // Reset tap history if tempo changes by more than 20 bpm
            resetTapTempo();
            tapTempo();
            return;
        }
    }

    tapCount++;
}

function resetTapTempo() {
    tapTempoMode = false;
    lastTapTime = 0;
    tapCount = 0;
    timeElapsed = 0;

    tempoValue.innerText = tempoSlider.value;
}

function tapTempoTimeout() {
    if (!tapTempoMode) {
      tapTempoMode = true;
      timer = setTimeout(() => {
        resetTapTempo();
      }, 2500);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        resetTapTempo();
      }, 2500);
    }
}

tapButton.addEventListener('click', tapTempoTimeout);

tapButton.addEventListener('click', tapTempo);

tapButton.addEventListener('blur', resetTapTempo);