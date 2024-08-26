// Initialize Firebase
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
  firebase.initializeApp(firebaseConfig);
  
  document.addEventListener('DOMContentLoaded', function () {
    var dataOutput = document.getElementById('data-output');
    var userEmail = localStorage.getItem('userEmail');
    
    if (userEmail) {
      fetchSpinValue(userEmail);
    } else {
      dataOutput.textContent = 'Email Error.';
    }
  });
  
  function fetchSpinValue(email) {
    var database = firebase.database();
    var usersRef = database.ref('users');
  
    usersRef.once('value').then(function(snapshot) {
      var data = snapshot.val();
      var spinValue = ' 0';
  
      // Loop through all users
      for (var userId in data) {
        if (data.hasOwnProperty(userId)) {
          if (data[userId].email === email) {
            spinValue = data[userId].spin || '0';
            break; // Exit loop once the matching user is found
          }
        }
      }
  
      document.getElementById('data-output').textContent = 'SPIN LEFT: ' + spinValue;
    }).catch(function (error) {
      console.error('Error fetching data:', error);
      document.getElementById('data-output').textContent = 'Error fetching data.';
    });
  }
  
  //profile name view//
  document.addEventListener('DOMContentLoaded', function () {
    var userName = localStorage.getItem('userName');
    var loader = document.getElementById('custom-loader');

    if (userName) {
        document.getElementById('user-name').textContent = userName;
    } else {
        // Show the custom loader
        loader.style.display = 'flex';

        // Delay the redirection to show the loader
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000); // Adjust the delay time as needed
    }
});
