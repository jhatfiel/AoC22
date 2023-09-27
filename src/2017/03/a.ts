function reverseTriangleNumber(x: number): number {
    //  n*(n+1)/2 = x => (n^2+n)/2 = x => n^2+n-2x = 0 => n = (-1+-sqrt(1+8*x))/2
    return 1+Math.floor((Math.sqrt(x-1)-1)/2);
}

function triangleNumber(n: number): number {
    if (n==0) return 1;
    n--;
    return 4*(n*n+n)+2;
}

function steps(n: number): number {
    let ring = reverseTriangleNumber(n);
    let firstInRing = triangleNumber(ring);
    let width = 2*ring || 1;
    return ring+Math.abs((((n-firstInRing)%width)-ring+1)%(ring+1));
}

[1, 12, 23, 1024, 277678].forEach((i) => {
    console.log(`${i}: ${steps(i)}`);
});