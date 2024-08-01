/* document.getElementById('screenshot-button').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); // Get the active tab in the current window
    chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, async (dataUrl) => { // Capture visible part of the tab
      const blob = await (await fetch(dataUrl)).blob(); // Fetch the screenshot data and convert to blob
      const formData = new FormData();
      formData.append('image', blob, 'screenshot.png'); // Append the blob to form data

      const resultDiv = document.getElementById('result');
      const loadingDiv = document.getElementById('loading');

      loadingDiv.classList.add('visible'); // Show loading spinner
      resultDiv.innerHTML = ''; // Clear previous results

      try {
        // Send the screenshot to the server for analysis
        const response = await fetch('/analyze-image', {
          method: 'POST',
          body: formData
        });

        const data = await response.json(); // Parse the JSON response

        const reader = new FileReader();
        reader.onload = function(e) {
          resultDiv.innerHTML = `
            <img src="${e.target.result}" alt="Screenshot Image" style="max-width: 100%; max-height: 30vh; margin-bottom: 20px;">
            <p>${data.content}</p>
            <audio controls id="audio-player"></audio>`; // Display the screenshot and analysis result
          
          const audioPlayer = document.getElementById('audio-player');
          audioPlayer.src = '/audio'; // Set audio source to server response
          audioPlayer.load(); // Load the audio
        };
        reader.readAsDataURL(blob); // Convert blob to data URL
      } catch (error) {
        resultDiv.innerHTML = `<p>Error: ${error.message}</p>`; // Display error message
      } finally {
        loadingDiv.classList.remove('visible'); // Hide loading spinner
      }
    });
  } catch (error) {
    document.getElementById('result').innerHTML = `<p>Error: ${error.message}</p>`; // Display error message
  }
});
 */