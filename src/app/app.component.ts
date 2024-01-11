import { Component } from '@angular/core';
import { a202325 } from 'src/2023/25/a202325';
import value from 'data/2023/25/sample.txt';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'AoC';
    puzzle = new a202325();
    value = value;
    output = '';

    go() {
        this.puzzle.loadData(value.split('\n'));
        while (this.puzzle.runStep()) { }
        
        this.output = `Final result: ${this.puzzle.result}`;
    }
}
