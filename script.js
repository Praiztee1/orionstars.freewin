// Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBO0mX-bkrC0qiKhQGRO4wqsT2neRoLeP8",
  authDomain: "scamguard-alliance.firebaseapp.com",
  databaseURL: "https://scamguard-alliance-default-rtdb.firebaseio.com",
  projectId: "scamguard-alliance",
  storageBucket: "scamguard-alliance.appspot.com",
  messagingSenderId: "435955274973",
  appId: "1:435955274973:web:962945b4c3881c4b923734",
  measurementId: "G-Z16BYNC1LE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

let container = document.querySelector(".container");
let btn = document.getElementById("spin");

let numberOfSections = 8;
let degreesPerSection = 360 / numberOfSections;
let number = 0;
let spinning = false; // To keep track of whether the wheel is currently spinning

// The labels for each section
let labels = ['$5', '$10', 'Try Again', '$20', '$50', '$100', 'Try Again', '$500'];

// Function to fetch spin value from Firebase using email
function getSpinValueFromEmail() {
  var userEmail = localStorage.getItem('userEmail');
  if (!userEmail) {
    console.error('No email found in local storage.');
    return Promise.resolve(0); // Return 0 to prevent spinning
  }

  var formattedEmail = userEmail.replace('.', ','); // Handle email dots in Firebase keys

  return database.ref('users/' + formattedEmail + '/spin').once('value').then(function(snapshot) {
    var spinValue = snapshot.val();
    console.log('Spin value fetched:', spinValue);
    return spinValue || 0; // Default to 0 if no value is found
  }).catch(error => {
    console.error('Error fetching spin value:', error);
    return 0;
  });
}

// Function to update spin count and prize won in Firebase
function updateUserData(email, spinCount, prizeWon) {
  var formattedEmail = email.replace('.', ','); // Handle email dots in Firebase keys
  var userRef = database.ref('users/' + formattedEmail);

  if (spinCount <= 0) {
    userRef.update({
      spin: 0, // Ensure spin count is set to 0
      prizeWon: prizeWon
    }).then(() => {
      console.log('Data updated successfully');
      btn.disabled = true; // Disable the spin button
      Swal.fire({
        position: "center",
        icon: "error",
        title: 'NO SPINS LEFT',
        text: 'Please recharge or check back in 24 hours.',
        backdrop: false,
        showConfirmButton: true,
        confirmButtonText: 'OK',
      });
    }).catch(error => {
      console.error('Error updating data:', error);
    });
  } else {
    userRef.update({
      spin: spinCount,
      prizeWon: prizeWon
    }).then(() => {
      console.log('Data updated successfully');
    }).catch(error => {
      console.error('Error updating data:', error);
    });
  }
}

// Function to handle prize claiming and loader
function handlePrizeClaim(prizeWon) {
  Swal.fire({
    position: "center",
    icon: "success",
    title: `CONGRATULATIONS! YOU WON ${prizeWon}`,
    backdrop: false, // Ensure SweetAlert does not block interaction with the spin wheel
    showConfirmButton: true,
    confirmButtonText: 'Claim',
  }).then(() => {
    spinning = false; // Re-enable spinning after the alert is closed

    // Show the loader
    var loader = document.getElementById('custom-loader');
    loader.style.display = 'flex'; // Display the loader

    // Fetch spin value and update spin count and prize won
    getSpinValueFromEmail().then(spinValue => {
      var userEmail = localStorage.getItem('userEmail');
      let spinCount = spinValue - 1; // Decrement spin count
      updateUserData(userEmail, spinCount, prizeWon);
      
      // Remove the loader and reload the page after a short delay
      setTimeout(() => {
        loader.style.display = 'none'; // Hide the loader
        location.reload(); // Reload the page
      }, 0.6); // Adjust the delay time as needed
    });
  });
}

// Spin button functionality
btn.onclick = function () {
  if (spinning) return; // Prevent multiple spins

  spinning = true; // Set spinning to true to disable multiple spins

  getSpinValueFromEmail().then(spinValue => {
    if (spinValue <= 0) {
      console.log('No spins left.');
      Swal.fire({
        position: "center",
        icon: "error",
        title: 'NO SPINS LEFT',
        text: 'Please recharge or check back in 24 hours.',
        backdrop: false,
        showConfirmButton: true,
        confirmButtonText: 'OK',
      });
      spinning = false; // Re-enable spinning after the alert
      return;
    }

    container.style.transition = ''; // Reset any previous transitions

    // Spin the wheel fast for 4 seconds
    let spinDuration = 8000; // 8 seconds
    let fastSpins = 20; // Full rotations before stopping

    number += fastSpins * 360 + Math.ceil(Math.random() * 360); // Random stopping point
    container.style.transition = `transform ${spinDuration / 1050}s ease-out`;
    container.style.transform = `rotate(${number}deg)`;

    // Determine the winning section after the spin ends
    setTimeout(() => {
      // The result is the value at 0 degrees (the top of the wheel)
      let normalizedDegrees = number % 360;
      let sectionIndex = Math.floor((360 - normalizedDegrees) / degreesPerSection) % numberOfSections;
      let prizeWon = labels[sectionIndex];

      // Show "Try Again" alert for the "Try Again" sections
      if (prizeWon === 'Try Again') {
        Swal.fire({
          position: "center",
          icon: "error",
          title: 'Sorry, Please Try Again!',
          backdrop: false,
          showConfirmButton: true,
          confirmButtonText: 'OK',
        }).then(() => {
          spinning = false; // Re-enable spinning after the alert is closed
        });
      } else {
        // Trigger confetti and handle prize claim
        triggerConfetti();
        handlePrizeClaim(prizeWon);
      }
    }, spinDuration);
  });
};

// Function to create confetti blast
function triggerConfetti() {
  for (let i = 0; i < 100; i++) {
    createConfetti();
  }
}

function createConfetti() {
  const confetti = document.createElement('div');
  confetti.classList.add('confetti');
  document.body.appendChild(confetti);

  const angle = Math.random() * 360;
  const distance = Math.random() * 200 + 50;

  confetti.style.left = `${window.innerWidth / 2}px`;
  confetti.style.top = `${window.innerHeight / 2}px`;

  confetti.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
  confetti.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
  confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;

  setTimeout(() => {
    confetti.remove();
  }, 4000); // Confetti lasts for 4 seconds
}

// Show the loader and delay redirection during logout
function logout() {
  const userConfirmed = confirm('Are you sure you want to log out?');

  if (userConfirmed) {
    document.getElementById('custom-loaders').style.display = 'flex';

    setTimeout(() => {
      localStorage.clear();
      window.location.href = 'index.html';
    }, 2000); // 2-second delay
  }
}

// Fetch user email from storage and update the UI
document.addEventListener('DOMContentLoaded', function () {
  var userEmail = localStorage.getItem('userEmail');
  var loader = document.getElementById('custom-loader');

  if (userEmail) {
    document.getElementById('user-email').textContent = userEmail;
  } else {
    if (loader) {
      loader.style.display = 'flex';
    }
    setTimeout(() => {
      window.location.href = 'login.html'; // Redirect to login.html
    }, 1000); // Adjust the delay time as needed
  }
});

// Function to display the prize won in a specific element
function displayPrizeElsewhere(elementId) {
  var userEmail = localStorage.getItem('userEmail');
  if (!userEmail) {
    console.error('No email found in local storage.');
    return;
  }

  var formattedEmail = userEmail.replace('.', ','); // Handle email dots in Firebase keys

  database.ref('users/' + formattedEmail + '/prizeWon').once('value').then(function(snapshot) {
    var prizeWon = snapshot.val();
    console.log('Prize won fetched:', prizeWon);

    var displayElement = document.getElementById(elementId);
    if (displayElement) {
      displayElement.textContent = `You Won: ${prizeWon}`;
    } else {
      console.error('Element with ID', elementId, 'not found.');
    }
  }).catch(error => {
    console.error('Error fetching prize won:', error);
  });
}

// Example usage: Display the prize in an element with ID 'prize-display'
displayPrizeElsewhere('prize-display');



//payout button functions//
    // Get the modal elements
var agreementModal = document.getElementById("agreementModal");

// Get the button that opens the modal
var requestPayoutBtn = document.getElementById("request-payout-btn");

// Get the <span> element that closes the modal
var closeAgreementModal = document.getElementsByClassName("close")[0];

// Get the accept and decline buttons
var acceptAgreement = document.getElementById("acceptAgreement");
var declineAgreement = document.getElementById("declineAgreement");

// Get the loader element
var loader = document.getElementById("payout-loader");

// When the user clicks the button, open the modal 
requestPayoutBtn.onclick = function() {
    agreementModal.style.display = "block";
    document.body.classList.add("modal-open"); // Prevent background scroll
}

// When the user clicks on <span> (x), close the modal
closeAgreementModal.onclick = function() {
    agreementModal.style.display = "none";
    document.body.classList.remove("modal-open"); // Enable background scroll
}

// When the user clicks the accept button, show loader and delay redirect
acceptAgreement.onclick = function() {
    agreementModal.style.display = "none"; // Close modal
    document.body.classList.remove("modal-open"); // Enable background scroll
    
    // Show the loader
    loader.style.display = "flex";
    
    // Set a 2-second delay before redirecting
    setTimeout(function() {
        loader.style.display = "none"; // Hide the loader
        window.location.href = "payout.html"; // Redirect to payout page
    }, 2000); // 2 seconds = 2000 milliseconds
}

// When the user clicks the decline button, remain on the same page
declineAgreement.onclick = function() {
    agreementModal.style.display = "none"; // Close modal
    document.body.classList.remove("modal-open"); // Enable background scroll
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == agreementModal) {
        agreementModal.style.display = "none";
        document.body.classList.remove("modal-open"); // Enable background scroll
    }
}
