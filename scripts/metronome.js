import * as beats from './beats.js';

var audioContext = new AudioContext();
var unlocked = false;
var isPlaying = false;      // Are we currently playing?
var current16thNote;        // What note is currently last scheduled?
var lookahead = 25.0;       // How frequently to call scheduling function 
                            //(in milliseconds)
var scheduleAheadTime = 0.1;    // How far ahead to schedule audio (sec)
                            // This is calculated from lookahead, and overlaps 
                            // with next interval (in case the timer is late)
var nextNoteTime = 0.0;     // when the next note is due.
var notesInQueue = [];      // the notes that have been put into the web audio,
                            // and may or may not have played yet. {note, time}
var timerWorker = null;     // The Web Worker used to fire timer messages

var beatName;               // the drum beat to be played
var kickABuffer;            // unretrieved kick_a sound
var kickBBuffer;            // unretrieved kick_b sound
var kickCBuffer;            // unretrieved kick_c sound
var snareABuffer;           // unretrieved snare_a sound
var snareBBuffer;           // unretrieved snare_b sound
var snareCBuffer;           // unretrieved snare_c sound
var hatBBuffer;             // unretrieved hat_b sound
var hatCBuffer;             // unretrieved hat_c sound
var hatDBuffer;             // unretrieved hat_d sound

function nextNote() {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / document.getElementById("tempo-slider").value;
                                              // Notice this picks up the CURRENT 
                                              // tempo value to calculate beat length.
    nextNoteTime += 0.25 * secondsPerBeat;    // Add beat length to last beat time

    current16thNote++;    // Advance the beat number, wrap to zero after the appropriate
                          // number of 16ths depending on the time signature

    if (current16thNote >= beats.getBarLegnth(beatName)) {
        current16thNote = 0;
    }
}

function scheduleNote( beatNumber, time ) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push( { note: beatNumber, time: time } );
    
    // create the audio
    const kickASource = audioContext.createBufferSource();
    kickASource.buffer = kickABuffer;
    kickASource.connect(audioContext.destination);

    const kickBSource = audioContext.createBufferSource();
    kickBSource.buffer = kickBBuffer;
    kickBSource.connect(audioContext.destination);

    const kickCSource = audioContext.createBufferSource();
    kickCSource.buffer = kickCBuffer;
    kickCSource.connect(audioContext.destination);

    const snareASource = audioContext.createBufferSource();
    snareASource.buffer = snareABuffer;
    snareASource.connect(audioContext.destination);

    const snareBSource = audioContext.createBufferSource();
    snareBSource.buffer = snareBBuffer;
    snareBSource.connect(audioContext.destination);

    const snareCSource = audioContext.createBufferSource();
    snareCSource.buffer = snareCBuffer;
    snareCSource.connect(audioContext.destination);

    const hatBSource = audioContext.createBufferSource();
    hatBSource.buffer = hatBBuffer;
    hatBSource.connect(audioContext.destination);

    const hatCSource = audioContext.createBufferSource();
    hatCSource.buffer = hatCBuffer;
    hatCSource.connect(audioContext.destination);

    const hatDSource = audioContext.createBufferSource();
    hatDSource.buffer = hatDBuffer;
    hatDSource.connect(audioContext.destination);

    let kicks = [kickASource, kickBSource, kickCSource];
    let snares = [snareASource, snareBSource, snareCSource];
    let hats = [hatBSource, hatCSource, hatDSource];

    function playRandom(instrument) {
        if (instrument=="kick") {
            const kick = kicks[Math.floor(Math.random()*kicks.length)];
            kick.start( time );
            kick.stop( time + .5 );
        }
        else if (instrument=="snare") {
            const snare = snares[Math.floor(Math.random()*snares.length)];
            snare.start( time );
            snare.stop( time + .5 );
        }
        else if (instrument=="hat") {
            const hat = hats[Math.floor(Math.random()*hats.length)];
            hat.start( time );
            hat.stop( time + .5 );
        }
    }

    beats.nameToFunciton.get(beatName)(beatNumber, playRandom);
}

function scheduler() {
    // while there are notes that will need to play before the next interval, 
    // schedule them and advance the pointer.
    while (nextNoteTime < audioContext.currentTime + scheduleAheadTime ) {
        beatName = document.getElementById("timesig-select").value;
        scheduleNote( current16thNote, nextNoteTime );
        nextNote();
    }
}

function play() {
    if (!audioContext)
        audioContext = new AudioContext();

    if (!unlocked) {
      // play silent buffer to unlock the audio
      var buffer = audioContext.createBuffer(1, 1, 22050);
      var node = audioContext.createBufferSource();
      node.buffer = buffer;
      node.start(0);
      unlocked = true;
    }

    isPlaying = !isPlaying;

    if (isPlaying) { // start playing
        current16thNote = 0;
        nextNoteTime = audioContext.currentTime;
        timerWorker.postMessage("start");
        return `<span class="material-symbols-rounded md-48">stop</span>`;
    } else {
        timerWorker.postMessage("stop");
        return `<span class="material-symbols-rounded md-48">play_arrow</span>`;
    }
}

function togglePlay() {
    document.getElementById("play-btn").innerHTML = play();
}

function init() {

    getAudio();

    // run play() on play button click
    document.getElementById('play-btn').addEventListener('click', togglePlay);

    timerWorker = new Worker("scripts/metronomeworker.js");

    timerWorker.onmessage = function(e) {
        if (e.data == "tick") {
            // console.log("tick!");
            scheduler();
        }
        else
            console.log("message: " + e.data);
    };
    timerWorker.postMessage({"interval":lookahead});
}

window.addEventListener("load", init );

function getAudio() {
    // KICKS
    const kickARequest = new XMLHttpRequest();
    kickARequest.open("GET", "../audio/kick/KICK_V8_a.wav");
    kickARequest.responseType = "arraybuffer";
    kickARequest.onload = function() {
        let undecodedAudio = kickARequest.response;
        audioContext.decodeAudioData(undecodedAudio, (data) => kickABuffer = data);
    };
    kickARequest.send();

    const kickBRequest = new XMLHttpRequest();
    kickBRequest.open("GET", "../audio/kick/KICK_V8_b.wav");
    kickBRequest.responseType = "arraybuffer";
    kickBRequest.onload = function() {
        let undecodedAudio = kickBRequest.response;
        audioContext.decodeAudioData(undecodedAudio, (data) => kickBBuffer = data);
    };
    kickBRequest.send();

    const kickCRequest = new XMLHttpRequest();
    kickCRequest.open("GET", "../audio/kick/KICK_V8_c.wav");
    kickCRequest.responseType = "arraybuffer";
    kickCRequest.onload = function() {
        let undecodedAudio = kickCRequest.response;
        audioContext.decodeAudioData(undecodedAudio, (data) => kickCBuffer = data);
    };
    kickCRequest.send();

    // SNARES
    const snareARequest = new XMLHttpRequest();
    snareARequest.open("GET", "../audio/snare/SNARE_V6_a.wav");
    snareARequest.responseType = "arraybuffer";
    snareARequest.onload = function() {
        let undecodedAudio = snareARequest.response;
        audioContext.decodeAudioData(undecodedAudio, (data) => snareABuffer = data);
    };
    snareARequest.send();

    const snareBRequest = new XMLHttpRequest();
    snareBRequest.open("GET", "../audio/snare/SNARE_V6_b.wav");
    snareBRequest.responseType = "arraybuffer";
    snareBRequest.onload = function() {
        let undecodedAudio = snareBRequest.response;
        audioContext.decodeAudioData(undecodedAudio, (data) => snareBBuffer = data);
    };
    snareBRequest.send();

    const snareCRequest = new XMLHttpRequest();
    snareCRequest.open("GET", "../audio/snare/SNARE_V6_c.wav");
    snareCRequest.responseType = "arraybuffer";
    snareCRequest.onload = function() {
        let undecodedAudio = snareCRequest.response;
        audioContext.decodeAudioData(undecodedAudio, (data) => snareCBuffer = data);
    };
    snareCRequest.send();

    // HATS
    const hatBRequest = new XMLHttpRequest();
    hatBRequest.open("GET", "../audio/hat/HAT_A_CLOSED_V3_b.wav");
    hatBRequest.responseType = "arraybuffer";
    hatBRequest.onload = function() {
        let undecodedAudio = hatBRequest.response;
        audioContext.decodeAudioData(undecodedAudio, (data) => hatBBuffer = data);
    };
    hatBRequest.send();

    const hatCRequest = new XMLHttpRequest();
    hatCRequest.open("GET", "../audio/hat/HAT_A_CLOSED_V3_c.wav");
    hatCRequest.responseType = "arraybuffer";
    hatCRequest.onload = function() {
        let undecodedAudio = hatCRequest.response;
        audioContext.decodeAudioData(undecodedAudio, (data) => hatCBuffer = data);
    };
    hatCRequest.send();

    const hatDRequest = new XMLHttpRequest();
    hatDRequest.open("GET", "../audio/hat/HAT_A_CLOSED_V3_d.wav");
    hatDRequest.responseType = "arraybuffer";
    hatDRequest.onload = function() {
        let undecodedAudio = hatDRequest.response;
        audioContext.decodeAudioData(undecodedAudio, (data) => hatDBuffer = data);
    };
    hatDRequest.send();
}