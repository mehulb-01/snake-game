window.onload = function () {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    let snake;
    let direction;
    let nextDirection;
    let apple;
    let score;
    let isPlaying;
    let gameInterval;

    function initializeGame() {
        setTimeout(() => {
            snake = Array.from({ length: 3 }, (_, i) => ({ x: 300 - i * 15, y: 300, size: 14 }));
            direction = { x: 15, y: 0 };
            nextDirection = direction;
            apple = generateNewApple();
            score = 0;
            isPlaying = false;
            clearInterval(gameInterval);
            draw();
        }, 200);
    }

    function generateNewApple() {
        let newApplePosition;
        do {
            newApplePosition = {
                x: Math.floor(Math.random() * (canvas.width / 15)) * 15,
                y: Math.floor(Math.random() * (canvas.height / 15)) * 15
            };
        } while (snake.some(segment => segment.x === newApplePosition.x && segment.y === newApplePosition.y));

        return newApplePosition;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSnake();
        drawApple();

        // 🛠 Draw score inside the game window (top-right corner)
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
    }

    function drawSnake() {
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = 14;

        for (let i = 0; i < snake.length - 1; i++) {
            ctx.strokeStyle = "#4CAF50";
            ctx.beginPath();
            ctx.moveTo(snake[i].x + 7.5, snake[i].y + 7.5);
            ctx.lineTo(snake[i + 1].x + 7.5, snake[i + 1].y + 7.5);
            ctx.stroke();
        }

        drawSnakeEyes();
    }

    function drawSnakeEyes() {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(snake[0].x + 5, snake[0].y + 3, 3.5, 0, Math.PI * 2);
        ctx.arc(snake[0].x + 10, snake[0].y + 3, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(snake[0].x + 5, snake[0].y + 3, 1.5, 0, Math.PI * 2);
        ctx.arc(snake[0].x + 10, snake[0].y + 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    let appleBounceOffset = 0;
    let bounceDirection = 1;

    function drawApple() {
        // Update bounce offset to create a smooth up-down motion
        appleBounceOffset += bounceDirection * 0.5;
        if (appleBounceOffset > 5 || appleBounceOffset < -5) bounceDirection *= -1;

        let appleX = apple.x + 7;
        let appleY = apple.y + 7 + appleBounceOffset;

        // 🛠 Create a radial glow effect around the apple
        let glowGradient = ctx.createRadialGradient(appleX, appleY, 4, appleX, appleY, 14);
        glowGradient.addColorStop(0, "rgba(255, 102, 102, 0.8)"); // Bright core glow
        glowGradient.addColorStop(0.5, "rgba(210, 46, 46, 0.5)"); // Mid-tone glow
        glowGradient.addColorStop(1, "rgba(139, 0, 0, 0.2)"); // Subtle outer glow

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(appleX, appleY, 10, 0, Math.PI * 2);
        ctx.fill();

        // 🛠 Draw apple body with realistic shading
        let appleGradient = ctx.createRadialGradient(appleX, appleY, 4, appleX, appleY, 10);
        appleGradient.addColorStop(0, "#ff6b6b"); // Bright red core
        appleGradient.addColorStop(0.5, "#d22e2e"); // Mid-tone red
        appleGradient.addColorStop(1, "#8b0000"); // Darker outer shade

        ctx.fillStyle = appleGradient;
        ctx.beginPath();
        ctx.arc(appleX, appleY, 8, 0, Math.PI * 2);
        ctx.fill();

        // 🛠 Add glossy highlight for a realistic shine
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.arc(appleX + 2, appleY - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // 🛠 Draw a subtle leaf for extra realism
        let leafGradient = ctx.createLinearGradient(appleX - 2, appleY - 12, appleX + 8, appleY - 6);
        leafGradient.addColorStop(0, "#4caf50");
        leafGradient.addColorStop(1, "#2e7d32");

        ctx.fillStyle = leafGradient;
        ctx.beginPath();
        ctx.moveTo(appleX, appleY - 9);
        ctx.quadraticCurveTo(appleX - 6, appleY - 16, appleX + 6, appleY - 11);
        ctx.fill();
    }


    function update() {
        if (!isPlaying) return;
        direction = nextDirection;
        let newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y, size: 14 };

        if (newHead.x === apple.x && newHead.y === apple.y) {
            score += 10;
            apple = generateNewApple(); // ✅ Apple now moves properly
        } else {
            snake.pop();
        }

        if (checkCollision(newHead)) {
            pauseGame();
            setTimeout(() => initializeGame(), 1000); // ✅ Game auto-restarts after 1 second
            return;
        }

        snake.unshift(newHead);
        draw();
    }

    function checkCollision(head) {
        return (
            head.x < 0 || head.x >= canvas.width ||
            head.y < 0 || head.y >= canvas.height ||
            snake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)
        );
    }

    function startGame() {
        if (!isPlaying) {
            isPlaying = true;
            clearInterval(gameInterval);
            gameInterval = setInterval(update, 100);
        }
    }

    function pauseGame() {
        isPlaying = false;
        clearInterval(gameInterval);
    }

    document.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "ArrowUp": if (direction.y === 0) nextDirection = { x: 0, y: -15 }; break;
            case "ArrowDown": if (direction.y === 0) nextDirection = { x: 0, y: 15 }; break;
            case "ArrowLeft": if (direction.x === 0) nextDirection = { x: -15, y: 0 }; break;
            case "ArrowRight": if (direction.x === 0) nextDirection = { x: 15, y: 0 }; break;
        }
    });

    document.getElementById("playBtn").addEventListener("click", startGame);
    document.getElementById("pauseBtn").addEventListener("click", pauseGame);

    initializeGame();
};

