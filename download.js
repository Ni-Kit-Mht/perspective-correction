export function downloadCorrectedImage({
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
        
        // Create a new canvas to ensure we're exporting exactly what was corrected
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = sourceCanvas.width;
        exportCanvas.height = sourceCanvas.height;
        
        const exportCtx = exportCanvas.getContext("2d", { 
            alpha: false,
            willReadFrequently: false 
        });
        
        // Fill with white background (in case of any transparency)
        exportCtx.fillStyle = "#FFFFFF";
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        
        // Draw the corrected image
        exportCtx.drawImage(sourceCanvas, 0, 0);

        // Generate high-quality PNG
        const dataURL = exportCanvas.toDataURL("image/png", 1.0);
        
        // Create and trigger download
        const link = document.createElement("a");
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `corrected-document-${timestamp}.png`;
        link.href = dataURL;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        statusMessage.textContent = `Image downloaded successfully! (${exportCanvas.width}×${exportCanvas.height}px)`;
        statusMessage.className = "status success";
        
        // Clean up
        exportCanvas.remove();

    } catch (error) {
        console.error("Download error:", error);
        statusMessage.textContent = `Download failed: ${error.message}`;
        statusMessage.className = "status error";
    }
}