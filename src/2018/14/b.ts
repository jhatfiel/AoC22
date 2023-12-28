import { Puzzle } from '../../lib/puzzle.js';

let scores = Array<number>();

const puzzle = new Puzzle();
processRecipes('51589');
processRecipes('01245');
processRecipes('92510');
processRecipes('59414');
processRecipes('864801');

function processRecipes(searchScores: string) {
    let len = searchScores.length;
    scores = [3, 7];
    let lastScore = '37'.padStart(len, ' ');
    let n1=0;
    let n2=1;
    while (true) {
        //debugScores(n1, n2);
        let s1 = scores[n1], s2 = scores[n2];
        let sum = s1 + s2;
        if (sum >= 10) {
            scores.push(1);
            lastScore = lastScore.slice(1) + '1';
            if (lastScore === searchScores) break;
            sum -= 10;
        }
        scores.push(sum);
        lastScore = lastScore.slice(1) + sum.toString();
        if (lastScore === searchScores) break;

        n1 = (n1 + 1 + s1)%scores.length;
        n2 = (n2 + 1 + s2)%scores.length;
    }
    
    console.log(`${searchScores.padStart(8, ' ')} occurs after ${scores.length - len}`);
}

function debugScores(n1: number, n2: number) {
    let str = ' ' + scores.join('  ') + ' ';
    str = str.slice(0, n1*3) + '(' + str.charAt(n1*3+1) + ')' + str.slice(n1*3+3);
    str = str.slice(0, n2*3) + '[' + str.charAt(n2*3+1) + ']' + str.slice(n2*3+3);
    console.debug(str);
}