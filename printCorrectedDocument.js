// printcorrecteddocument.js
export function printCorrectedDocument({
    transformedImageData,
    statusMessage
}) {
    if (!transformedImageData || !transformedImageData.canvas) {
        statusMessage.textContent = "No corrected image available. Please apply perspective correction first.";
        statusMessage.className = "status error";
        return;
    }

    try {
        const sourceCanvas = transformedImageData.canvas;
        
        // Create a new canvas to ensure we're printing exactly what was corrected
        const printCanvas = document.createElement("canvas");
        printCanvas.width = sourceCanvas.width;
        printCanvas.height = sourceCanvas.height;
        
        const printCtx = printCanvas.getContext("2d", { 
            alpha: false,
            willReadFrequently: false 
        });
        
        // Fill with white background (in case of any transparency)
        printCtx.fillStyle = "#FFFFFF";
        printCtx.fillRect(0, 0, printCanvas.width, printCanvas.height);
        
        // Draw the corrected image
        printCtx.drawImage(sourceCanvas, 0, 0);

        // Generate high-quality PNG data URL
        const dataURL = printCanvas.toDataURL("image/png", 1.0);
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Corrected Document - Print</title>
                <style>
                    body { 
                        margin: 0; 
                        padding: 20px; 
                        display: flex; 
                        flex-direction: column; 
                        align-items: center;
                        font-family: Arial, sans-serif;
                    }
                    h1 { 
                        margin-bottom: 10px; 
                        color: #333;
                        font-size: 18px;
                    }
                    .image-info {
                        margin-bottom: 20px;
                        color: #666;
                        font-size: 14px;
                    }
                    img { 
                        max-width: 100%; 
                        height: auto;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    @media print {
                        body { padding: 0; }
                        h1, .image-info { display: none; }
                        img { box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Corrected Document</h1>
                <div class="image-info">Resolution: ${printCanvas.width}×${printCanvas.height}px</div>
                <img src="${dataURL}" alt="Corrected Document" />
                <script>
                    // Auto-trigger print dialog when window loads
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            // Close window after printing or if user cancels
                            setTimeout(function() {
                                window.close();
                            }, 100);
                        }, 250);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();

        statusMessage.textContent = `Print dialog opened for corrected image (${printCanvas.width}×${printCanvas.height}px)`;
        statusMessage.className = "status success";
        
        // Clean up
        printCanvas.remove();

    } catch (error) {
        console.error("Print error:", error);
        statusMessage.textContent = `Print failed: ${error.message}`;
        statusMessage.className = "status error";
    }
}