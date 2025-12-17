// complexPerspectiveApply.js (DOCUMENT-OPTIMIZED VERSION)

import { mapPointUsingMVC } from './mvc.js';

export function applyComplexPerspective(
    orderedPoints,
    { sourceCtx, pointsCanvas, downloadBtn, statusMessage }
) {
    if (orderedPoints.length < 4) {
        fail('Select at least 4 points');
        return null;
    }

    // ---- 1. Order points clockwise ----
    const pts = sortClockwise(orderedPoints);

    // ---- 2. Smart rectangle estimation based on point count ----
    const rect = estimateDocumentRectangle(pts);
    const { width, height, corners } = rect;

    // ---- 3. Output canvas ----
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const ctx = canvas.getContext('2d', { alpha: false });

    const srcImg = sourceCtx.getImageData(
        0, 0, pointsCanvas.width, pointsCanvas.height
    );
    const dstImg = ctx.createImageData(canvas.width, canvas.height);

    // ---- 4. Enhanced mesh-based warping ----
    const totalPixels = canvas.width * canvas.height;
    let processedPixels = 0;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            // Normalized coordinates
            const u = canvas.width > 1 ? x / (canvas.width - 1) : 0.5;
            const v = canvas.height > 1 ? y / (canvas.height - 1) : 0.5;

            // Map output rectangle point to intermediate quad
            const px =
                (1 - u) * (1 - v) * corners[0].x +
                u * (1 - v) * corners[1].x +
                u * v * corners[2].x +
                (1 - u) * v * corners[3].x;

            const py =
                (1 - u) * (1 - v) * corners[0].y +
                u * (1 - v) * corners[1].y +
                u * v * corners[2].y +
                (1 - u) * v * corners[3].y;

            // Map from quad to original polygon using MVC
            const src = mapPointUsingMVC(px, py, 0, 0, pts);
            const rgba = bilinearSample(srcImg, src.x, src.y);

            const i = (y * canvas.width + x) * 4;
            dstImg.data[i]     = rgba[0];
            dstImg.data[i + 1] = rgba[1];
            dstImg.data[i + 2] = rgba[2];
            dstImg.data[i + 3] = 255;

            processedPixels++;
            if (processedPixels % 5000 === 0) {
                const progress = Math.floor((processedPixels / totalPixels) * 100);
                statusMessage.textContent = `Processing: ${progress}%`;
            }
        }
    }

    ctx.putImageData(dstImg, 0, 0);

    // ---- 5. Mild sharpening for better text clarity ----
    applyAdaptiveSharpening(ctx, canvas.width, canvas.height);

    // ---- 6. Draw result (DO NOT clear, just overlay) ----
    sourceCtx.clearRect(0, 0, pointsCanvas.width, pointsCanvas.height);
    sourceCtx.drawImage(canvas, 0, 0);

    pointsCanvas.style.pointerEvents = 'none';
    downloadBtn.disabled = false;

    statusMessage.textContent =
        `Document correction applied (${canvas.width}×${canvas.height})`;
    statusMessage.className = 'status success';

    return {
        canvas,
        width: canvas.width,
        height: canvas.height,
        offsetX: 0,
        offsetY: 0,
        orderedPoints: pts,
        isConvex: isConvexPolygon(pts),
        method: 'document-warp'
    };

    function fail(msg) {
        statusMessage.textContent = msg;
        statusMessage.className = 'status error';
    }
}

/* ===================== DOCUMENT-OPTIMIZED HELPERS ===================== */

function sortClockwise(points) {
    let cx = 0, cy = 0;
    for (const p of points) { cx += p.x; cy += p.y; }
    cx /= points.length;
    cy /= points.length;

    return [...points]
        .map(p => ({ ...p, a: Math.atan2(p.y - cy, p.x - cx) }))
        .sort((a, b) => a.a - b.a)
        .map(p => ({ x: p.x, y: p.y }));
}

function estimateDocumentRectangle(points) {
    const n = points.length;
    
    if (n === 4) {
        // For 4 points, detect if it's a rectangle-like shape
        return estimateFromQuad(points);
    } else if (n === 6) {
        // For 6 points (bent document), find the best-fit rectangle
        return estimateFromBentDocument(points);
    } else {
        // For 5, 7+ points, use convex hull approach
        return estimateFromComplexShape(points);
    }
}

function estimateFromQuad(points) {
    // Calculate edge lengths
    const edges = [];
    for (let i = 0; i < 4; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % 4];
        const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        edges.push({ len, p1, p2 });
    }

    // Assume opposite edges should be similar in final rectangle
    const width = (edges[0].len + edges[2].len) / 2;
    const height = (edges[1].len + edges[3].len) / 2;

    return {
        width: Math.max(width, 10),
        height: Math.max(height, 10),
        corners: points
    };
}

function estimateFromBentDocument(points) {
    // For bent documents, find the 4 corner points (usually indices 0,1,2,4 or similar)
    // Strategy: Find the 4 points with largest distance from centroid
    let cx = 0, cy = 0;
    for (const p of points) { cx += p.x; cy += p.y; }
    cx /= points.length;
    cy /= points.length;

    const pointsWithDist = points.map((p, i) => ({
        ...p,
        dist: Math.hypot(p.x - cx, p.y - cy),
        index: i
    }));

    // Sort by distance and take top 4
    pointsWithDist.sort((a, b) => b.dist - a.dist);
    const cornerIndices = pointsWithDist.slice(0, 4).map(p => p.index).sort((a, b) => a - b);

    const corners = cornerIndices.map(i => points[i]);
    const orderedCorners = sortClockwise(corners);

    // Calculate dimensions
    const width1 = Math.hypot(orderedCorners[1].x - orderedCorners[0].x, orderedCorners[1].y - orderedCorners[0].y);
    const width2 = Math.hypot(orderedCorners[2].x - orderedCorners[3].x, orderedCorners[2].y - orderedCorners[3].y);
    const height1 = Math.hypot(orderedCorners[3].x - orderedCorners[0].x, orderedCorners[3].y - orderedCorners[0].y);
    const height2 = Math.hypot(orderedCorners[2].x - orderedCorners[1].x, orderedCorners[2].y - orderedCorners[1].y);

    return {
        width: Math.max((width1 + width2) / 2, 10),
        height: Math.max((height1 + height2) / 2, 10),
        corners: orderedCorners
    };
}

function estimateFromComplexShape(points) {
    // For complex shapes, use PCA-based oriented bounding box
    const n = points.length;
    
    // Find centroid
    let cx = 0, cy = 0;
    for (const p of points) { cx += p.x; cy += p.y; }
    cx /= n;
    cy /= n;

    // Calculate covariance matrix
    let xx = 0, xy = 0, yy = 0;
    for (const p of points) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        xx += dx * dx;
        xy += dx * dy;
        yy += dy * dy;
    }
    xx /= n; xy /= n; yy /= n;

    // Find principal axis angle
    const angle = 0.5 * Math.atan2(2 * xy, xx - yy);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Rotate points to aligned coordinate system
    const rotated = points.map(p => ({
        x: (p.x - cx) * cos + (p.y - cy) * sin,
        y: -(p.x - cx) * sin + (p.y - cy) * cos
    }));

    // Find bounding box
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const p of rotated) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
    }

    const width = maxX - minX;
    const height = maxY - minY;

    // Transform corners back to original space
    const corners = [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY }
    ].map(p => ({
        x: p.x * cos - p.y * sin + cx,
        y: p.x * sin + p.y * cos + cy
    }));

    return { width, height, corners };
}

function bilinearSample(img, x, y) {
    const w = img.width;
    const h = img.height;

    // Clamp to valid range
    if (x < 0 || x >= w || y < 0 || y >= h) {
        return [255, 255, 255, 255]; // White background for out of bounds
    }

    x = Math.max(0, Math.min(w - 1.001, x));
    y = Math.max(0, Math.min(h - 1.001, y));

    const x1 = Math.floor(x);
    const y1 = Math.floor(y);
    const x2 = Math.min(x1 + 1, w - 1);
    const y2 = Math.min(y1 + 1, h - 1);

    const dx = x - x1;
    const dy = y - y1;

    const d = img.data;
    const i11 = (y1 * w + x1) * 4;
    const i12 = (y1 * w + x2) * 4;
    const i21 = (y2 * w + x1) * 4;
    const i22 = (y2 * w + x2) * 4;

    const lerp = (a, b, t) => a + (b - a) * t;

    return [
        Math.round(lerp(lerp(d[i11], d[i12], dx), lerp(d[i21], d[i22], dx), dy)),
        Math.round(lerp(lerp(d[i11+1], d[i12+1], dx), lerp(d[i21+1], d[i22+1], dx), dy)),
        Math.round(lerp(lerp(d[i11+2], d[i12+2], dx), lerp(d[i21+2], d[i22+2], dx), dy)),
        255
    ];
}

function applyAdaptiveSharpening(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const original = new Uint8ClampedArray(data);

    // Adaptive sharpening - stronger for low-contrast areas (like text)
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = (y * width + x) * 4;

            for (let c = 0; c < 3; c++) {
                const center = original[i + c];
                
                // 3x3 Laplacian kernel for edge detection
                const sum = 
                    -original[((y-1) * width + x-1) * 4 + c] +
                    -original[((y-1) * width + x) * 4 + c] +
                    -original[((y-1) * width + x+1) * 4 + c] +
                    -original[(y * width + x-1) * 4 + c] +
                    8 * center +
                    -original[(y * width + x+1) * 4 + c] +
                    -original[((y+1) * width + x-1) * 4 + c] +
                    -original[((y+1) * width + x) * 4 + c] +
                    -original[((y+1) * width + x+1) * 4 + c];

                // Mild sharpening (20% of edge signal)
                const sharpened = center + 0.2 * (sum - center);
                data[i + c] = Math.max(0, Math.min(255, Math.round(sharpened)));
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function isConvexPolygon(points) {
    const n = points.length;
    if (n < 3) return false;

    let sign = 0;
    for (let i = 0; i < n; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % n];
        const p3 = points[(i + 2) % n];

        const cross = (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);
        
        if (Math.abs(cross) > 1e-10) {
            if (sign === 0) {
                sign = cross > 0 ? 1 : -1;
            } else if ((cross > 0 ? 1 : -1) !== sign) {
                return false;
            }
        }
    }
    return true;
}