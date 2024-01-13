import { Component } from '@angular/core';
/*
import value2325 from 'data/2023/25/sample.txt';
import value2324 from 'data/2023/24/sample.txt';
import value2323 from 'data/2023/23/sample.txt';
*/

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'AoC';
    output = '';

    go() {
        let year = '2023';
        let day = '25';
        let part = 'a';

        const classname = `${part}${year}${day}`;
        const dir = `${year}/${day}`;
        const inputfile = 'sample.txt'
        const datafile = `data/${dir}/${inputfile}`;

        const clazzPromise = import(/* webpackInclude: /src\/20\d\d\/\d\d\/[ab]20\d\d\d\d.ts$/ */ `src/${dir}/${classname}`);
        const valuePromise = import(`data/${dir}/sample.txt`);
        Promise.all([clazzPromise, valuePromise]).then(([clazzModule, valueModule]) => {
            let value = valueModule['default'];
            let clazz = clazzModule[classname];
            console.log(`value is [${value}]`, value);
            let puzzle = new clazz(inputfile);
            puzzle.loadData(value.split('\n'));
            while (puzzle.runStep()) {}
            this.output = `Final result: ${puzzle.result}`;
        })
    }
}
