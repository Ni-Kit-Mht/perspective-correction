import { PerspectiveTransform } from './perspectiveTransform.js';

export function applySimplePerspective(orderedPoints, { sourceCtx, pointsCanvas, downloadBtn, statusMessage }) {
    // Calculate bounding box
    let minX = pointsCanvas.width, maxX = 0, minY = pointsCanvas.height, maxY = 0;
    for (const point of orderedPoints) {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
    }

    const destWidth = Math.max(10, Math.round(maxX - minX));
    const destHeight = Math.max(10, Math.round(maxY - minY));

    // Source points in order: TL, TR, BR, BL
    const srcPointsFlat = [
        orderedPoints[0].x, orderedPoints[0].y,
        orderedPoints[1].x, orderedPoints[1].y,
        orderedPoints[2].x, orderedPoints[2].y,
        orderedPoints[3].x, orderedPoints[3].y
    ];

    // Destination rectangle corners
    const destPointsFlat = [
        0, 0,
        destWidth, 0,
        destWidth, destHeight,
        0, destHeight
    ];

    // Fixed: Transform from destination to source (inverse mapping)
    const transform = new PerspectiveTransform(destPointsFlat, srcPointsFlat);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = destWidth;
    tempCanvas.height = destHeight;
    const tempCtx = tempCanvas.getContext('2d');

    const imageData = sourceCtx.getImageData(0, 0, pointsCanvas.width, pointsCanvas.height);
    const destImageData = tempCtx.createImageData(destWidth, destHeight);

    // Bilinear interpolation for better quality
    for (let y = 0; y < destHeight; y++) {
        for (let x = 0; x < destWidth; x++) {
            const srcCoords = transform.transform(x, y);
            const srcX = srcCoords[0];
            const srcY = srcCoords[1];

            const destIndex = (y * destWidth + x) * 4;

            if (srcX >= 0 && srcX < pointsCanvas.width - 1 && srcY >= 0 && srcY < pointsCanvas.height - 1) {
                // Bilinear interpolation
                const x1 = Math.floor(srcX);
                const y1 = Math.floor(srcY);
                const x2 = x1 + 1;
                const y2 = y1 + 1;
                
                const fx = srcX - x1;
                const fy = srcY - y1;
                
                const idx11 = (y1 * pointsCanvas.width + x1) * 4;
                const idx21 = (y1 * pointsCanvas.width + x2) * 4;
                const idx12 = (y2 * pointsCanvas.width + x1) * 4;
                const idx22 = (y2 * pointsCanvas.width + x2) * 4;
                
                for (let c = 0; c < 3; c++) {
                    const v11 = imageData.data[idx11 + c];
                    const v21 = imageData.data[idx21 + c];
                    const v12 = imageData.data[idx12 + c];
                    const v22 = imageData.data[idx22 + c];
                    
                    const interpX1 = v11 * (1 - fx) + v21 * fx;
                    const interpX2 = v12 * (1 - fx) + v22 * fx;
                    const value = interpX1 * (1 - fy) + interpX2 * fy;
                    
                    destImageData.data[destIndex + c] = Math.round(value);
                }
                destImageData.data[destIndex + 3] = 255;
            } else {
                destImageData.data[destIndex] = 255;
                destImageData.data[destIndex + 1] = 255;
                destImageData.data[destIndex + 2] = 255;
                destImageData.data[destIndex + 3] = 255;
            }
        }
    }

    tempCtx.putImageData(destImageData, 0, 0);

    const transformedImageData = {
        canvas: tempCanvas,
        width: destWidth,
        height: destHeight,
        offsetX: minX,
        offsetY: minY,
        orderedPoints: orderedPoints
    };

    sourceCtx.clearRect(0, 0, pointsCanvas.width, pointsCanvas.height);
    sourceCtx.drawImage(tempCanvas, minX, minY, destWidth, destHeight);

    sourceCtx.strokeStyle = '#40c057';
    sourceCtx.lineWidth = 3;
    sourceCtx.strokeRect(minX, minY, destWidth, destHeight);

    pointsCanvas.style.pointerEvents = 'none';
    downloadBtn.disabled = false;

    statusMessage.textContent = `Perspective correction applied! Corrected area: ${destWidth}×${destHeight} pixels.`;
    statusMessage.className = 'status success';

    return transformedImageData;
}