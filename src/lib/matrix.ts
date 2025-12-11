export class Matrix {
    constructor (public arr: number[][]) {}
    EPS = 1e-10;
    isZero(x) { return Math.abs(x) < this.EPS; }

    swapRows(r1: number, r2: number) {
        const temp = this.arr[r1];
        this.arr[r1] = this.arr[r2];
        this.arr[r2] = temp;
    }

    cancelRow(r1: number, r2: number, pivotColumn: number) {
        let scale = -1 * this.arr[r2][pivotColumn] / this.arr[r1][pivotColumn];
        this.addRow(r1, r2, scale);
    }

    addRow(r1: number, r2: number, scale: number) {
        this.arr[r1].forEach((v, index) => this.arr[r2][index] = this.arr[r2][index] + v*scale);
    }

    scaleRow(r1: number, scale: number) {
        this.arr[r1].forEach((v, index) => this.arr[r1][index] = v*scale);
    }

    toEchelon() {
        let topRow = 0;
        for (let pivotColumn=0; pivotColumn < this.arr[0].length; pivotColumn++) {
            //this.debug(`toEchelon, topRow=${topRow}, pivotColumn=${pivotColumn}`)
            let maxValue = 0;
            let maxRow = 0;
            // move the highest absolute value row to the top
            for (let row = topRow; row < this.arr.length; row++) {
                let value = Math.abs(this.arr[row][pivotColumn]);
                if (value > maxValue) { 
                    maxValue = value;
                    maxRow = row;
                }

            }
            if (!this.isZero(maxValue)) {
                if (maxRow !== topRow) {
                    this.swapRows(topRow, maxRow);
                }
                for (let row = topRow+1; row < this.arr.length; row++) {
                    this.cancelRow(topRow, row, pivotColumn);
                }
                topRow++;
            } else {
                // we didn't find any non-zero values in this column
            }
        }
        //this.debug(`toEchelon at end, topRow=${topRow}`);
    }

    toRREF() {
        this.toEchelon();
        // start at the bottom and set the diagonal to 1
        for (let row=this.arr.length-1; row >= 0; row--) {
            let thisRow = this.arr[row];
            let pivotColumn = thisRow.findIndex(v => !this.isZero(v));
            if (pivotColumn !== -1) {
                this.scaleRow(row, 1/thisRow[pivotColumn]);
                for (let r=0; r<row; r++) {
                    this.cancelRow(row, r, pivotColumn);
                }
            }
        }
        //this.debug(`toRREF at end`);
    }

    round(n: number, places = 12): number { return Math.round(n*10**places)/10**places; }

    /**
     * Convert as far as possible to RREF and give final solutions
     * @returns Array of strings representing the solutions
     */
    solve(): string[] {
        let result: string[] = [];
        this.toRREF();
        this.arr.forEach(row => {
            let eq = '';
            row.forEach((v, index) => {
                if (index === row.length-1) {
                    // value
                    if (eq) {
                        eq += ' = ' + this.round(v);
                        result.push(eq);
                    }
                } else {
                    // variable
                    if (this.round(v) === 1) {
                        if (eq) eq += ' + '
                        eq += `X${index}`;
                    }
                }
            })
        });
        return result;
        //return this.arr.map(row => row[this.arr.length]).map(n => Math.round(n*(10**12))/10**12);
    }

    /**
     * Get the solution for parameter number specified. Assumes the matrix is in RREF.
     * @param n Parameter Number
     * @param places Parameter Number number of places to round to
     * @returns  if there is not a defined answer, returns undefined
     */
    getSolution(n: number, places=12): number {
        let result: number = undefined;
        this.arr.some(row => {
            if (row.every((v, index) => (index !== n && this.isZero(v)) || (index === n && this.round(v, places) === 1) || index === row.length-1)) {
                result = this.round(row[row.length-1], places);
                return true;
            } else {
                return false;
            }
        });
        return result;
    }

    debug(msg: string = '') {
        if (msg) console.log(msg);
        this.arr.forEach(row => console.log(`${row.map(c => c.toFixed(2).padStart(8, ' ')).join(' ')}`));
    }
}

/*
let m = new Matrix([[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]]);
m.debug('Original Matrix');
let solution = m.solve();
m.debug('Final Matrix');
console.log(`Solution: ${solution.join(' / ')}`);
console.log(`x0 = ${m.getSolution(0)}`)
console.log(`x1 = ${m.getSolution(1)}`)
console.log(`x2 = ${m.getSolution(2)}`)

m = new Matrix([[1, 1, 3], [2, 2, 6]]);
m.debug('Original Matrix');
//m.toEchelon();
//m.toRREF();
solution = m.solve();
m.debug('Final Matrix');
console.log(`Solution: ${solution.join(' / ')}`);
console.log(`x0 = ${m.getSolution(0)}`)
console.log(`x1 = ${m.getSolution(1)}`)

m = new Matrix([[1, 1, 3], [2, 2, 6], [5, 1, 11]]);
m.debug('Original Matrix');
//m.toEchelon();
//m.toRREF();
solution = m.solve();
m.debug('Final Matrix');
console.log(`Solution: ${solution.join(' / ')}`);
console.log(`x0 = ${m.getSolution(0)}`)
console.log(`x1 = ${m.getSolution(1)}`)
*/