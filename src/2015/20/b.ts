// 29,000,000
let num=10;
let max=0;
const goal = 29000000;
while (num > 0) {
    let f = factors(num);
    let t = Array.from(f).reduce((acc, n) => acc+n)*11;
    if (t >= max) {
        max = t;
        console.log(`House ${num.toString().padStart(10, ' ')} gets ${t}`);// Factors=${Array.from(f)}`);
        if (t >= goal) break;
    }
    num++;
}

// 2636370 is too high

function factors(num: number): Set<number> {
    let result = new Set<number>;
    result.add(1);
    result.add(num);
    for (let i=2; i<=Math.floor(Math.sqrt(num)); i++) {
        if (num % i === 0) {
            if (num/i <= 50) result.add(i);
            if (i <= 50) result.add(num/i);
        }
    }
    return result;
}
