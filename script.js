const sequenceLength = 8;
let clickedSequence = [];
const majorIP = "https://192.168.1.5:5000";
const debug = "https://hrachovec.hopto.org";
const totalButtons = 36;
const radius = 400; // Adjust this value to change the size of the circle
const angleStep = (2 * Math.PI) / totalButtons;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createButtons() {
    const grid = document.getElementById('buttonGrid');
    if (!grid) {
        console.error("Could not find element with id 'buttonGrid'");
        return;
    }

    const centerDisplay = document.createElement('div');
    centerDisplay.id = 'centerDisplay';
    centerDisplay.style.position = 'absolute';
    centerDisplay.style.left = '50%';
    centerDisplay.style.top = '50%';
    centerDisplay.style.transform = 'translate(-50%, -50%)';
    centerDisplay.style.display = 'flex';
    centerDisplay.style.flexDirection = 'column';
    centerDisplay.style.alignItems = 'center';
    grid.appendChild(centerDisplay);

    // Create 7 boxes
    const boxContainer = document.createElement('div');
    boxContainer.style.display = 'flex';
    boxContainer.style.marginBottom = '10px';
    for (let i = 0; i < 7; i++) {
        const box = document.createElement('div');
        box.className = 'sequence-box';
        box.style.width = '40px';
        box.style.height = '40px';
        box.style.border = '1px solid black';
        box.style.marginRight = '5px';
        boxContainer.appendChild(box);
    }
    centerDisplay.appendChild(boxContainer);

    // Create "Go!" button
    const goButton = document.createElement('button');
    goButton.textContent = 'Go!';
    goButton.addEventListener('click', checkSequence);
    goButton.disabled = false; // Enable the button from the start
    centerDisplay.appendChild(goButton);

    for (let i = 1; i <= totalButtons; i++) {
        const button = document.createElement('button');
        button.className = 'symbol-button';
        button.innerHTML = `<img src="/svg/A${i.toString().padStart(2, '0')}.svg" alt="Symbol ${i}">`;
        button.addEventListener('click', () => buttonClicked(i));

        // Calculate the position of each button
        const angle = angleStep * (i - 1) - Math.PI / 2; // Start from the top
        const x = radius * Math.cos(angle) + radius - 30;
        const y = radius * Math.sin(angle) + radius - 30;

        button.style.position = 'absolute';
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;

        grid.appendChild(button);
    }

    console.log("Buttons created successfully");
}

function buttonClicked(buttonNumber) {
    if (clickedSequence.length < sequenceLength) {
        if (clickedSequence.length < 7) {
            const boxes = document.querySelectorAll('.sequence-box');
            const box = boxes[clickedSequence.length];
            box.innerHTML = `<img src="/svg/A${buttonNumber.toString().padStart(2, '0')}.svg" alt="Symbol ${buttonNumber}" style="width: 100%; height: 100%;">`;
        }
        
        clickedSequence.push(buttonNumber);
        console.log("Button clicked:", buttonNumber);

        if (clickedSequence.length === sequenceLength) {
            checkSequence();
        }
    }
}

function checkSequence() {
    console.log("Checking sequence:", clickedSequence);
    fetch(debug + '/check-sequence', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sequence: clickedSequence }),
        credentials: 'include'  // This is important for session cookies
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.correct) {
            window.location.href = debug + data.nextPage;
            console.log("Redirecting to:", window.location.href);
        } else {
            alert(data.message || 'Incorrect sequence. Try again.');
            resetDisplay();
        }
    })
    .catch(e => {
        console.error('There was a problem with the fetch operation:', e.message);
    });
}

function resetDisplay() {
    clickedSequence = [];
    const boxes = document.querySelectorAll('.sequence-box');
    boxes.forEach(box => box.innerHTML = '');
}

// Call createButtons when the script loads
createButtons();

console.log("Script loaded successfully");
