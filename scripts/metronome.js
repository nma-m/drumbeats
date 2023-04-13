var audioContext = new AudioContext();
var unlocked = false;
var isPlaying = false;      // Are we currently playing?
var startTime;              // The start time of the entire sequence.
var current16thNote;        // What note is currently last scheduled?
var kickABuffer;            // unretrieved kick_a sound
var snareABuffer;           // unretrieved snare_a sound
var hatABuffer;             // unretrieved hat_a sound
var lookahead = 25.0;       // How frequently to call scheduling function 
                            //(in milliseconds)
var scheduleAheadTime = 0.1;    // How far ahead to schedule audio (sec)
                            // This is calculated from lookahead, and overlaps 
                            // with next interval (in case the timer is late)
var nextNoteTime = 0.0;     // when the next note is due.
var noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note
var noteLength = 0.05;      // length of "beep" (in seconds)
var canvas,                 // the canvas element
    canvasContext;          // canvasContext is the canvas' context 2D
var last16thNoteDrawn = -1; // the last "box" we drew on the screen
var notesInQueue = [];      // the notes that have been put into the web audio,
                            // and may or may not have played yet. {note, time}
var timerWorker = null;     // The Web Worker used to fire timer messages


// First, let's shim the requestAnimationFrame API, with a setTimeout fallback
window.requestAnimFrame = window.requestAnimationFrame;

function nextNote() {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / document.getElementById("tempo-slider").value;
                                              // Notice this picks up the CURRENT 
                                              // tempo value to calculate beat length.
    nextNoteTime += 0.25 * secondsPerBeat;    // Add beat length to last beat time

    current16thNote++;    // Advance the beat number, wrap to zero
    if (current16thNote == 16) {
        current16thNote = 0;
    }
}

function scheduleNote( beatNumber, time ) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push( { note: beatNumber, time: time } );

    /*
    TODO: let user set their desired subdivision
    if ( (noteResolution==1) && (beatNumber%2))
        return; // we're not playing non-8th 16th notes
    if ( (noteResolution==2) && (beatNumber%4))
        return; // we're not playing non-quarter 8th notes
     */

    // create the audio
    const kickASource = audioContext.createBufferSource();
    kickASource.buffer = kickABuffer;
    kickASource.connect(audioContext.destination);

    const snareASource = audioContext.createBufferSource();
    snareASource.buffer = snareABuffer;
    snareASource.connect(audioContext.destination);

    const hatASource = audioContext.createBufferSource();
    hatASource.buffer = hatABuffer;
    hatASource.connect(audioContext.destination);

    if (beatNumber === 4 || beatNumber === 12) { // beats 2 and 4
        kickASource.start( time );
        kickASource.stop( time + .5 );

        snareASource.start( time );
        snareASource.stop( time + .5 );

        hatASource.start( time );
        hatASource.stop( time + .5 );
    }
    else if (beatNumber % 4 === 0 ) {   // all downbeats
        // osc.frequency.value = 440.0;
        kickASource.start( time );
        kickASource.stop( time + .5 );

        hatASource.start( time );
        hatASource.stop( time + .5 );
    }
    else if (beatNumber % 2 === 0) {   // the ands
        hatASource.start( time );
        hatASource.stop( time + .5 );
    }
    else {                             // other syncopations
        return;
    }
}

function scheduler() {
    // while there are notes that will need to play before the next interval, 
    // schedule them and advance the pointer.
    while (nextNoteTime < audioContext.currentTime + scheduleAheadTime ) {
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
        return "Pause";
    } else {
        timerWorker.postMessage("stop");
        return "Play";
    }
}

function togglePlay() {
    document.getElementById("play-button").innerText = play();
}

function init() {

    getAudio();

    // run play() on play button click
    document.getElementById('play-button').addEventListener('click', togglePlay);

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
    
        // SNARES
        const snareARequest = new XMLHttpRequest();
        snareARequest.open("GET", "../audio/snare/SNARE_V6_a.wav");
        snareARequest.responseType = "arraybuffer";
        snareARequest.onload = function() {
            let undecodedAudio = snareARequest.response;
            audioContext.decodeAudioData(undecodedAudio, (data) => snareABuffer = data);
        };
        snareARequest.send();

        // HATS
        const hatARequest = new XMLHttpRequest();
        hatARequest.open("GET", "../audio/hat/HAT_A_CLOSED_V3_a.wav");
        hatARequest.responseType = "arraybuffer";
        hatARequest.onload = function() {
            let undecodedAudio = hatARequest.response;
            audioContext.decodeAudioData(undecodedAudio, (data) => hatABuffer = data);
        };
        hatARequest.send();
}