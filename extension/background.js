async function callApi(query) {
    try {
        let isFinished = false;
        sendLogToBackground(`Starting API call with query: ${query}`);
        // Send a message to the background script to capture a screenshot
chrome.runtime.sendMessage({ action: 'captureScreenshot' }, (response) => {
    console.log('Screenshot response:', response);
    if (response.status === 'Success') {
        console.log('Screenshot captured successfully:', response.screenshot);
        // You can use the base64 screenshot (response.screenshot) here
        // For example, display it in an <img> tag:
        const img = document.createElement('img');
        img.src = response.screenshot;
        img.style.maxWidth = '100%';
        document.body.appendChild(img);
    } else {
        console.error('Error capturing screenshot:', response.message);
    }
});
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

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'startQuery') {
        console.log('Background received query:', message.query);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: (query) => {
                        async function callApi(query) {
                            try {
                                let isFinished = false;
                                console.log(`Starting API call with query: ${query}`);
                                const screenshot = await new Promise((resolve, reject) => {
                                    chrome.runtime.sendMessage({ action: 'captureScreenshot' }, (response) => {
                                        console.log('Screenshot response:', response);
                                        if (response.status === 'Success') {
                                            resolve(response.screenshot);
                                        } else {
                                            reject(new Error(response.message));
                                        }
                                    });
                                });
                                console.log('Screenshot captured:', screenshot);
                                while (!isFinished) {
                                    const response = await fetch('http://localhost:3000/api/hello', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ query }),
                                    });

                                    if (!response.ok) throw new Error(`API call failed with status ${response.status}`);

                                    const data = await response.json();
                                    console.log(`API Response: ${JSON.stringify(data)}`);

                                    // Show popup
                                    const targetId = data.id || 'default-target';
                                    const target = document.getElementById(targetId);
                                    if (!target) {
                                        alert(`Element with ID "${targetId}" not found.`);
                                        return;
                                    }

                                    const popup = document.createElement('div');
                                    popup.className = 'custom-popup';
                                    popup.textContent = data.message;
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
                                    // Wait until popup is closed
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
                                        console.log('Waiting before next API call...');
                                        await new Promise((resolve) => setTimeout(resolve, 1000));
                                    }
                                }

                                console.log('API interaction finished.');
                            } catch (error) {
                                console.error(`Error during API calls: ${error.message}`);
                                alert('An error occurred while processing your request.');
                            }
                        }
                        callApi(query);
                    },
                    args: [message.query],
                });
                sendResponse({ status: 'Query started' });
            } else {
                console.error('No active tab found.');
                sendResponse({ status: 'Error', message: 'No active tab found' });
            }
        });

        return true; // Indicate that the response will be sent asynchronously
    } else if (message.action === 'logMessage') {
        console.log('Log:', message.message);
    } else if (message.action === 'closeExtension') {
        console.log('Extension should close now – not actionable directly from background.');
    } else if (message.action === 'captureScreenshot') {
        console.log('CaptureScreenshot action triggered.');
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, (screenshotUrl) => {
            if (chrome.runtime.lastError || !screenshotUrl) {
                console.error('Error capturing screenshot:', chrome.runtime.lastError?.message || 'Capture failed');
                sendResponse({ status: 'Error', message: chrome.runtime.lastError?.message || 'Capture failed' });
            } else {
                console.log('Screenshot captured successfully:', screenshotUrl);
                sendResponse({ status: 'Success', screenshot: screenshotUrl });
            }
        });
        return true; // Keep the message channel open for async sendResponse
    }
});
