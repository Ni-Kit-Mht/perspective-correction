// printCorrectedDocument.js
export function printCorrectedDocument({
    transformedImageData,
    statusMessage,
    sourceCanvas: externalSourceCanvas = null,
    getCurrentCanvasState = null
}) {
    // Get the best available canvas with all adjustments applied
    const canvasToPrint = getOptimalCanvas(transformedImageData, externalSourceCanvas, getCurrentCanvasState);
    
    if (!canvasToPrint) {
        showPrintError(statusMessage, "No corrected image available. Please apply perspective correction and image adjustments first.");
        return;
    }

    try {
        // CRITICAL FIX: Always capture the current visual state directly from the source canvas
        const printCanvas = captureCurrentCanvasState(canvasToPrint);
        const printWindow = openPrintWindow(printCanvas);
        
        updateStatusMessage(statusMessage, `✓ Print ready - All corrections included (brightness, color, perspective) - ${printCanvas.width}×${printCanvas.height}px`, "success");
        cleanupPrintCanvas(printCanvas);
    } catch (error) {
        console.error("Print error:", error);
        showPrintError(statusMessage, `Print failed: ${error.message}`);
    }
}

// Get the optimal canvas source prioritizing most recent adjustments
function getOptimalCanvas(transformedImageData, externalSourceCanvas, getCurrentCanvasState) {
    // Priority 1: Dynamic state from correction functions
    if (getCurrentCanvasState && typeof getCurrentCanvasState === 'function') {
        const currentCanvas = getCurrentCanvasState();
        if (isValidCanvas(currentCanvas)) return currentCanvas;
    }
    
    // Priority 2: External source canvas (with brightness/corrections)
    if (isValidCanvas(externalSourceCanvas)) return externalSourceCanvas;
    
    // Priority 3: Perspective corrected canvas
    if (transformedImageData?.canvas && isValidCanvas(transformedImageData.canvas)) {
        return transformedImageData.canvas;
    }
    
    return null;
}

// Check if canvas is valid and has content
function isValidCanvas(canvas) {
    return canvas && canvas instanceof HTMLCanvasElement && canvas.width > 0 && canvas.height > 0;
}

// CRITICAL FIX: Capture the EXACT current visual state of the canvas
// This ensures brightness, color corrections, and all adjustments are captured
function captureCurrentCanvasState(sourceCanvas) {
    // Create a new canvas to capture the current state
    const captureCanvas = document.createElement("canvas");
    captureCanvas.width = sourceCanvas.width;
    captureCanvas.height = sourceCanvas.height;
    
    const ctx = captureCanvas.getContext("2d", { alpha: false });
    
    // White background for better print quality
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
    
    // CRITICAL: Draw the current canvas state DIRECTLY from the source canvas
    // This captures ALL visual modifications including brightness adjustments
    ctx.drawImage(sourceCanvas, 0, 0);
    
    // Optional: Verify we're not drawing an empty canvas
    const imageData = ctx.getImageData(0, 0, captureCanvas.width, captureCanvas.height);
    const hasContent = imageData.data.some((value, index) => index % 4 !== 3 && value !== 255);
    
    if (!hasContent) {
        console.warn("Warning: Canvas appears to be empty or all white");
    }
    
    return captureCanvas;
}

// Legacy function kept for compatibility (but now uses captureCurrentCanvasState internally)
function createPrintCanvas(sourceCanvas) {
    return captureCurrentCanvasState(sourceCanvas);
}

// Open print window with the corrected image
function openPrintWindow(printCanvas) {
    // Use highest quality PNG encoding
    const dataURL = printCanvas.toDataURL("image/png", 1.0);
    const { width, height } = printCanvas;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatePrintHTML(dataURL, width, height));
    printWindow.document.close();
    
    return printWindow;
}

// Generate HTML for print window
function generatePrintHTML(imageDataURL, width, height) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Corrected Document - Print</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body {
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    background: #f5f5f5;
                }
                
                .print-container {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 100%;
                }
                
                h1 {
                    margin-bottom: 10px;
                    color: #333;
                    font-size: 20px;
                    font-weight: 500;
                    text-align: center;
                }
                
                .info {
                    text-align: center;
                    margin-bottom: 15px;
                }
                
                .resolution {
                    color: #666;
                    font-size: 13px;
                    margin-bottom: 10px;
                }
                
                .badge {
                    display: inline-block;
                    background: #e8f0fe;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 12px;
                    color: #1a73e8;
                }
                
                .correction-list {
                    margin-top: 10px;
                    font-size: 11px;
                    color: #5f6368;
                }
                
                img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 0 auto;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    border-radius: 4px;
                }
                
                .footer {
                    margin-top: 20px;
                    font-size: 11px;
                    color: #999;
                    text-align: center;
                }
                
                @media print {
                    body {
                        padding: 0;
                        background: white;
                    }
                    
                    .print-container {
                        padding: 0;
                        box-shadow: none;
                    }
                    
                    h1, .info, .footer {
                        display: none;
                    }
                    
                    img {
                        box-shadow: none;
                        page-break-inside: avoid;
                        max-width: 100%;
                        height: auto;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-container">
                <h1>📄 Corrected Document</h1>
                <div class="info">
                    <div class="resolution">Resolution: ${width}×${height} pixels</div>
                    <div class="badge">✓ All Corrections Applied</div>
                    <div class="correction-list">
                        • Perspective Correction • Brightness/Shadow Boost<br>
                        • Color Balance • Sharpness/Clarity • Exposure<br>
                        • Dehaze/Vibrance • White Enhancement
                    </div>
                </div>
                <img src="${imageDataURL}" alt="Corrected Document with All Adjustments" />
                <div class="footer">Generated by Document Correction Tool | All adjustments applied</div>
            </div>
            <script>
                // Single print trigger - only when image is fully loaded
                (function() {
                    let printed = false; // Prevent double printing
                    
                    function triggerPrint() {
                        if (!printed) {
                            printed = true;
                            // Small delay to ensure rendering is complete
                            setTimeout(function() {
                                window.print();
                                // Auto-close after print dialog is dismissed
                                window.onafterprint = function() {
                                    setTimeout(function() {
                                        window.close();
                                    }, 500);
                                };
                            }, 300);
                        }
                    }
                    
                    const img = document.querySelector('img');
                    if (img.complete) {
                        triggerPrint();
                    } else {
                        img.addEventListener('load', triggerPrint);
                    }
                })();
            </script>
        </body>
        </html>
    `;
}

// Update status message in UI
function updateStatusMessage(statusElement, message, type = "success") {
    if (!statusElement) return;
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
}

// Show error message
function showPrintError(statusElement, message) {
    updateStatusMessage(statusElement, message, "error");
}

// Clean up temporary canvas
function cleanupPrintCanvas(printCanvas) {
    if (printCanvas && printCanvas.remove) {
        setTimeout(() => {
            if (printCanvas.parentNode) {
                printCanvas.remove();
            }
        }, 1000);
    }
}