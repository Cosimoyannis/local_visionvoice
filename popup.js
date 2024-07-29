// popup.js

let backgroundAudio;

function playBackgroundSound() {
  backgroundAudio = new Audio('Loading.wav');
  backgroundAudio.loop = true;
  backgroundAudio.play();
  backgroundAudio.volume = 0.4;
}

function stopBackgroundSound() {
  if (backgroundAudio) {
    backgroundAudio.pause();
    backgroundAudio.currentTime = 0; // Reset to the start
  }
}

function playNotificationSound() {
  const audio = new Audio('Ready.mp3'); // Ensure the path is correct
  audio.play();
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Extension opened');

  playBackgroundSound(); // Start playing the background sound

  const screenshotButton = document.getElementById('screenshot-button');
  screenshotButton.style.display = 'none';
  document.querySelector('h3').style.display = 'none';
  document.querySelector('img').style.display = 'none';

  chrome.runtime.sendMessage({ action: "captureScreenshot" }, async (response) => {
    if (response.screenshotUrl) {
      console.log('Screenshot captured:', response.screenshotUrl);
      const blob = await (await fetch(response.screenshotUrl)).blob();
      const formData = new FormData();
      formData.append('image', blob, 'screenshot.png');

      const resultDiv = document.getElementById('result');
      const loadingDiv = document.getElementById('loading');

      // Show loading spinner
      loadingDiv.classList.add('visible');
      resultDiv.innerHTML = '';

      try {
        const fetchResponse = await fetch('https://visionvoice-3fe2867078e2.herokuapp.com/analyze-image', {
          method: 'POST',
          body: formData
        });

        const data = await fetchResponse.json();
        console.log('Server response:', data);

        if (fetchResponse.ok) {
          const reader = new FileReader();
          reader.onload = function(e) {
            resultDiv.innerHTML = `
              <div class="center"><audio controls id="audio-player"></audio></div>
            `;

            const audioPlayer = document.getElementById('audio-player');
            audioPlayer.src = 'https://visionvoice-3fe2867078e2.herokuapp.com/audio';
            audioPlayer.load();
            stopBackgroundSound(); // Stop the background sound
            playNotificationSound(); // Play the notification sound
          };
          reader.readAsDataURL(blob);
        } else {
          resultDiv.innerHTML = `<p>Error: ${data.error}</p>`;
        }
      } catch (error) {
        console.error('Error:', error);
        resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
      } finally {
        // Hide loading spinner
        loadingDiv.classList.remove('visible');
      }
    } else {
      console.error('No screenshot URL received:', response.error);
      document.getElementById('result').innerHTML = `<p>Error: ${response.error}</p>`;
    }
  });
});
