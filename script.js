 // Typing effect in placeholder
    const placeholder = "Type your sentence here...";
    let i = 0;
    function typeWriter() {
      if (i < placeholder.length) {
        document.getElementById("inputText").placeholder += placeholder.charAt(i);
        i++;
        setTimeout(typeWriter, 80);
      }
    }
    window.onload = typeWriter;


  document.getElementById('correctButton').addEventListener('click', function () {
  const inputText = document.getElementById('inputText').value.trim();
  const outputTextArea = document.getElementById('outputText');

  // If input is empty, do not process
  if (!inputText) {
    outputTextArea.value = "Please enter text to correct.";
    return;
  }

  // Show processing message
  outputTextArea.value = "Processing...";

  // Simulate processing (replace with actual correction logic/API call)
  setTimeout(() => {
    // Example placeholder for corrected output
    const correctedText = fakeGrammarCorrection(inputText);

    // Display only the corrected output
    outputTextArea.value = correctedText;
  }, 1000); // 1-second simulated delay
});

// Placeholder function for grammar correction logic
function fakeGrammarCorrection(text) {
  // Example: Capitalize first letter, simulate fix
  return text.charAt(0).toUpperCase() + text.slice(1).replace(/\si\s/g, ' I ');
}


  /* document.getElementById('correctButton').addEventListener('click', function() {
    const inputText = document.getElementById('inputText').value;
    const outputTextArea = document.getElementById('outputText');

    // Simulate a loading process (you can replace this with actual API calls)
    outputTextArea.value = "Processing..."; // Show loading text

    // Simulate a delay for processing (e.g., API call)
    setTimeout(() => {
        // For demonstration, we will just echo the input text as the corrected text
        // You can replace this with actual spelling correction logic
        outputTextArea.value = inputText; // Replace with actual corrected text
    }, 1000); // Simulate a 1-second delay
});*/


 function toggleDarkMode() {
  const body = document.body;
  const icon = document.getElementById('modeIcon');

  body.classList.toggle('dark-mode');

  // Change icon based on mode
  if (body.classList.contains('dark-mode')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    icon.style.color = '#FFC107'; // Set sun icon color to yellow
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
    icon.style.color = ''; // Reset to default color
  }
}



//Integration....


document.addEventListener("DOMContentLoaded", function () {
  const correctButton = document.getElementById("correctButton");
  const clearButton = document.getElementById("clearButton");
  const inputText = document.getElementById("inputText");
  const outputText = document.getElementById("outputText");

  correctButton.addEventListener("click", async () => {
    const text = inputText.value.trim();

    if (!text) {
      alert("⚠️ Please enter some text to correct.");
      return;
    }

    // Disable button and show loading state
    correctButton.disabled = true;
    correctButton.innerText = "Correcting...";

    try {
      const response = await fetch("http://127.0.0.1:5000/api/correct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();
      outputText.value = data.correctedText || "No correction found.";
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Failed to connect to backend. Make sure Flask is running.");
    } finally {
      correctButton.disabled = false;
      correctButton.innerText = "Check Spelling";
    }
  });

  clearButton.addEventListener("click", () => {
    inputText.value = "";
    outputText.value = "";
  });
});

 document.getElementById('shareBtn').addEventListener('click', function () {
    const shareData = {
      title: 'Grammar Corrector Tool',
      text: 'Check out this awesome grammar correction website!',
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => console.log('Shared successfully!'))
        .catch((error) => console.error('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(shareData.url)
        .then(() => alert("Link copied to clipboard! Share it with your friends 🎉"))
        .catch((error) => console.error('Clipboard error:', error));
    }
  });

