export class BooleanArray {
    CHUNK_SIZE = 32;
    chunks: number[];
    numChunks: number;
    constructor(public size: number, init: boolean = false) {
        this.numChunks = Math.ceil(size / this.CHUNK_SIZE);
        this.chunks = Array.from({length: this.numChunks}, _ => init?Number.MAX_SAFE_INTEGER:0);
    }

    set(index: number, value: boolean) {
        if (index >= this.size) throw new Error(`BooleanArray: ${index} greater than array size of ${this.size}`);

        let chunkNum = Math.floor(index / this.CHUNK_SIZE);
        if (value) {
            this.chunks[chunkNum] |= 1<<(index%this.CHUNK_SIZE);
        } else {
            this.chunks[chunkNum] &= ~(1<<(index%this.CHUNK_SIZE));
        }
    }

    get(index: number): boolean {
        if (index >= this.size) throw new Error(`BooleanArray: ${index} greater than array size of ${this.size}`);
        let chunkNum = Math.floor(index / this.CHUNK_SIZE);
        return (this.chunks[chunkNum] & 1<<(index%this.CHUNK_SIZE)) !== 0;
    }

    debug() {
        for (let i=0; i < this.chunks.length; i++) {
            let chunk = this.chunks[i];
            console.log(`${i.toString().padStart(3)} ${chunk.toString(2).padStart(this.CHUNK_SIZE, '0')}`);
        }
    }
}

/*
let ba = new BooleanArray(50, false);
ba.debug();
ba.set(0, true);
ba.debug();
ba.set(1, true);
ba.debug();
console.log(ba.get(1));
ba.set(2, true);
ba.set(1, false);
ba.debug();
console.log(ba.get(1));
*/