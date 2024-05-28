document.addEventListener('DOMContentLoaded', function() {
    var chatBox = document.getElementById('chatMessages');
    var userInput = document.getElementById('userMessage');
    var sendButton = document.getElementById('send-button');
    var messengerIcon = document.querySelector('.messenger-icon');
    var chatboxContainer = document.querySelector('.chatbox-container');
    var closeButton = document.querySelector('.close-button');
    var refreshButton = document.querySelector('.refresh-button');
    let userEmails = []; // Array to store multiple email addresses
    let userNames = [];  // Array to store multiple names

    function closeChatbox() {
        chatBox.innerHTML = '';
        chatboxContainer.style.display = 'none';
    }

    closeButton.addEventListener('click', closeChatbox);

    refreshButton.addEventListener('click', function() {
        chatBox.innerHTML = ''; // Clear chat history
        displayUserDetailsForm(); 
    });

    messengerIcon.addEventListener('click', function() {
        if (chatboxContainer.style.display === 'none' || !chatboxContainer.style.display) {
            chatboxContainer.style.display = 'block';
            userInput.focus();
            displayUserDetailsForm();
        } else {
            chatboxContainer.style.display = 'none';
        }
        userInput.addEventListener('keydown', function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                sendMessage();
            }
        });
    });

    sendButton.addEventListener('click', sendMessage);

    function sendMessage() {
        var message = userInput.value.trim();
        if (message === '') return;

        displayUserMessage(message);
        userInput.value = ''; // Clear user input

        var latestUserEmail = userEmails[userEmails.length - 1];
        var latestUserName = userNames[userNames.length - 1];

        fetch('/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                email: latestUserEmail,
                name: latestUserName
            })
        })
        .then(response => response.json())
        .then(data => {
            displayBotMessage(data.response);
        })
        .catch(error => console.error('Error:', error));
    }

    function displayUserDetailsForm() {
        var formContainer = document.createElement('div');
        formContainer.classList.add('form-container');

        var nameLabel = document.createElement('label');
        nameLabel.textContent = 'Please enter your name:';
        nameLabel.htmlFor = 'userName';
        formContainer.appendChild(nameLabel);

        var nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'userName';
        nameInput.classList.add('user-input');
        formContainer.appendChild(nameInput);

        var emailLabel = document.createElement('label');
        emailLabel.textContent = 'Please enter your email address:';
        emailLabel.htmlFor = 'userEmail';
        formContainer.appendChild(emailLabel);

        var emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.id = 'userEmail';
        emailInput.classList.add('user-input');
        formContainer.appendChild(emailInput);

        var submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.classList.add('submit-button');
        submitButton.addEventListener('click', function() {
            var name = nameInput.value.trim();
            var email = emailInput.value.trim();

            if (name && email) {
                userNames.push(name); // Store the name in the array
                userEmails.push(email); // Store the email in the array
                console.log("User names:", userNames); // Debug log
                console.log("User emails:", userEmails); // Debug log
                formContainer.remove();
                insertUserDetails(name, email);
                
                fetchGreetingResponse();
            } else {
                displayBotMessage("Name and email are required!");
            }
        });

        formContainer.appendChild(submitButton);
        chatBox.appendChild(formContainer);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function displayUserMessage(message) {
        var messageContainer = document.createElement('div');
        messageContainer.classList.add('user-message-container');

        var userImage = document.createElement('img');
        userImage.src = 'static/assets/userimage2.png';
        userImage.classList.add('user-image');

        var messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.classList.add('user-message');
        messageElement.style.color = 'white';

        messageContainer.appendChild(messageElement);
        messageContainer.appendChild(userImage);
        chatBox.appendChild(messageContainer);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function displayBotMessage(message) {
        var messageContainer = document.createElement('div');
        messageContainer.classList.add('bot-message-container');

        var botImage = document.createElement('img');
        botImage.src = 'static/assets/Mira_black.png';
        botImage.classList.add('bot-image');

        var messageElement = document.createElement('p');
        messageElement.innerHTML = message.replace(/\n/g, "<br>");
        messageElement.classList.add('bot-message');
        messageElement.style.color = 'white';

        var whiteLinks = messageElement.querySelectorAll('a');
        whiteLinks.forEach(function(link) {
            link.style.color = 'white';
        });

        messageContainer.appendChild(botImage);
        messageContainer.appendChild(messageElement);
        chatBox.appendChild(messageContainer);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function fetchGreetingResponse() {
        var latestUserEmail = userEmails[userEmails.length - 1];
        var latestUserName = userNames[userNames.length - 1];

        fetch('/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'greeting',
                email: latestUserEmail,
                name: latestUserName
            })
        })
        .then(response => response.json())
        .then(data => {
            displayBotMessage(data.response);
        })
        .catch(error => console.error('Error:', error));
    }
    function insertUserDetails(name, email) {
        fetch('/insert-details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to insert details');
            }
        })
        .then(data => {
            // Display success message
            displayBotMessage(data.message);
        })
        .catch(error => {
            // Display error message
            displayBotMessage(error.message);
        });
    }
    

    function displayFeedbackMessage() {
        var feedbackContainer = document.createElement('div');
        feedbackContainer.classList.add('feedback-container');

        var feedbackMessage = document.createElement('p');
        feedbackMessage.textContent = "Was I able to answer your question?";
        feedbackContainer.appendChild(feedbackMessage);

        var likeButton = document.createElement('button');
        likeButton.textContent = "👍";
        likeButton.classList.add('feedback-button');
        likeButton.addEventListener('click', function() {
            displayUserMessage('👍');
            setTimeout(function() {
                fetchFeedbackResponse('like');
            }, 500);
        });
        feedbackContainer.appendChild(likeButton);

        var dislikeButton = document.createElement('button');
        dislikeButton.textContent = "👎";
        dislikeButton.classList.add('feedback-button');
        dislikeButton.addEventListener('click', function() {
            displayUserMessage('👎');
            setTimeout(function() {
                fetchFeedbackResponse('dislike');
            }, 500);
        });
        feedbackContainer.appendChild(dislikeButton);

        chatBox.appendChild(feedbackContainer);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function fetchFeedbackResponse(feedback) {
        var latestUserEmail = userEmails[userEmails.length - 1];
        var latestUserName = userNames[userNames.length - 1];

        fetch('/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                feedback: feedback,
                email: latestUserEmail,
                name: latestUserName
            })
        })
        .then(response => response.json())
        .then(data => {
            displayBotMessage(data.response);
        })
        .catch(error => console.error('Error:', error));
    }
});
