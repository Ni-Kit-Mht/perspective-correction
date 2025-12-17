// mvc.js (FIXED & STABILIZED — API UNCHANGED)

export function mapPointUsingMVC(x, y, width, height, polygon) {
    const n = polygon.length;
    if (n < 3) return { x, y };

    const weights = new Float64Array(n);
    let sum = 0;

    const dx = new Float64Array(n);
    const dy = new Float64Array(n);
    const r  = new Float64Array(n);

    for (let i = 0; i < n; i++) {
        dx[i] = polygon[i].x - x;
        dy[i] = polygon[i].y - y;
        r[i] = Math.hypot(dx[i], dy[i]);

        if (r[i] < 1e-6) {
            return { x: polygon[i].x, y: polygon[i].y };
        }
    }

    for (let i = 0; i < n; i++) {
        const im = (i - 1 + n) % n;
        const ip = (i + 1) % n;

        const cosA = clamp(
            (dx[i] * dx[ip] + dy[i] * dy[ip]) / (r[i] * r[ip]),
            -1, 1
        );
        const cosB = clamp(
            (dx[im] * dx[i] + dy[im] * dy[i]) / (r[im] * r[i]),
            -1, 1
        );

        const w =
            (Math.tan(Math.acos(cosA) * 0.5) +
             Math.tan(Math.acos(cosB) * 0.5)) / r[i];

        weights[i] = w;
        sum += w;
    }

    if (sum < 1e-10) {
        let sx = 0, sy = 0;
        for (const p of polygon) {
            sx += p.x;
            sy += p.y;
        }
        return { x: sx / n, y: sy / n };
    }

    let sx = 0, sy = 0;
    for (let i = 0; i < n; i++) {
        const w = weights[i] / sum;
        sx += polygon[i].x * w;
        sy += polygon[i].y * w;
    }

    return { x: sx, y: sy };
}

function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
}
