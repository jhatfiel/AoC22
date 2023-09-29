export function knotHash(input: string): string {
    let originalInputArr = input.split('').map((c) => c.charCodeAt(0));
    originalInputArr.push(17, 31, 73, 47, 23);
    let arr = Array.from({length: 256}, (_, ind) => ind);
    let curPos = 0;
    let skipSize = 0;
    let addMod = (p: number, n: number): number => (p+n)%arr.length;
    for (let round=0; round<64; round++) {
        let inputArr = [...originalInputArr];
        while (inputArr.length) {
            let len = inputArr.shift();
            for (let i=0; i < len/2; i++) {
                let t=arr[addMod(curPos, i)];
                arr[addMod(curPos, i)] = arr[addMod(curPos, len-1-i)];
                arr[addMod(curPos, len-1-i)] = t;
            }
            curPos = addMod(curPos, len+skipSize);
            skipSize++;
        }
    }

    let dense = new Array<string>();
    for (let i=0; i<16; i++) {
        dense.push(arr.slice(16*i, 16*i+16).reduce((acc, n) => acc = acc ^ n, 0).toString(16).padStart(2, '0'));
    }
    return dense.join('')
}