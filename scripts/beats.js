// Beat name -> function mapping
export const nameToFunciton = new Map([
    ['basic-four-four', basicFourFour],
    ['basic-three-four', basicThreeFour],
    ['basic-six-eight', basicSixEight]
]);

// Beat catogories
const fourFourGrooves = new Set([
    'basic-four-four'
]);

const threeFourGrooves = new Set([
    'basic-three-four'
]);

const sixEightGrooves = new Set([
    'basic-six-eight'
]);

// Set the metronome's bar length depending on the beat
export function getBarLegnth(groove) {
    if (fourFourGrooves.has(groove)) {
        return 16;
    }
    else if (threeFourGrooves.has(groove)) {
        return 12;
    }
    else if (sixEightGrooves.has(groove)) {
        return 12;
    }
}

// Beats
function basicFourFour(beatNumber, playFunction) {
    if (beatNumber === 0) { // beat 1
        playFunction('kick');
        playFunction('hat');
        return;
    }
    else if (beatNumber === 4 || beatNumber === 12) { // beats 2 and 4
        playFunction('snare');
        playFunction('hat');
    }
    else if (beatNumber === 8) { // beat 3
        playFunction('kick');
        playFunction('hat');
    }
    else if (beatNumber % 2 === 0) { // the downbeats and ands
        playFunction('hat');
    }
    else { // other syncopations
        return;
    }
};

function basicThreeFour(beatNumber, playFunction) {
    if (beatNumber === 0) { // beat 1
        playFunction('kick');
        playFunction('hat');
        return;
    }
    else if (beatNumber === 8) { // beat 3
        playFunction('snare');
        playFunction('hat');
    }
    else if (beatNumber === 6) { // beat 2 and
        playFunction('kick');
    }
    else if (beatNumber % 2 === 0) { // the downbeats and ands
        playFunction('hat');
    }
    else { // other syncopations
        return;
    }
};

function basicSixEight(beatNumber, playFunction) {
    if (beatNumber === 0) { // beat 1
        playFunction('kick');
        playFunction('hat');
        return;
    }
    else if (beatNumber === 6) { // beat 3
        playFunction('kick');
        playFunction('hat');
    }
    else if (beatNumber === 3 || beatNumber === 9) { // all downbeats
        playFunction('snare');
        playFunction('hat');
    }
    else { // other syncopations
        playFunction('hat');
    }
};