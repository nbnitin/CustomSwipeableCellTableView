/* A simple countdown function that displays a countdown clock
*/

jQuery(document).ready(function() {
  const zeroPad = function(number, noDigits) {
    const numberString = String(number);
    const numberLength = numberString.length;
    if (numberLength >= noDigits) {
      return numberString;
    }
    return Array(noDigits - numberLength + 1).join('0') + number;
  };

  const remainingTime = function(endTime) {
    const t = Date.parse(endTime) - Date.parse(new Date());
    const seconds = Math.floor((t / 1000) % 60);
    const minutes = Math.floor((t / (1000 * 60)) % 60);
    const hours = Math.floor(t / (1000 * 60 * 60));
    return {
      'total': t,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    };
  };

  const updateClock = function(countdown, endTime) {
    const remaining = remainingTime(endTime);
    if (remaining.total < 0) {
      countdown.hide(0);
      clearInterval(timeInterval);
    }
    countdown.find('span.countdown-hours-value').html(zeroPad(remaining.hours, 2));
    countdown.find('span.countdown-minutes-value').html(zeroPad(remaining.minutes, 2));
    countdown.find('span.countdown-seconds-value').html(zeroPad(remaining.seconds, 2));
  };

  jQuery('[data-countdown-to-time]').each(function(i, block) {
    const jqBlock = jQuery(block);
    const endTime = jqBlock.data('countdown-to-time')
    updateClock(jqBlock, endTime);
    let timeInterval = setInterval(function() {
      updateClock(jqBlock, endTime);
    }, 1000);
  });
});
