import { Puzzle } from "../../lib/puzzle.js";

type Point = {
    x: number;
    y: number;
    z: number;
    xv: number;
    yv: number;
    zv: number;
}

const puzzle = new Puzzle(process.argv[2]);

let xMin = 200000000000000;
let yMin = 200000000000000;

let xMax = 400000000000000;
let yMax = 400000000000000;

//xMin = 7; yMin = 7;
//xMax = 27; yMax = 27;

let points = new Array<Point>();

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            let arr = line.replace(/ +/g, '').split(/[@,]/).map(Number);
            points.push({x: arr[0], y: arr[1], z: arr[2], xv: arr[3], yv: arr[4], zv: arr[5]});
        });

        let cnt = 0;
        points.forEach((p1, ind) => {
            points.slice(ind+1).forEach(p2 => {
               if (p1.yv/p1.xv === p2.yv/p2.xv) {
                    console.debug(`${p1.xv}, ${p1.yv}, ${p1.zv} matches ${p2.xv}, ${p2.yv}, ${p2.zv}`);
                    console.debug(`Compare ${JSON.stringify(p1)} and ${JSON.stringify(p2)}`);
                }
                /*
                let [t1, t2, cp] = getCollisionTime(p1, p2);
                if (t1 > 0 && t2 > 0 && cp.x >= xMin && cp.x <= xMax && cp.y >= yMin && cp.y <= yMax) {
                    //console.debug(`Compare ${JSON.stringify(p1)} and ${JSON.stringify(p2)}: Colission at ${cp.x}, ${cp.y}, ${time}`);
                    cnt++;
                }
                */
            })
        })

        generateSageInput();
        console.debug(`Total collisions ${cnt}`);
    });

/**
 * doodles
 * https://www.desmos.com/calculator/4gc00wyjiz 
 * https://www.desmos.com/calculator/8y6dxskxdr
 */
/**
 * https://sagecell.sagemath.org/
 *
var('Rx Ry Rz a b c d e Rxv Ryv Rzv')
eq1 = -Rx+275*a-a*Rxv==-225004689740965
eq2 = -Rx+-162*b-b*Rxv==-338282582546422
eq3 = -Rx+-9*c-c*Rxv==-276063330011297
eq4 = -Rx+190*d-d*Rxv==-184895220833040
eq5 = -Rx+-31*e-e*Rxv==-191652244794317
eq6 = -Ry+389*a-a*Ryv==-150875733412640
eq7 = -Ry+84*b-b*Ryv==-191340608518886
eq8 = -Ry+-360*c-c*Ryv==-506267063607948
eq9 = -Ry+-100*d-d*Ryv==-346432574551322
eq10 = -Ry+21*e-e*Ryv==-228752744289266
eq11 = -Rz+375*a-a*Rzv==-116049940893518 
eq12 = -Rz+-46*b-b*Rzv==-340003210160681 
eq13 = -Rz+-275*c-c*Rzv==-451688278442130 
eq14 = -Rz+-32*d-d*Rzv==-295370687370609 
eq15 = -Rz+81*e-e*Rzv==-232281189081226 
solve([eq1,eq2,eq3,eq4,eq5,eq6,eq7,eq8,eq9,eq10,eq11,eq12,eq13,eq14,eq15],Rx,Ry,Rz,a,b,c,d,e,Rxv,Ryv,Rzv);
solns = solve([eq1,eq2,eq3,eq4,eq5,eq6,eq7,eq8,eq9,eq10,eq11,eq12,eq13,eq14,eq15],Rx,Ry,Rz,a,b,c,d,e,Rxv,Ryv,Rzv, solution_dict=True)
for i in [[s[Rx].n(50), s[Ry].n(50), s[Rz].n(50), s[a].n(50), s[b].n(50), s[c].n(50), s[d].n(50), s[e].n(50), s[Rxv].n(50), s[Rxv].n(50), s[Rzv].n(50)] for s in solns]:
    print(str(int(i[0]+i[1]+i[2])))
print('x:'+str(int(i[0])))
 */
function generateSageInput() {
    console.log(`Input for SAGE: https://sagecell.sagemath.org/`);
    console.log(`var('Rx Ry Rz a b c d e Rxv Ryv Rzv')`);
    for (let pNum = 0; pNum < 5; pNum++) {
        let p = points[pNum];
        let tVar = 'abcde'.charAt(pNum);
        console.log(`eq${pNum+1} = -Rx+${p.xv}*${tVar}-${tVar}*Rxv==${-p.x}`);
        console.log(`eq${pNum+6} = -Ry+${p.yv}*${tVar}-${tVar}*Ryv==${-p.y}`);
        console.log(`eq${pNum+11} = -Rz+${p.zv}*${tVar}-${tVar}*Rzv==${-p.z}`);
    }
    console.log(`solve([eq1,eq2,eq3,eq4,eq5,eq6,eq7,eq8,eq9,eq10,eq11,eq12,eq13,eq14,eq15],Rx,Ry,Rz,a,b,c,d,e,Rxv,Ryv,Rzv);`);
    console.log(`solns = solve([eq1,eq2,eq3,eq4,eq5,eq6,eq7,eq8,eq9,eq10,eq11,eq12,eq13,eq14,eq15],Rx,Ry,Rz,a,b,c,d,e,Rxv,Ryv,Rzv, solution_dict=True)`);
    console.log(`for i in [[s[Rx].n(50), s[Ry].n(50), s[Rz].n(50), s[a].n(50), s[b].n(50), s[c].n(50), s[d].n(50), s[e].n(50), s[Rxv].n(50), s[Rxv].n(50), s[Rzv].n(50)] for s in solns]:`);
    console.log(`    print(str(int(i[0]+i[1]+i[2])))`);
    console.log(`    print('x:' + str(int(i[0])) + ', y:' + str(int(i[1])) + ', z:' + str(int(i[2])) + ' / xv: ' + str(int(i[8])) + ', yv:' + str(int(i[9])) + ', zv:' + str(int(i[10])))`);
}


function getCollisionTime(p1: Point, p2: Point): [number, number, Point] {
    let m1 = p1.yv/p1.xv;
    let b1 = p1.y - m1*p1.x;

    let m2 = p2.yv/p2.xv;
    let b2 = p2.y - m2*p2.x;

    let cx = (b2-b1)/(m1-m2);

    let cy = m1*cx + b1;
    let t1 = (cx-p1.x)/p1.xv;
    let t2 = (cx-p2.x)/p2.xv;
    //console.debug(`at ${t}: ${cx}, ${cy}`);

    return [t1, t2, {x: cx, y: cy, z: 0, xv: 0, yv: 0, zv: 0}];
}


