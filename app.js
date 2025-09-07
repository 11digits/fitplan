$(function() {
  const sounds = {
    start: new Audio('start.mp3'),
    pause: new Audio('pause.mp3'),
    stop: new Audio('stop.mp3'),
    beep: new Audio('beep.mp3'),
    countdown: new Audio('321-counter.mp3')
  };

  let stages = [], current = 0, timer = null, timeLeft = 0, stage = null;

  function updateDisplay() {
    $('#counter').text(timeLeft.toString().padStart(2, '0'));
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
      $('#stopBtn, #pauseBtn').addClass('d-none');
      $('#startBtn').prop('disabled', false);
      $('#setup-form').removeClass('d-none');
      return;
    }

    stage = stages[current];
    timeLeft = stage.seconds;
    $('#status').text(stage.type === 'exercise' ? `Exercise ${stage.number}` : 'Pause');
    updateDisplay();

    if (stage.type === 'exercise') {
      sounds.start.play();
    } else {
      sounds.pause.play();
    }

    startTimer();
  }

  function initialCountdown() {
    let count = 3;
    $('#status').text('Get Ready');
    $('#counter').text(count);
    sounds.countdown.currentTime = 0;
    sounds.countdown.play();
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        $('#counter').text(count);
      } else {
        clearInterval(countdownInterval);
        runStage();
      }
    }, 1000);
  }

  $('#startBtn').on('click', function() {
    const stations = parseInt($('#stations').val(), 10);
    const exercise = parseInt($('#exercise').val(), 10);
    const pause = parseInt($('#pause').val(), 10);

    stages = [];
    for (let i = 1; i <= stations; i++) {
      stages.push({ type: 'exercise', seconds: exercise, number: i });
      if (i < stations) {
        stages.push({ type: 'pause', seconds: pause });
      }
    }

    current = 0;
    $('#startBtn').prop('disabled', true);
    $('#stopBtn, #pauseBtn').removeClass('d-none');
    $('#setup-form').addClass('d-none');
    initialCountdown();
  });

  $('#pauseBtn').on('click', function() {
    if (timer) {
      clearInterval(timer);
      timer = null;
      $(this).html('<i class="bi bi-play-fill"></i> Resume');
      sounds.stop.play();
    } else {
      startTimer();
      $(this).html('<i class="bi bi-pause-fill"></i> Pause');
      sounds.stop.play();
    }
  });

  $('#stopBtn').on('click', function() {
    clearInterval(timer);
    timer = null;
    $('#startBtn').prop('disabled', false);
    $('#stopBtn, #pauseBtn').addClass('d-none');
    $('#pauseBtn').html('<i class="bi bi-pause-fill"></i> Pause');
    $('#status').text('Stopped');
    $('#counter').text('00');
    $('#setup-form').removeClass('d-none');
    sounds.stop.play();
  });
});
