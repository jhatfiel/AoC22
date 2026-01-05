import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class b201906 extends AoCPuzzle {
  parent = new Map<string, string>();
  pathToCOM = new Map<string, string[]>();

  sampleMode(): void { };

  _loadData(lines: string[]) {
    lines.forEach(line => {
      const [parent, node] = line.split(')');
      this.parent.set(node, parent);
    })
  }

  getPathToCOM(node: string): string[] {
    if (node === undefined) throw new Error(`Unknown node`)
    if (node === 'COM') return [];
    let d = this.pathToCOM.get(node);
    if (d === undefined) {
      d = [node, ...this.getPathToCOM(this.parent.get(node))];
      this.pathToCOM.set(node, d);
    }
    return d;
  }

  _runStep(): boolean {
    let total = 0;
    const p1 = this.getPathToCOM('YOU');
    const p2 = this.getPathToCOM('SAN');
    console.log(`YOU path: ${p1.join(',')}`);
    console.log(`SAN path: ${p2.join(',')}`);
    while (p1.at(-1) === p2.at(-1)) {
      p1.pop();
      p2.pop();
    }
    console.log(`YOU path: ${p1.join(',')}`);
    console.log(`SAN path: ${p2.join(',')}`);
    total = p1.length + p2.length - 2;
    this.result = total.toString();
    return false;
  }
}