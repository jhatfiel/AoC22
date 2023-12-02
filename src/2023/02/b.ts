import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

class Bag {
    constructor() {};
    private redCubes=0;
    private greenCubes=0;
    private blueCubes=0;

    grab(red, green, blue) {
        if (red >= this.redCubes) this.redCubes = red;
        if (green >= this.greenCubes) this.greenCubes = green;
        if (blue >= this.blueCubes) this.blueCubes = blue;
    }

    getPower(): number {
        return this.redCubes * this.greenCubes * this.blueCubes
    }

    getRed(): number { return this.redCubes }
    getGreen(): number { return this.greenCubes }
    getBlue(): number { return this.blueCubes }
}

await puzzle.run()
    .then((lines: Array<string>) => {
        let powerSum = 0;
        lines.forEach(line => {
            const arr = line.split(':');
            // get game id
            const gameID = Number(arr[0].split(' ')[1]);
            let bag = new Bag();
            //console.debug(`Working with game ${gameID}`)
            // separate out the grabs
            arr[1].trimStart().split(';').map(s => s.trimStart()).forEach(grabString => {
                // separate out colors
                let grabRed=0, grabGreen=0, grabBlue=0;
                grabString.split(',').map(s => s.trimStart()).forEach(color => {
                    let colorArr = color.split(' ');
                    let num = Number(colorArr[0]);
                    if (colorArr[1] == 'red') grabRed = num;
                    if (colorArr[1] == 'green') grabGreen = num;
                    if (colorArr[1] == 'blue') grabBlue = num;
                })

                // update the bag
                bag.grab(grabRed, grabGreen, grabBlue);
            })
            console.log(`Number of cubes in bag ${gameID}: red=${bag.getRed()}, green=${bag.getGreen()}, blue=${bag.getBlue()}`)
            powerSum += bag.getPower();
        });
        console.log(`Power Sum: ${powerSum}`);
    });
