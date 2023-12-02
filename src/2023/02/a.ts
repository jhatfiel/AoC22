import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

class Bag {
    constructor(public redCubes: number, public greenCubes: number, public blueCubes: number) {};

    isPossible(red, green, blue): boolean {
        return (red <= this.redCubes && green <= this.greenCubes && blue <= this.blueCubes);
    }
}

await puzzle.run()
    .then((lines: Array<string>) => {
        let bag = new Bag(12, 13, 14);
        let gameIDSum = 0;
        lines.forEach(line => {
            const arr = line.split(':');
            // get game id
            const gameID = Number(arr[0].split(' ')[1]);
            //console.debug(`Working with game ${gameID}`)
            // separate out the grabs
            const gameStrings = arr[1].trimStart().split(';').map(s => s.trimStart());
            let isPossible = true;
            gameStrings.forEach(grabString => {
                // separate out colors
                let grabRed=0, grabGreen=0, grabBlue=0;
                let grabArr = grabString.split(',').map(s => s.trimStart());
                grabArr.forEach(color => {
                    let colorArr = color.split(' ');
                    if (colorArr[1] == 'red') grabRed = Number(colorArr[0]);
                    if (colorArr[1] == 'green') grabGreen = Number(colorArr[0]);
                    if (colorArr[1] == 'blue') grabBlue = Number(colorArr[0]);
                })

                // see if possible
                if (!bag.isPossible(grabRed, grabGreen, grabBlue)) {
                    console.debug(`Game ${gameID} not possible because guess is red=${grabRed}, green=${grabGreen}, blue=${grabBlue}`)
                    isPossible = false;
                }
            })
            if (isPossible) gameIDSum += gameID;
        });
        console.log(`Sum of gameID: ${gameIDSum}`);
    });
