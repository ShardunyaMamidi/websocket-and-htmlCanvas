function joinRoom() {
        const user = document.getElementById('username').value.trim();
        const room = document.getElementById('roomid').value.trim();

        if (user && room) {
            // Redirect to your main canvas page with parameters
            window.location.href = `index.html?room=${encodeURIComponent(room)}&user=${encodeURIComponent(user)}`;
        } else {
            alert("Please enter both a username and a Room ID");
        }
    }