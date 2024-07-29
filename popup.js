// popup.js

let backgroundAudio;

// Function to play background sound
function playBackgroundSound() {
  backgroundAudio = new Audio('Loading.wav'); // Load the audio file
  backgroundAudio.loop = true; // Loop the audio
  backgroundAudio.play(); // Play the audio
  backgroundAudio.volume = 0.4; // Set volume to 40%
}

// Function to stop background sound
function stopBackgroundSound() {
  if (backgroundAudio) {
    backgroundAudio.pause(); // Pause the audio
    backgroundAudio.currentTime = 0; // Reset audio to start
  }
}

// Function to play notification sound
function playNotificationSound() {
  const audio = new Audio('Ready.mp3'); // Load the audio file
  audio.play(); // Play the audio
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Extension opened'); // Log that the extension popup has opened

  playBackgroundSound(); // Start playing background sound

  // Hide elements initially
  const screenshotButton = document.getElementById('screenshot-button');
  screenshotButton.style.display = 'none';
  document.querySelector('h3').style.display = 'none';
  document.querySelector('img').style.display = 'none';

  // Send a message to background script to capture screenshot
  chrome.runtime.sendMessage({ action: "captureScreenshot" }, async (response) => {
    if (response.screenshotUrl) {
      console.log('Screenshot captured:', response.screenshotUrl); // Log the screenshot URL
      const blob = await (await fetch(response.screenshotUrl)).blob(); // Fetch and convert the screenshot to a blob
      const formData = new FormData();
      formData.append('image', blob, 'screenshot.png'); // Append blob to form data

      const resultDiv = document.getElementById('result');
      const loadingDiv = document.getElementById('loading');

      loadingDiv.classList.add('visible'); // Show loading spinner
      resultDiv.innerHTML = ''; // Clear previous results

      try {
        // Send the screenshot to the server for analysis
        const fetchResponse = await fetch('https://visionvoice-3fe2867078e2.herokuapp.com/analyze-image', {
          method: 'POST',
          body: formData
        });

        const data = await fetchResponse.json(); // Parse the JSON response
        console.log('Server response:', data); // Log the server response

        if (fetchResponse.ok) {
          const reader = new FileReader();
          reader.onload = function(e) {
            resultDiv.innerHTML = `
              <div class="center"><audio controls id="audio-player"></audio></div>
            `;

            const audioPlayer = document.getElementById('audio-player');
            audioPlayer.src = 'https://visionvoice-3fe2867078e2.herokuapp.com/audio'; // Set audio source to server response
            audioPlayer.load(); // Load the audio
            stopBackgroundSound(); // Stop background sound
            playNotificationSound(); // Play notification sound
          };
          reader.readAsDataURL(blob); // Convert blob to data URL
        } else {
          resultDiv.innerHTML = `<p>Error: ${data.error}</p>`; // Display error message
        }
      } catch (error) {
        console.error('Error:', error); // Log error
        resultDiv.innerHTML = `<p>Error: ${error.message}</p>`; // Display error message
      } finally {
        loadingDiv.classList.remove('visible'); // Hide loading spinner
      }
    } else {
      console.error('No screenshot URL received:', response.error); // Log error if no screenshot URL
      document.getElementById('result').innerHTML = `<p>Error: ${response.error}</p>`; // Display error message
    }
  });
});
