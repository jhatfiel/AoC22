import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

interface Ingredient {
  name: string
  qty: number
}

interface Recipe {
  prod: Ingredient
  ingredients: Ingredient[]
}

export class a201914 extends AoCPuzzle {
  recipes = new Map<string, Recipe>();
  sampleMode(): void { };

  _loadData(lines: string[]) {
    lines.forEach(line => {
      const parts = line.split(' => ');
      const [amt, name] = parts[1].split(' ');
      const prod = {name, qty: Number(amt)};
      const ingredients = parts[0].split(', ').map(i => i.split(' ')).map(a => ({name: a[1], qty: Number(a[0])}));
      //console.log(`${JSON.stringify(prod)} produced using ${JSON.stringify(ingredients)}`)
      if (this.recipes.has(name)) {
        throw new Error(`duplicate recipe: ${name}`);
      }
      this.recipes.set(name, {prod, ingredients})
    })
  }

  calculateRequired(ing: Ingredient): number {
    let oreQty = 0;
    let needed = new Map<string, number>();
    needed.set(ing.name, ing.qty);
    let have = new Map<string, number>();
    while (needed.size) {
      let toMake = [...needed.keys()].at(0);
      let toMakeQty = needed.get(toMake);
      needed.delete(toMake);
      //console.log(`Going to make ${toMake} qty=${toMakeQty}`);
      let toMakeOnHand = have.get(toMake)??0;
      if (toMakeOnHand < toMakeQty) {
        //console.log(`--- We have ${toMakeOnHand} of that on hand!`);
        have.delete(toMake);
        toMakeQty -= toMakeOnHand;
        // still need to make some
      } else {
        //console.log(`--- Oh, we have enough of that on hand!`);
        have.set(toMake, toMakeOnHand - toMakeQty);
        // done
        continue;
      }
      // we still need more of toMake, and we've used up ALL that we have
      //console.log(`--- still need ${toMakeQty}`);
      let recipe = this.recipes.get(toMake);
      let times = Math.ceil(toMakeQty / recipe.prod.qty);
      let leftover = times*recipe.prod.qty - toMakeQty;
      //console.log(`--- will take ${times} copies of ${JSON.stringify(recipe)} with ${leftover} leftover`);
      have.set(toMake, leftover);

      recipe.ingredients.forEach(({name, qty}) => {
        qty *= times;
        if (name === 'ORE') oreQty += qty
        else {
          let currentNeeded = needed.get(name);
          if (currentNeeded !== undefined) qty += currentNeeded;
          needed.set(name, qty);
        }
      })
    }

    return oreQty;
  }

  _runStep(): boolean {
    const ONE_TRILLION = 1000000000000
    let for1 = this.calculateRequired({name: 'FUEL', qty: 1});
    console.log(`Part 1: ${for1}`);

    let n = Math.ceil(ONE_TRILLION/for1);
    let adjust = .1;
    let needed = this.calculateRequired({name: 'FUEL', qty: n});
    while (true) {
      let nextN = Math.ceil(n*(1+adjust));
      if (nextN === n) break;
      while (needed < ONE_TRILLION) {
        n = Math.ceil(n*(1+adjust));
        needed = this.calculateRequired({name: 'FUEL', qty: n});
      }
      //console.log(`HIT MAX: To make ${n} FUEL would require ${needed} ORE`);
      nextN = Math.ceil(n*(1-adjust));
      if (nextN === n) { n--; break; }
      while (needed > ONE_TRILLION) {
        n = Math.ceil(n*(1-adjust));
        needed = this.calculateRequired({name: 'FUEL', qty: n});
      }
      adjust *= .9;
    }
    needed = this.calculateRequired({name: 'FUEL', qty: n});
    console.log(`Part 2: ${n} (requires ${needed})`);
    this.result = n.toString();
    return false;
  }
}