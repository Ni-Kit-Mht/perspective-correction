export class PerspectiveTransform {
    constructor(srcPoints, dstPoints) {
        this.matrix = this.computeMatrix(srcPoints, dstPoints);
    }

    computeMatrix(src, dst) {
        // src and dst are arrays of 4 points: [x1,y1, x2,y2, x3,y3, x4,y4]
        const A = [];

        for (let i = 0; i < 4; i++) {
            const sx = src[i * 2];
            const sy = src[i * 2 + 1];
            const dx = dst[i * 2];
            const dy = dst[i * 2 + 1];

            A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
            A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
        }

        const b = [
            dst[0], dst[1], dst[2], dst[3],
            dst[4], dst[5], dst[6], dst[7]
        ];

        const h = this.solveLinearSystem(A, b);
        return [...h, 1];
    }

    solveLinearSystem(A, b) {
        const n = A.length;
        const augmented = A.map((row, i) => [...row, b[i]]);

        // Gaussian elimination with partial pivoting
        for (let i = 0; i < n; i++) {
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                    maxRow = k;
                }
            }

            [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

            for (let k = i + 1; k < n; k++) {
                const factor = augmented[k][i] / augmented[i][i];
                for (let j = i; j < n + 1; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
                }
            }
        }

        // Back substitution
        const x = new Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            x[i] = augmented[i][n];
            for (let j = i + 1; j < n; j++) {
                x[i] -= augmented[i][j] * x[j];
            }
            x[i] /= augmented[i][i];
        }

        return x;
    }

    transform(x, y) {
        const w = this.matrix[6] * x + this.matrix[7] * y + this.matrix[8];
        const tx = (this.matrix[0] * x + this.matrix[1] * y + this.matrix[2]) / w;
        const ty = (this.matrix[3] * x + this.matrix[4] * y + this.matrix[5]) / w;
        return [tx, ty];
    }
}
