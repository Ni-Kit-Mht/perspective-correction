export function getBilinearPixel(imageData, x, y, width, height) {
    const x1 = Math.floor(x);
    const y1 = Math.floor(y);
    const x2 = Math.min(x1 + 1, width - 1);
    const y2 = Math.min(y1 + 1, height - 1);
    
    const dx = x - x1;
    const dy = y - y1;
    
    const idx1 = (y1 * width + x1) * 4;
    const idx2 = (y1 * width + x2) * 4;
    const idx3 = (y2 * width + x1) * 4;
    const idx4 = (y2 * width + x2) * 4;
    
    const data = imageData.data;
    
    // Interpolate each channel
    const r = (1 - dx) * (1 - dy) * data[idx1] +
              dx * (1 - dy) * data[idx2] +
              (1 - dx) * dy * data[idx3] +
              dx * dy * data[idx4];
    
    const g = (1 - dx) * (1 - dy) * data[idx1 + 1] +
              dx * (1 - dy) * data[idx2 + 1] +
              (1 - dx) * dy * data[idx3 + 1] +
              dx * dy * data[idx4 + 1];
    
    const b = (1 - dx) * (1 - dy) * data[idx1 + 2] +
              dx * (1 - dy) * data[idx2 + 2] +
              (1 - dx) * dy * data[idx3 + 2] +
              dx * dy * data[idx4 + 2];
    
    const a = (1 - dx) * (1 - dy) * (data[idx1 + 3] || 255) +
              dx * (1 - dy) * (data[idx2 + 3] || 255) +
              (1 - dx) * dy * (data[idx3 + 3] || 255) +
              dx * dy * (data[idx4 + 3] || 255);
    
    return [Math.round(r), Math.round(g), Math.round(b), Math.round(a)];
}