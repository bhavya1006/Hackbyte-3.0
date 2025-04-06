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

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (query) => {
          const extractTags = () => {
            const elements = Array.from(
              document.body.querySelectorAll("button, a")
            );
            return elements.map((el) => {
              const styles = window.getComputedStyle(el);
              const tag = el.tagName.toLowerCase();
              return {
                innerText: el.innerText || null,
                id: el.id || null,
                class: el.className || null,
                tag,
                styles: {
                  color: styles.color,
                  backgroundColor: styles.backgroundColor,
                  fontSize: styles.fontSize,
                  fontWeight: styles.fontWeight,
                  display: styles.display,
                },
                clickable: !!(el.onclick || (tag === "a" && el.href)),
                action:
                  tag === "a"
                    ? el.href || null
                    : el.onclick
                    ? el.onclick.toString()
                    : null,
              };
            });
          };

          async function callApi(query) {
            try {
              let isFinished = false;
              console.log(`Starting API call with query: ${query}`);

              while (!isFinished) {
                // Take a new screenshot before each API call
                const screenshotUrl = await new Promise((resolve) => {
                  chrome.runtime.sendMessage(
                    { action: "takeScreenshot" },
                    (response) => {
                      resolve(response.screenshot);
                    }
                  );
                });

                const bodyHtml = document.body.outerHTML;
                const elements = extractTags();

                // console.log("New screenshot captured for this iteration", screenshotUrl);

                const response = await fetch(
                  "http://localhost:8000/analyze_ui",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      task_description: query,
                      image_base64: screenshotUrl,
                      ui_elements: elements,
                    }),
                  }
                );
                console.log("Response:", JSON.stringify(response));
                if (!response.ok)
                  throw new Error(
                    `API call failed with status ${response.status}`
                  );
                const data = await response.json();
                // console.log(`API Response:`, data);

                const findElementByAttributes = (data) => {
                  const elements = Array.from(document.querySelectorAll("*"));

                  return (
                    elements.find((el) => {
                      if (data.id && el.id === data.id) return true;

                      // Match by text content and tag name
                      if (
                        el.innerHTML === data.text &&
                        el.tagName.toLowerCase() === data.tagName.toLowerCase()
                      ) {
                        console.log("Matched element:", el);
                        return true;
                      }

                      return false;
                    }) || null
                  );
                };

                // Usage:
                const mostMatchedElement = findElementByAttributes(data); // Removed await since function is not async

                console.log("Matching elements:", mostMatchedElement);
                // if (matchingElements.length === 0) {
                //   alert(`No elements found with the provided attributes`);
                //   return;
                // }

                // Use the first matching element as our target
                const target = mostMatchedElement;

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
                  await new Promise((r) => setTimeout(r, 5000));
                }
              }

              console.log("All API steps complete!");
            } catch (error) {
              console.error("Error:", error.message);
              alert("Error occurred: " + error.message);
            }
          }

          callApi(query);
        },
        args: [message.query],
      });

      // Add screenshot message handler
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "takeScreenshot") {
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
              sendResponse({ screenshot: screenshotUrl });
            }
          );
          return true; // Keep the message channel open for the async response
        }
      });

      sendResponse({
        status:
          "Query started with dynamic screenshots, body HTML, and extracted elements",
      });
    });

    return true;
  }
});
