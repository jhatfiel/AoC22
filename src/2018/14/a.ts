import { Puzzle } from '../../lib/puzzle.js';

let scores = Array<number>();

const puzzle = new Puzzle();
processRecipes(5);
processRecipes(9);
processRecipes(18);
processRecipes(2018);
processRecipes(864801);

function processRecipes(numRecipes: number) {
    scores = [3, 7];
    let n1=0;
    let n2=1;
    while (scores.length < numRecipes+10) {
        //debugScores(n1, n2);
        let s1 = scores[n1], s2 = scores[n2];
        let sum = s1 + s2;
        sum.toString().split('').forEach(c => scores.push(Number(c)));
        n1 = (n1 + 1 + s1)%scores.length;
        n2 = (n2 + 1 + s2)%scores.length;
    }
    
    let last10 = scores.slice(numRecipes, numRecipes+10);
    console.log(`After ${numRecipes.toString().padStart(8,' ')}, the next ten are ${last10.map(n => n.toString()).join('')}`);
}

function debugScores(n1: number, n2: number) {
    let str = ' ' + scores.join('  ') + ' ';
    str = str.slice(0, n1*3) + '(' + str.charAt(n1*3+1) + ')' + str.slice(n1*3+3);
    str = str.slice(0, n2*3) + '[' + str.charAt(n2*3+1) + ']' + str.slice(n2*3+3);
    console.debug(str);
}