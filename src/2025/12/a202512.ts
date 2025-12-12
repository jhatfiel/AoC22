import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202512 extends AoCPuzzle {
    shapes: {name: string, size: number, orientations: string[][][]}[] = [
        {name: 'A', size: 7, orientations: [
            [`###`.split(''),
             `#..`.split(''),
             `###`.split('')],
            [`###`.split(''),
             `#.#`.split(''),
             `#.#`.split('')],
            [`###`.split(''),
             `..#`.split(''),
             `###`.split('')],
            [`#.#`.split(''),
             `#.#`.split(''),
             `###`.split('')],
        ]},
        {name: 'B', size: 7, orientations: [
            [`###`.split(''),
             `.#.`.split(''),
             `###`.split('')],
            [`#.#`.split(''),
             `###`.split(''),
             `#.#`.split('')],
        ]},
        {name: 'C', size: 6, orientations: [
            [`###`.split(''),
             `##.`.split(''),
             `#..`.split('')],
            [`###`.split(''),
             `.##`.split(''),
             `..#`.split('')],
            [`..#`.split(''),
             `.##`.split(''),
             `###`.split('')],
            [`#..`.split(''),
             `##.`.split(''),
             `###`.split('')],
        ]},
        {name: 'D', size: 5, orientations: [
            [`.##`.split(''),
             `##.`.split(''),
             `#..`.split('')],
            [`##.`.split(''),
             `.##`.split(''),
             `..#`.split('')],
            [`..#`.split(''),
             `.##`.split(''),
             `##.`.split('')],
            [`#..`.split(''),
             `##.`.split(''),
             `.##`.split('')],
        ]},
        {name: 'E', size: 7, orientations: [
            [`###`.split(''),
             `##.`.split(''),
             `.##`.split('')],
            [`.##`.split(''),
             `###`.split(''),
             `#.#`.split('')],
            [`##.`.split(''),
             `.##`.split(''),
             `###`.split('')],
            [`#.#`.split(''),
             `###`.split(''),
             `##.`.split('')],
            [`###`.split(''),
             `.##`.split(''),
             `##.`.split('')],
            [`##.`.split(''),
             `###`.split(''),
             `#.#`.split('')],
            [`.##`.split(''),
             `##.`.split(''),
             `###`.split('')],
            [`#.#`.split(''),
             `###`.split(''),
             `.##`.split('')],
        ]},
        {name: 'F', size: 7, orientations: [
            [`###`.split(''),
             `##.`.split(''),
             `##.`.split('')],
            [`###`.split(''),
             `###`.split(''),
             `..#`.split('')],
            [`.##`.split(''),
             `.##`.split(''),
             `###`.split('')],
            [`#..`.split(''),
             `###`.split(''),
             `###`.split('')],
            [`###`.split(''),
             `.##`.split(''),
             `.##`.split('')],
            [`###`.split(''),
             `###`.split(''),
             `#..`.split('')],
            [`##.`.split(''),
             `##.`.split(''),
             `###`.split('')],
            [`..#`.split(''),
             `###`.split(''),
             `###`.split('')],
        ]},
    ]

    sampleMode(): void {
        this.shapes = [
            {name: 'A', size: 7, orientations: [
                [`###`.split(''),
                 `##.`.split(''),
                 `##.`.split('')],
                [`###`.split(''),
                 `###`.split(''),
                 `..#`.split('')],
                [`.##`.split(''),
                 `.##`.split(''),
                 `###`.split('')],
                [`#..`.split(''),
                 `###`.split(''),
                 `###`.split('')],
                [`###`.split(''),
                 `.##`.split(''),
                 `.##`.split('')],
                [`###`.split(''),
                 `###`.split(''),
                 `#..`.split('')],
                [`##.`.split(''),
                 `##.`.split(''),
                 `###`.split('')],
                [`..#`.split(''),
                 `###`.split(''),
                 `###`.split('')],
            ]},
            {name: 'B', size: 7, orientations: [
                [`###`.split(''),
                 `##.`.split(''),
                 `.##`.split('')],
                [`.##`.split(''),
                 `###`.split(''),
                 `#.#`.split('')],
                [`##.`.split(''),
                 `.##`.split(''),
                 `###`.split('')],
                [`#.#`.split(''),
                 `###`.split(''),
                 `##.`.split('')],
                [`###`.split(''),
                 `.##`.split(''),
                 `##.`.split('')],
                [`##.`.split(''),
                 `###`.split(''),
                 `#.#`.split('')],
                [`.##`.split(''),
                 `##.`.split(''),
                 `###`.split('')],
                [`#.#`.split(''),
                 `###`.split(''),
                 `.##`.split('')],
            ]},
            {name: 'C', size: 7, orientations: [
                [`.##`.split(''),
                 `###`.split(''),
                 `##.`.split('')],
                [`##.`.split(''),
                 `###`.split(''),
                 `.##`.split('')],
            ]},
            {name: 'D', size: 7, orientations: [
                [`##.`.split(''),
                 `###`.split(''),
                 `##.`.split('')],
                [`###`.split(''),
                 `###`.split(''),
                 `.#.`.split('')],
                [`.##`.split(''),
                 `###`.split(''),
                 `.##`.split('')],
                [`.#.`.split(''),
                 `###`.split(''),
                 `###`.split('')],
            ]},
            {name: 'E', size: 7, orientations: [
                [`###`.split(''),
                 `#..`.split(''),
                 `###`.split('')],
                [`###`.split(''),
                 `#.#`.split(''),
                 `#.#`.split('')],
                [`###`.split(''),
                 `..#`.split(''),
                 `###`.split('')],
                [`#.#`.split(''),
                 `#.#`.split(''),
                 `###`.split('')],
            ]},
            {name: 'F', size: 7, orientations: [
                [`###`.split(''),
                 `.#.`.split(''),
                 `###`.split('')],
                [`#.#`.split(''),
                 `###`.split(''),
                 `#.#`.split('')],
            ]},

        ];
    };

    regions: {width: number, height: number, presents: number[]}[] = [];
    easyCount = 0;
    hardCount = 0;
    impossibleCount = 0;

    _loadData(lines: string[]) {
        lines.filter(l=>l.indexOf('x') != -1).forEach(l => {
            const match = l.match(/^(\d+)x(\d+): (\d+) (\d+) (\d+) (\d+) (\d+) (\d+)/).map(Number);
            this.regions.push({width: match[1], height: match[2], presents: match.slice(3, 9)})
        })
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.regions.length;
        const region = this.regions[this.stepNumber-1];
        const regionSize = region.height*region.width;
        const squaresNeeded = region.presents.reduce((sum, n, i) => sum+n*this.shapes[i].size, 0);
        const blocksNeeded = region.presents.reduce((sum, n) => sum+n, 0);
        if (regionSize < squaresNeeded) {
            this.impossibleCount++;
        } else if (regionSize >= 9*blocksNeeded) {
            this.easyCount++;
        } else {
            console.log(`HARD region ${this.stepNumber}: ${region.width}x${region.height} with presents ${region.presents.join(', ')} Size: ${regionSize} squaresNeeded: ${squaresNeeded}, blocksNeeded: ${blocksNeeded}`);
            this.hardCount++;
        }
        if (!moreToDo) {
            this.result = `Easy: ${this.easyCount} Hard: ${this.hardCount} Impossible: ${this.impossibleCount}`;
        }
        // 250 too low
        // 375 incorrect (no more hints, LOL)
        // 500 too high
        // 750 too high
        return moreToDo;
    }
}