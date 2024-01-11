import { createReadStream } from "fs";
import { createInterface } from "readline";

class C {
    constructor() {
        for (let x=0; x<100; x++) {
            this.grid[x] = new Array();
            for (let y=0; y<100; y++) {
                this.grid[x][y] = new Array(100).fill(false);
            }
        }
    }

    grid = new Array<Array<Array<boolean>>>();
    faces = 0;
    cubes = 0;

    process(line: string) {
        console.log(line);
        let [x,y,z] = line.split(',').map(Number);
        if (this.grid[x][y][z] === true) {
            console.error(`${x},${y},${z} is already occupied?`);
        } else {
            let addedFaces = 6;
            if (x>0 && this.grid[x-1][y][z] === true) addedFaces -= 2;
            if (this.grid[x+1][y][z] === true) addedFaces -= 2;
            if (y>0 && this.grid[x][y-1][z] === true) addedFaces -= 2;
            if (this.grid[x][y+1][z] === true) addedFaces -= 2;
            if (z>0 && this.grid[x][y][z-1] === true) addedFaces -= 2;
            if (this.grid[x][y][z+1] === true) addedFaces -= 2;
            this.grid[x][y][z] = true;
            this.faces += addedFaces;
            this.cubes++;
            this.debug();
        }
    }

    getResult() {
        return this.faces;
    }

    debug() {
        console.log(`[${this.cubes}] faces=${this.faces}`);
    }
}

let c = new C();

let fn = process.argv[2];
const rl = createInterface({ input: createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log(`Result: ${c.getResult()}`);
});