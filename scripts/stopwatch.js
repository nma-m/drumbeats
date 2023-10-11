const time = document.querySelector('.stopwatch-display')
const startBtn = document.querySelector('#play-btn')
const clearBtn = document.querySelector('#reset-btn')
const stopwatch = { elapsedTime: 0 }

startBtn.addEventListener('click', () => {
  if (startBtn.innerHTML === 'Play') {
    startStopwatch();
    startBtn.innerHTML = 'Pause'
  } else {
    stopwatch.elapsedTime += Date.now() - stopwatch.startTime
    clearInterval(stopwatch.intervalId)
    startBtn.innerHTML = 'Play'
  }
})

clearBtn.addEventListener('click', () => {
  stopwatch.elapsedTime = 0
  stopwatch.startTime = Date.now()
  displayTime(0, 0, 0, 0)
})

function startStopwatch() {
  //reset start time
  stopwatch.startTime = Date.now();
  //run `setInterval()` and save id
  stopwatch.intervalId = setInterval(() => {
    //calculate elapsed time
    const elapsedTime = Date.now() - stopwatch.startTime + stopwatch.elapsedTime
    //calculate different time measurements based on elapsed time
    const milliseconds = parseInt((elapsedTime%1000)/10)
    const seconds = parseInt((elapsedTime/1000)%60)
    const minutes = parseInt((elapsedTime/(1000*60))%60)
    const hour = parseInt((elapsedTime/(1000*60*60))%24);
    //display time
    displayTime(hour, minutes, seconds, milliseconds)
  }, 100);
}

function displayTime(hour, minutes, seconds) {
  const leadZeroTime = [hour, minutes, seconds].map(time => time < 10 ? `0${time}` : time)
  time.innerHTML = leadZeroTime.join(':')
}