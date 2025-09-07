$(function() {
  const sounds = {
    start: new Audio('start.mp3'),
    pause: new Audio('pause.mp3'),
    stop: new Audio('stop.mp3'),
    beep: new Audio('beep.mp3'),
    countdown: new Audio('321-counter.mp3')
  };

  let stages = [], current = 0, timer = null, timeLeft = 0, stage = null, countdownInterval = null;

  function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }

  function updateDisplay() {
    $('#counter').text(padTo2Digits(timeLeft));
  }

  function startTimer() {
    timer = setInterval(() => {
      timeLeft--;
      updateDisplay();

      if (timeLeft > 0 && timeLeft <= 5) {
        sounds.beep.currentTime = 0;
        sounds.beep.play();
      }

      if (timeLeft <= 0) {
        clearInterval(timer);
        current++;
        runStage();
      }
    }, 1000);
  }

  function runStage() {
    if (current >= stages.length) {
      $('#status').text('Done');
      sounds.stop.play();
      $('#toggleBtn').removeClass('btn-warning').addClass('btn-success').html('<i class="bi bi-play-fill"></i> Start').prop('disabled', false);
      $('#stopBtn').prop('disabled', true);
      $('#setup-form').removeClass('disabled');
      $('#counter').text('00');
      stages = [];
      return;
    }

    stage = stages[current];
    timeLeft = stage.seconds;
    $('#status').text(stage.type === 'exercise' ? `Exercise ${stage.number} / ${stage.stations}` : 'Pause');
    updateDisplay();

    if ((current === 1 && stage.type !== 'pause') || stage.type === 'exercise') {
      sounds.start.play();
    } else {
      sounds.pause.play();
    }

    startTimer();
  }

  function initialCountdown() {
    let count = 3;
    $('#status').text('Get Ready');
    $('#counter').text(padTo2Digits(count));
    sounds.countdown.currentTime = 0;
    sounds.countdown.play();
    countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        $('#counter').text(padTo2Digits(count));
      } else {
        clearInterval(countdownInterval);
        countdownInterval = null;
        $('#toggleBtn').prop('disabled', false);
        runStage();
      }
    }, 1000);
  }

  $('#toggleBtn').on('click', function() {
    if (stages.length === 0 && !timer && !countdownInterval) {
      const stations = parseInt($('#stations').val(), 10);
      const exercise = parseInt($('#exercise').val(), 10);
      const pause = parseInt($('#pause').val(), 10);

      stages = [];
      for (let i = 1; i <= stations; i++) {
        stages.push({ type: 'exercise', seconds: exercise, number: i, stations: stations });
        if (i < stations) {
          stages.push({ type: 'pause', seconds: pause });
        }
      }

      current = 0;
      $(this).prop('disabled', true).removeClass('btn-success').addClass('btn-warning').html('<i class="bi bi-pause-fill"></i> Pause');
      $('#stopBtn').prop('disabled', false);
      $('#setup-form').addClass('disabled');
      initialCountdown();
    } else if (timer) {
      clearInterval(timer);
      timer = null;
      $(this).html('<i class="bi bi-play-fill"></i> Resume');
      sounds.start.pause();
      sounds.start.currentTime = 0;
      sounds.pause.currentTime = 0;
      sounds.pause.play();
    } else {
      startTimer();
      $(this).html('<i class="bi bi-pause-fill"></i> Pause');
      sounds.pause.pause();
      sounds.pause.currentTime = 0;
      sounds.start.currentTime = 0;
      sounds.start.play();
    }
  });

  $('#stopBtn').on('click', function() {
    clearInterval(timer);
    timer = null;
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    sounds.countdown.pause();
    sounds.countdown.currentTime = 0;
    $('#toggleBtn').removeClass('btn-warning').addClass('btn-success').html('<i class="bi bi-play-fill"></i> Start').prop('disabled', false);
    $('#stopBtn').prop('disabled', true);
    $('#status').text('Stopped');
    $('#counter').text('00');
    $('#setup-form').removeClass('disabled');
    sounds.stop.play();
    stages = [];
  });
});
