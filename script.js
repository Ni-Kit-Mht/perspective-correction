import { orderPoints, getCanvasCoordinates as getCoords } from './helpers.js';
import { PerspectiveTransform } from './perspectiveTransform.js';
import { mapPointUsingMVC } from './mvc.js';
import { downloadCorrectedImage } from './download.js';
import { applySimplePerspective as applySimple} from './simplePerspectiveApply.js';
import { applyComplexPerspective as applyComplex} from './complexPerspectiveApply.js';
import { printCorrectedDocument } from './printCorrectedDocument.js';

// DOM Elements
const imageInput = document.getElementById('imageInput');
const fileUpload = document.getElementById('fileUpload');
const sourceCanvas = document.getElementById('sourceCanvas');
const pointsCanvas = document.getElementById('pointsCanvas');
const pointCount = document.getElementById('pointCount');
const addPointsBtn = document.getElementById('addPointsBtn');
const movePointsBtn = document.getElementById('movePointsBtn');
const deletePointsBtn = document.getElementById('deletePointsBtn');
const transformBtn = document.getElementById('transformBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const statusMessage = document.getElementById('statusMessage');
const printBtn = document.getElementById('printBtn');

// Canvas contexts
const sourceCtx = sourceCanvas.getContext('2d');
const pointsCtx = pointsCanvas.getContext('2d');

// Add this function to your existing code (replace the existing resizeCanvases function)
function resizeCanvases() {
    const wrapper = document.querySelector('.canvas-wrapper');
    if (!wrapper || !image) return;
    
    // Get wrapper dimensions
    const rect = wrapper.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    
    // Get original image dimensions
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    
    // Calculate new display size
    const imageAspectRatio = imageWidth / imageHeight;
    let displayWidth, displayHeight;
    
    if (containerWidth / containerHeight > imageAspectRatio) {
        displayHeight = containerHeight;
        displayWidth = displayHeight * imageAspectRatio;
    } else {
        displayWidth = containerWidth;
        displayHeight = displayWidth / imageAspectRatio;
    }
    
    // Update display scale
    displayScale = imageWidth / displayWidth;
    window.currentDisplayScale = displayScale;
    
    // Update canvas CSS sizes
    [sourceCanvas, pointsCanvas].forEach(canvas => {
        if (canvas) {
            canvas.style.width = displayWidth + 'px';
            canvas.style.height = displayHeight + 'px';
        }
    });
    
    // Center canvases
    const offsetX = (containerWidth - displayWidth) / 2;
    const offsetY = (containerHeight - displayHeight) / 2;
    
    [sourceCanvas, pointsCanvas].forEach(canvas => {
        if (canvas) {
            canvas.style.left = offsetX + 'px';
            canvas.style.top = offsetY + 'px';
        }
    });
    
    // Redraw content
    if (sourceCtx && originalImageData) {
        sourceCtx.putImageData(originalImageData, 0, 0);
    } else if (sourceCtx && image) {
        sourceCtx.drawImage(image, 0, 0, imageWidth, imageHeight);
    }
    
    drawPoints();
    //drawGrid();
    if (typeof window.drawGrid === 'function') {
        window.drawGrid(sourceCanvas, displayScale);
    }
}

// Add resize listener (minimum code)
window.addEventListener('resize', () => {
    if (image) resizeCanvases();
});

// Also use ResizeObserver for container changes
const resizeObserver = new ResizeObserver(() => {
    if (image) resizeCanvases();
});

// Start observing when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.canvas-wrapper');
    if (wrapper) resizeObserver.observe(wrapper);
});


// State variables
let image = null;
let points = [];
let selectedPointIndex = -1;
let mode = 'add';
let isDragging = false;
let transformedImageData = null;
let originalImageData = null;
let displayScale = 1; // Scale factor between display and actual image

const canvasWrapper = document.querySelector('.canvas-wrapper');

// Enable print button when image is loaded
function enablePrintButton() {
    if (printBtn) {
        printBtn.disabled = false;
        printBtn.style.opacity = '1';
        printBtn.style.cursor = 'pointer';
    }
}

// Disable print button initially
if (printBtn) {
    printBtn.disabled = true;
    printBtn.style.opacity = '0.5';
    printBtn.style.cursor = 'not-allowed';
}

if (canvasWrapper) {
    canvasWrapper.addEventListener('mousemove', (e) => {
        const rect = canvasWrapper.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        canvasWrapper.style.setProperty('--cursor-x', x + 'px');
        canvasWrapper.style.setProperty('--cursor-y', y + 'px');
    });
}

// Add this function to capture image data after image is loaded
function captureOriginalImageData() {
    if (!image) return null;
    
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    
    // Create a temporary canvas to store the original image data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageWidth;
    tempCanvas.height = imageHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(image, 0, 0, imageWidth, imageHeight);
    
    const imageData = tempCtx.getImageData(0, 0, imageWidth, imageHeight);
    
    return {
        canvas: tempCanvas,
        imageData: imageData,
        width: imageWidth,
        height: imageHeight,
        original: true  // Flag to indicate this is the original image
    };
}

function setupPasteHandler() {
    document.addEventListener('paste', function(event) {
        const items = event.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        image = img;
                        setupCanvas();
                        
                        // Capture pasted image data immediately
                        const capturedData = captureOriginalImageData();
                        originalImageData = capturedData ? capturedData.imageData : null;
                        
                        resetAllPoints();
                        if (statusMessage) {
                            statusMessage.textContent = `Image pasted (${img.naturalWidth}×${img.naturalHeight}px). Select 4+ points.`;
                            statusMessage.className = "status success";
                        }
                        
                        if (capturedData) {
                            window.currentImageData = capturedData;
                        }
                        
                        // ENABLE PRINT BUTTON IMMEDIATELY AFTER PASTE
                        enablePrintButton();
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(blob);
                break;
            }
        }
    });
}

// Initialize
function init() {
    // Get reference to the source canvas that has all the brightness adjustments
    const sourceCanvasElement = document.getElementById('sourceCanvas');
    
    if (printBtn) {
        printBtn.addEventListener('click', () => printCorrectedDocument({ 
            transformedImageData, 
            statusMessage,
            sourceCanvas: sourceCanvasElement  // Pass the canvas with brightness adjustments
        }));
    }
    
    if (fileUpload) {
        fileUpload.addEventListener('click', () => {
            if (imageInput) imageInput.click();
        });
    }
    
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
    
    if (addPointsBtn) {
        addPointsBtn.addEventListener('click', () => setMode('add'));
    }
    
    if (movePointsBtn) {
        movePointsBtn.addEventListener('click', () => setMode('move'));
    }
    
    if (deletePointsBtn) {
        deletePointsBtn.addEventListener('click', () => setMode('delete'));
    }
    
    if (transformBtn) {
        transformBtn.addEventListener('click', applyPerspectiveCorrection);
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => downloadCorrectedImage({ transformedImageData, statusMessage }));
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAllPoints);
    }
    
    if (pointsCanvas) {
        pointsCanvas.addEventListener('mousedown', handleCanvasMouseDown);
        pointsCanvas.addEventListener('mousemove', handleCanvasMouseMove);
        pointsCanvas.addEventListener('mouseup', handleCanvasMouseUp);
        pointsCanvas.addEventListener('mouseleave', handleCanvasMouseUp);
    }
    
    setMode('add');
    setupPasteHandler();

    // Initialize grid
    if (typeof window.drawGrid === 'function') {
        window.drawGrid();
    }
    
    loadSampleImage();
}

// Load a sample image for demonstration
function loadSampleImage() {
    const svg = `
        <svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
            <defs>
                <linearGradient id='g' x1='0' x2='1'>
                    <stop offset='0' stop-color='#74c0fc'/>
                    <stop offset='1' stop-color='#4dabf7'/>
                </linearGradient>
            </defs>
            <rect width='100%' height='100%' fill='url(#g)' />
            <g fill='white' font-family='Arial' font-weight='700' font-size='40' text-anchor='middle'>
                <text x='50%' y='45%'>Perspective</text>
                <text x='50%' y='55%'>Correction</text>
            </g>
            <rect x='80' y='80' width='640' height='440' fill='none' stroke='rgba(255,255,255,0.25)' stroke-width='8' rx='12'/>
        </svg>
    `;

    const sampleImage = new Image();
    sampleImage.onload = function() {
        image = sampleImage;
        setupCanvas();
        if (statusMessage) {
            statusMessage.textContent = "Sample image loaded. Select 4+ points to define perspective correction area.";
            statusMessage.className = "status success";
        }
        enablePrintButton(); // Enable print button for sample image too
    };
    sampleImage.onerror = function() {
        if (statusMessage) {
            statusMessage.textContent = "Failed to load sample image. Please upload your own image.";
            statusMessage.className = "status error";
        }
    };

    sampleImage.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            image = img;
            setupCanvas();
            resetAllPoints();
            if (statusMessage) {
                statusMessage.textContent = `Image loaded (${img.naturalWidth}×${img.naturalHeight}px). Original resolution preserved. Select 4+ points.`;
                statusMessage.className = "status success";
            }
            enablePrintButton(); // Enable print button for uploaded image
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    //drawGrid();
}

// Set up canvas dimensions - PRESERVE ORIGINAL RESOLUTION
function setupCanvas() {
    if (!image) return;
    
    const container = document.querySelector('.canvas-wrapper');
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Get original image dimensions
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    
    // Calculate display scale to fit container while preserving aspect ratio
    const imageAspectRatio = imageWidth / imageHeight;
    let displayWidth, displayHeight;
    
    if (containerWidth / containerHeight > imageAspectRatio) {
        displayHeight = containerHeight;
        displayWidth = displayHeight * imageAspectRatio;
    } else {
        displayWidth = containerWidth;
        displayHeight = displayWidth / imageAspectRatio;
    }
    
    // Set canvas to ORIGINAL image resolution (not display size)
    if (sourceCanvas) {
        sourceCanvas.width = imageWidth;
        sourceCanvas.height = imageHeight;
    }
    
    if (pointsCanvas) {
        pointsCanvas.width = imageWidth;
        pointsCanvas.height = imageHeight;
    }
    
    // Calculate scale factor between display and actual canvas
    displayScale = imageWidth / displayWidth;
    
    // Store displayScale globally for grid function
    window.currentDisplayScale = displayScale;
    
    // Set CSS display size (visual size in browser)
    if (sourceCanvas) {
        sourceCanvas.style.width = displayWidth + 'px';
        sourceCanvas.style.height = displayHeight + 'px';
    }
    
    if (pointsCanvas) {
        pointsCanvas.style.width = displayWidth + 'px';
        pointsCanvas.style.height = displayHeight + 'px';
    }
    
    // Center canvases in container
    const offsetX = (containerWidth - displayWidth) / 2;
    const offsetY = (containerHeight - displayHeight) / 2;
    
    if (sourceCanvas) {
        sourceCanvas.style.left = offsetX + 'px';
        sourceCanvas.style.top = offsetY + 'px';
    }
    
    if (pointsCanvas) {
        pointsCanvas.style.left = offsetX + 'px';
        pointsCanvas.style.top = offsetY + 'px';
    }
    
    // Draw image at FULL RESOLUTION
    if (sourceCtx && sourceCanvas) {
        sourceCtx.drawImage(image, 0, 0, imageWidth, imageHeight);
        const capturedData = captureOriginalImageData();
        originalImageData = capturedData ? capturedData.imageData : null;
    }
    
    points = [];
    selectedPointIndex = -1;
    updatePointCount();
    drawPoints();
    
    // Draw grid if enabled
    if (typeof window.drawGrid === 'function') {
        window.drawGrid(sourceCanvas, displayScale);
    }
    
    console.log(`Canvas Resolution: ${imageWidth}×${imageHeight}, Display: ${displayWidth.toFixed(0)}×${displayHeight.toFixed(0)}, Scale: ${displayScale.toFixed(2)}x`);
}

// Set the current interaction mode
function setMode(newMode) {
    mode = newMode;
    
    if (addPointsBtn) addPointsBtn.classList.remove('active');
    if (movePointsBtn) movePointsBtn.classList.remove('active');
    if (deletePointsBtn) deletePointsBtn.classList.remove('active');
    
    if (mode === 'add') {
        if (addPointsBtn) addPointsBtn.classList.add('active');
        if (statusMessage) {
            statusMessage.textContent = "Add Points mode: Click on the image to add perspective correction points.";
        }
    } else if (mode === 'move') {
        if (movePointsBtn) movePointsBtn.classList.add('active');
        if (statusMessage) {
            statusMessage.textContent = "Move Points mode: Click and drag points to adjust their position.";
        }
    } else if (mode === 'delete') {
        if (deletePointsBtn) deletePointsBtn.classList.add('active');
        if (statusMessage) {
            statusMessage.textContent = "Delete Points mode: Click on points to remove them.";
        }
    }
    
    if (statusMessage) statusMessage.className = "status";
}

// Get canvas coordinates from mouse event - ACCOUNTING FOR SCALE
function getCanvasCoordinates(event) {
    if (!pointsCanvas) return { x: 0, y: 0 };
    
    const rect = pointsCanvas.getBoundingClientRect();
    
    // Get mouse position relative to canvas display
    const displayX = event.clientX - rect.left;
    const displayY = event.clientY - rect.top;
    
    // Scale to actual canvas coordinates
    const canvasX = displayX * displayScale;
    const canvasY = displayY * displayScale;
    
    return { x: canvasX, y: canvasY };
}

// Handle mouse down on canvas
function handleCanvasMouseDown(event) {
    if (!image) return;
    
    const coords = getCanvasCoordinates(event);
    const x = coords.x;
    const y = coords.y;
    
    // Hit detection radius scaled to display
    const hitRadius = 15 * displayScale;
    
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
        
        if (distance < hitRadius) {
            if (mode === 'delete') {
                points.splice(i, 1);
                selectedPointIndex = -1;
                updatePointCount();
                drawPoints();
                return;
            } else if (mode === 'move') {
                selectedPointIndex = i;
                isDragging = true;
                drawPoints();
                return;
            }
        }
    }
    
    if (mode === 'add') {
        points.push({ x, y });
        selectedPointIndex = points.length - 1;
        updatePointCount();
        drawPoints();
    }
}

// Handle mouse move on canvas
function handleCanvasMouseMove(event) {
    if (!image || mode !== 'move' || !isDragging || selectedPointIndex < 0) return;
    if (!sourceCanvas) return;
    
    const coords = getCanvasCoordinates(event);
    const x = Math.max(0, Math.min(sourceCanvas.width, coords.x));
    const y = Math.max(0, Math.min(sourceCanvas.height, coords.y));
    
    points[selectedPointIndex].x = x;
    points[selectedPointIndex].y = y;
    
    drawPoints();
}

// Handle mouse up on canvas
function handleCanvasMouseUp() {
    isDragging = false;
}

// Update point counter display
function updatePointCount() {
    if (pointCount) {
        pointCount.textContent = points.length;
    }
    if (transformBtn) {
        transformBtn.disabled = points.length < 4;
    }
}

// Draw points on the canvas - SCALED FOR DISPLAY
function drawPoints() {
    if (!pointsCtx || !pointsCanvas) return;
    
    pointsCtx.clearRect(0, 0, pointsCanvas.width, pointsCanvas.height);
    
    // Scale line width and point size for display
    const lineWidth = 2 * displayScale;
    const pointRadius = 8 * displayScale;
    const fontSize = 14 * displayScale;
    
    if (points.length > 1) {
        pointsCtx.beginPath();
        pointsCtx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            pointsCtx.lineTo(points[i].x, points[i].y);
        }
        pointsCtx.strokeStyle = '#4dabf7';
        pointsCtx.lineWidth = lineWidth;
        pointsCtx.stroke();
    }
    
    if (points.length >= 3) {
        pointsCtx.beginPath();
        pointsCtx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
        pointsCtx.lineTo(points[0].x, points[0].y);
        pointsCtx.strokeStyle = '#4dabf7';
        pointsCtx.lineWidth = lineWidth;
        pointsCtx.setLineDash([5 * displayScale, 5 * displayScale]);
        pointsCtx.stroke();
        pointsCtx.setLineDash([]);
    }
    
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        
        pointsCtx.beginPath();
        pointsCtx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
        pointsCtx.fillStyle = (i === selectedPointIndex && isDragging) ? '#ff6b6b' : '#339af0';
        pointsCtx.fill();
        pointsCtx.strokeStyle = '#ffffff';
        pointsCtx.lineWidth = lineWidth;
        pointsCtx.stroke();
        
        pointsCtx.fillStyle = '#ffffff';
        pointsCtx.font = `bold ${fontSize}px Arial`;
        pointsCtx.textAlign = 'center';
        pointsCtx.textBaseline = 'middle';
        pointsCtx.fillText(i + 1, point.x, point.y);
    }
}

// Apply perspective correction
function applyPerspectiveCorrection() {
    if (!image || points.length < 4) {
        if (statusMessage) {
            statusMessage.textContent = "Please select at least 4 points for perspective correction.";
            statusMessage.className = "status error";
        }
        return;
    }
    
    try {
        const orderedPoints = orderPoints(points);
        
        if (orderedPoints.length === 4) {
            applySimplePerspective(orderedPoints);
        } else {
            applyComplexPerspective(orderedPoints);
        }
        
        // Redraw grid after transformation
        if (typeof window.drawGrid === 'function') {
            window.drawGrid(sourceCanvas, displayScale);
        }
    } catch (error) {
        console.error("Perspective correction error:", error);
        if (statusMessage) {
            statusMessage.textContent = `Error: ${error.message || 'Please try adjusting your points.'}`;
            statusMessage.className = "status error";
        }
    }
}

// Simple 4-point perspective correction
function applySimplePerspective(orderedPoints) {
    transformedImageData = applySimple(orderedPoints, { sourceCtx, pointsCanvas, downloadBtn, statusMessage });
}

// Complex multi-point perspective correction
function applyComplexPerspective(orderedPoints) {
    transformedImageData = applyComplex(orderedPoints, { sourceCtx, pointsCanvas, downloadBtn, statusMessage });
}

// Reset all points and restore original image
function resetAllPoints() {
    points = [];
    selectedPointIndex = -1;
    isDragging = false;
    transformedImageData = null;
    
    if (!originalImageData && image) {
        const capturedData = captureOriginalImageData();
        originalImageData = capturedData ? capturedData.imageData : null;
    }
    
    if (originalImageData && sourceCtx) {
        sourceCtx.putImageData(originalImageData, 0, 0);
    } else if (image && sourceCtx && sourceCanvas) {
        const imageWidth = image.naturalWidth || image.width;
        const imageHeight = image.naturalHeight || image.height;
        sourceCtx.drawImage(image, 0, 0, imageWidth, imageHeight);
    }
    
    if (pointsCanvas) {
        pointsCanvas.style.pointerEvents = 'all';
    }

    updatePointCount();
    drawPoints();
    
    // Redraw grid after reset
    if (typeof window.drawGrid === 'function') {
        window.drawGrid(sourceCanvas, displayScale);
    }
    
    if (statusMessage) {
        statusMessage.textContent = "All points reset. Select 4+ points to define perspective correction area.";
        statusMessage.className = "status";
    }
}
// Initialize on page load
window.addEventListener('DOMContentLoaded', init);