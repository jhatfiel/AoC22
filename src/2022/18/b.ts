import { Dijkstra } from '../../lib/dijkstraBetter.js';
import fs from 'fs';
import readline from 'readline';

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
    xMax = 0;
    yMax = 0;
    zMax = 0;
    pieces = new Array<string>();

    process(line: string) {
        console.log(line);
        let [x,y,z] = line.split(',').map(Number);

        this.add(x+1, y+1, z+1);
        this.debug();
    }

    add(x: number, y: number, z: number) {
        if (this.xMax < x+1) this.xMax = x+1;
        if (this.yMax < y+1) this.yMax = y+1;
        if (this.zMax < z+1) this.zMax = z+1;
        this.grid[x][y][z] = true;
        this.pieces.push(this.makeKey(x, y, z));
    }

    getNeighbors(node: string) {
        let result = new Map<string, number>();
        let [x,y,z] = node.split(',').map(Number);
        if (x>0 && (this.grid[x-1][y][z] ?? false) !== true) result.set(this.makeKey(x-1,y,z), 1);
        if (x<=this.xMax && (this.grid[x+1][y][z] ?? false) !== true) result.set(this.makeKey(x+1,y,z), 1);
        if (y>0 && (this.grid[x][y-1][z] ?? false) !== true) result.set(this.makeKey(x,y-1,z), 1);
        if (y<=this.yMax && (this.grid[x][y+1][z] ?? false) !== true) result.set(this.makeKey(x,y+1,z), 1);
        if (z>0 && (this.grid[x][y][z-1] ?? false) !== true) result.set(this.makeKey(x,y,z-1), 1);
        if (z<=this.zMax && (this.grid[x][y][z+1] ?? false) !== true) result.set(this.makeKey(x,y,z+1), 1);
        return result;
    }

    makeKey(x: number, y: number, z: number) { return `${x},${y},${z}`; }

    getResult() {
        let result = 0;
        console.log(this.makeKey(this.xMax, this.yMax, this.zMax));
        let dij = new Dijkstra(this.getNeighbors.bind(this))
        let root = "0,0,0"
        // find what faces "root" can get to using Dijkstra.  That will tell us the exposed faces
        let distanceMap = dij.distanceAny(root);
        this.pieces.forEach((p) => {
            //console.log(`${p} path from root to faces`);
            let [x,y,z] = p.split(',').map(Number);
/*

            console.log(this.makeKey(x-1,y,z) + ':' + dij.getShortestPaths(root, this.makeKey(x-1,y,z)).join('/'));
            console.log(this.makeKey(x+1,y,z) + ':' + dij.getShortestPaths(root, this.makeKey(x+1,y,z)).join('/'));
            console.log(this.makeKey(x,y-1,z) + ':' + dij.getShortestPaths(root, this.makeKey(x,y-1,z)).join('/'));
            console.log(this.makeKey(x,y+1,z) + ':' + dij.getShortestPaths(root, this.makeKey(x,y+1,z)).join('/'));
            console.log(this.makeKey(x,y,z-1) + ':' + dij.getShortestPaths(root, this.makeKey(x,y,z-1)).join('/'));
            console.log(this.makeKey(x,y,z+1) + ':' + dij.getShortestPaths(root, this.makeKey(x,y,z+1)).join('/'));
            */
            if (distanceMap.has(this.makeKey(x-1,y,z))) result++;
            if (distanceMap.has(this.makeKey(x+1,y,z))) result++;
            if (distanceMap.has(this.makeKey(x,y-1,z))) result++;
            if (distanceMap.has(this.makeKey(x,y+1,z))) result++;
            if (distanceMap.has(this.makeKey(x,y,z-1))) result++;
            if (distanceMap.has(this.makeKey(x,y,z+1))) result++;

            /*
            if (dij.getShortestPath(root, this.makeKey(x-1,y,z)).length !== 0) result++;
            if (dij.getShortestPath(root, this.makeKey(x+1,y,z)).length !== 0) result++;
            if (dij.getShortestPath(root, this.makeKey(x,y-1,z)).length !== 0) result++;
            if (dij.getShortestPath(root, this.makeKey(x,y+1,z)).length !== 0) result++;
            if (dij.getShortestPath(root, this.makeKey(x,y,z-1)).length !== 0) result++;
            if (dij.getShortestPath(root, this.makeKey(x,y,z+1)).length !== 0) result++;
            */
        });
        return result;
    }

    debug() {
    }
}

let c = new C();

let fn = process.argv[2];
const rl = readline.createInterface({ input: fs.createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log(`Result: ${c.getResult()}`);
});