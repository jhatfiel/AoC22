import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202512 extends AoCPuzzle {
    shapes: {name: string, width: number, height: number, orientations: string[][][]}[] = [
        {name: 'A', width: 3, height: 3, orientations: [
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
        {name: 'B', width: 3, height: 3, orientations: [
            [`###`.split(''),
             `.#.`.split(''),
             `###`.split('')],
            [`#.#`.split(''),
             `###`.split(''),
             `#.#`.split('')],
        ]},
        {name: 'C', width: 3, height: 3, orientations: [
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
        {name: 'D', width: 3, height: 3, orientations: [
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
        {name: 'E', width: 3, height: 3, orientations: [
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
        {name: 'F', width: 3, height: 3, orientations: [
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
            {name: 'A', width: 3, height: 3, orientations: [
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
            {name: 'B', width: 3, height: 3, orientations: [
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
            {name: 'C', width: 3, height: 3, orientations: [
                [`.##`.split(''),
                 `###`.split(''),
                 `##.`.split('')],
                [`##.`.split(''),
                 `###`.split(''),
                 `.##`.split('')],
            ]},
            {name: 'D', width: 3, height: 3, orientations: [
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
            {name: 'E', width: 3, height: 3, orientations: [
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
            {name: 'F', width: 3, height: 3, orientations: [
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

    _loadData(lines: string[]) {
        lines.filter(l=>l.indexOf('x') != -1).forEach(l => {
            const match = l.match(/^(\d)+x(\d+): (\d+) (\d+) (\d+) (\d+) (\d+) (\d+)/).map(Number);
            this.regions.push({width: match[1], height: match[2], presents: match.slice(3, 9)})
        })
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.regions.length;
        const region = this.regions[this.stepNumber-1];
        console.log(`Processing region ${this.stepNumber}: ${region.width}x${region.height} with presents ${region.presents.join(', ')}`);    
        if (!moreToDo) {
            this.result = 'Result';
        }
        // 250 too low
        // 375 incorrect (no more hints, LOL)
        // 500 too high
        // 750 too high
        return moreToDo;
    }
}