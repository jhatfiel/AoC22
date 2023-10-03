/**
 * Usage:
 * 
import '../../lib/number.extensions.js';

console.log('3'.padZero(4));

(5).times(ind => console.log(`times ${ind.padZero(4)}`));
 */
interface Number {
  padZero(length: number);
  times(fn: (ind: number) => any, ctx: any)
}

interface String {
  padZero(length: number);
}

String.prototype.padZero = function (length: number) {
  return this.padStart(length, '0');
}

Number.prototype.padZero = function (length: number) {
  return this.toString().padZero(length)
}

Number.prototype.times = function(fn: (ind: number) => any, ctx: any){
    if (!fn) return;
    var scope = ctx || null;
    for (var _x = 0, _xx = ~~this.valueOf(); _x < _xx; _x++) {
      fn.call(scope, _x, _xx);
    }
    return this.valueOf();
};