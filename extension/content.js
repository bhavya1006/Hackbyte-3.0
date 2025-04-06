async function callApi(query) {
    try {
        let isFinished = false;
        sendLogToBackground(`Starting API call with query: ${query}`);

        while (!isFinished) {
            const response = await fetch('https://localhost:3000/api/hello', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) throw new Error(`API call failed with status ${response.status}`);

            const data = await response.json();
            sendLogToBackground(`API Response: ${JSON.stringify(data)}`);

            await showPrompt(data);

            // Wait until popup is closed (removed)
            await new Promise((resolve) => {
                const interval = setInterval(() => {
                    const popup = document.querySelector('.custom-popup');
                    if (!popup) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });

            isFinished = data.isFinished;

            if (!isFinished) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }

        sendLogToBackground('API interaction finished. Closing extension.');
    } catch (error) {
        sendLogToBackground(`Error during API calls: ${error.message}`);
        alert('An error occurred while processing your request.');
    }
}

function sendLogToBackground(message) {
    chrome.runtime.sendMessage({ action: 'logMessage', message });
}

async function showPrompt(response) {
    const targetId = response.id || 'default-target';
    const target = document.getElementById(targetId);
    if (!target) {
        alert(`Element with ID "${targetId}" not found.`);
        return;
    }

    const popup = document.createElement('div');
    popup.className = 'custom-popup';
    popup.textContent = response.message;
    Object.assign(popup.style, {
        position: 'absolute',
        backgroundColor: 'rgba(255, 87, 34, 0.9)',
        border: '2px solid #FF5722',
        color: '#fff',
        padding: '15px 30px',
        borderRadius: '12px',
        boxShadow: '0 8px 12px rgba(0, 0, 0, 0.4)',
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'center',
        zIndex: '10000',
    });

    const rect = target.getBoundingClientRect();
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.top = `${rect.bottom + window.scrollY + 15}px`;

    const arrow = document.createElement('div');
    Object.assign(arrow.style, {
        position: 'absolute',
        width: '0',
        height: '0',
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderBottom: '10px solid rgba(255, 87, 34, 0.9)',
        top: '-10px',
        left: 'calc(50% - 15px)',
    });

    popup.appendChild(arrow);
    document.body.appendChild(popup);

    target.addEventListener(response.action || 'click', () => {
        popup.remove();
    });
}
