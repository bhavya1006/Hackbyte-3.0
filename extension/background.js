chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "startQuery") {
    console.log("Background received query:", message.query);

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs || tabs.length === 0) {
        console.error("No active tab found.");
        sendResponse({ status: "Error", message: "No active tab found" });
        return;
      }

      const tab = tabs[0];

      // ✅ Capture screenshot BEFORE injecting the script
      chrome.tabs.captureVisibleTab(
        null,
        { format: "png" },
        (screenshotUrl) => {
          if (chrome.runtime.lastError || !screenshotUrl) {
            console.error(
              "Screenshot error:",
              chrome.runtime.lastError?.message || "Unknown error"
            );
            sendResponse({ status: "Error", message: "Screenshot failed" });
            return;
          }

          // ✅ Inject script with query + screenshot
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (query, screenshot) => {
              async function callApi(query, screenshot) {
                try {
                  let isFinished = false;
                  console.log(`Starting API call with query: ${query}`);
                  console.log("Screenshot inside content script:", screenshot);

                  while (!isFinished) {
                    const response = await fetch(
                      "http://localhost:3000/api/hello",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ query, screenshot }),
                      }
                    );

                    if (!response.ok)
                      throw new Error(
                        `API call failed with status ${response.status}`
                      );
                    const data = await response.json();
                    console.log(`API Response:`, data);

                    const targetId = data.id || "default-target";
                    const target = document.getElementById(targetId);
                    if (!target) {
                      alert(`Element with ID "${targetId}" not found.`);
                      return;
                    }

                    const popup = document.createElement("div");
                    popup.className = "custom-popup";
                    popup.textContent = data.message;
                    Object.assign(popup.style, {
                      position: "absolute",
                      backgroundColor: "rgba(255, 87, 34, 0.9)",
                      border: "2px solid #FF5722",
                      color: "#fff",
                      padding: "15px 30px",
                      borderRadius: "12px",
                      boxShadow: "0 8px 12px rgba(0, 0, 0, 0.4)",
                      fontSize: "18px",
                      fontWeight: "bold",
                      textAlign: "center",
                      zIndex: "10000",
                    });

                    const rect = target.getBoundingClientRect();
                    popup.style.left = `${rect.left + window.scrollX}px`;
                    popup.style.top = `${rect.bottom + window.scrollY + 15}px`;

                    const arrow = document.createElement("div");
                    Object.assign(arrow.style, {
                      position: "absolute",
                      width: "0",
                      height: "0",
                      borderLeft: "10px solid transparent",
                      borderRight: "10px solid transparent",
                      borderBottom: "10px solid rgba(255, 87, 34, 0.9)",
                      top: "-10px",
                      left: "calc(50% - 15px)",
                    });

                    popup.appendChild(arrow);
                    document.body.appendChild(popup);
                    target.addEventListener(data.action || "click", () => {
                      popup.remove();
                    });

                    // Wait for popup removal
                    await new Promise((resolve) => {
                      const interval = setInterval(() => {
                        const popup = document.querySelector(".custom-popup");
                        if (!popup) {
                          clearInterval(interval);
                          resolve();
                        }
                      }, 100);
                    });

                    isFinished = data.isFinished;

                    if (!isFinished) {
                      console.log("Waiting 1s before next call...");
                      await new Promise((r) => setTimeout(r, 1000));
                    }
                  }

                  console.log("All API steps complete!");
                } catch (error) {
                  console.error("Error:", error.message);
                  alert("Error occurred: " + error.message);
                }
              }

              callApi(query, screenshot);
            },
            args: [message.query, screenshotUrl],
          });

          sendResponse({ status: "Query started with screenshot" });
        }
      );

      return true; // Keep channel open for sendResponse
    });

    return true;
  }
});
