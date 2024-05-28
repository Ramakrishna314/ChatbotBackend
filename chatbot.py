from flask import Flask, request, jsonify, send_from_directory
import spacy
import random
import string
import mysql.connector
import logging

app = Flask(__name__)
nlp = spacy.load("en_core_web_sm")
users = {}

# Database connection
myconn = mysql.connector.connect(
    host="localhost",
    user="root",
    passwd="Ramakrishna@314",
    database="ramadb"
)
cur = myconn.cursor()

# Greeting responses
greeting_responses = [
    "Hello! How can I assist you today?",
    "Hi there! What can I do for you?",
    "Greetings! How can I help you?",
]

@app.route('/insert-details', methods=['POST'])
def insert_details():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')

        if not name or not email:
            return jsonify({"message": "Name and email are required"}), 400

        # Store user details
        users[email] = {"name": name, "email": email}

        return jsonify({"message": "Details inserted successfully"}), 200
    except Exception as e:
        logging.error(f"Error in insert_details: {e}")
        return jsonify({"message": str(e)}), 500


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/send-message', methods=['POST'])
def send_message():
    if request.method == 'POST':
        data = request.json
        user_input = data['message']

        if user_input.lower() == 'greeting':
            response = random.choice(greeting_responses)
            intent = 'greeting'
        else:
            intent = recognize_intent(user_input)
            response, intent = generate_response(intent, user_input)

        return jsonify({'response': response, 'intent': intent})

    return jsonify({'error': 'Method Not Allowed'}), 405

def recognize_intent(user_input):
    # Placeholder implementation
    doc = nlp(user_input)
    if 'order' in doc.text:
        return 'order_inquiry'
    return 'general_inquiry'

def generate_response(intent, user_input):
    # Placeholder implementation
    if intent == 'order_inquiry':
        return "I can help you with your order.", intent
    return "I'm here to help!", intent

if __name__ == "__main__":
    app.run(debug=True)
