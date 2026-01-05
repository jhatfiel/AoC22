import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a201906 extends AoCPuzzle {
  parent = new Map<string, string>();
  distanceToCOM = new Map<string, number>();

  sampleMode(): void { };

  _loadData(lines: string[]) {
    lines.forEach(line => {
      const [parent, node] = line.split(')');
      this.parent.set(node, parent);
    })
  }

  getDistanceToCOM(node: string): number {
    if (node === undefined) throw new Error(`Unknown node`)
    if (node === 'COM') return 0;
    let d = this.distanceToCOM.get(node);
    if (d === undefined) {
      d = 1 + this.getDistanceToCOM(this.parent.get(node));
      this.distanceToCOM.set(node, d);
    }
    return d;
  }

  _runStep(): boolean {
    let total = 0;
    for (const node of [...this.parent.keys()]) {
      console.log(`node: ${node}`);
      total += this.getDistanceToCOM(node);
    }
    this.result = total.toString();
    return false;
  }
}