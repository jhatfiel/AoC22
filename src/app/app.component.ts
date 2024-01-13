import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'AoC';
    output = '';

    go(year: number, day: number, part: string, inputfile: string) {
        const classname = `${part}${year}${day}`;
        const dir = `${year}/${day}`;
        const datafile = `${dir}/${inputfile}`;

        const clazzPromise = import(
            /* webpackInclude: /src[\/\\]20\d\d[\/\\]\d\d[\/\\][ab]20\d\d\d\d.ts$/ */
            `src/${dir}/${classname}`
        );
        const valuePromise = import(
            `data/${datafile}.txt`
        );
        Promise.all([clazzPromise, valuePromise]).then(([clazzModule, valueModule]) => {
            let value = valueModule['default'];
            let clazz = clazzModule[classname];
            console.log(`value is [${value}]`, value);
            let puzzle = new clazz(inputfile);
            puzzle.loadData(value.split(/\r?\n/));
            while (puzzle.runStep()) {}
            this.output = `Final result: ${puzzle.result}`;
        })
    }
}
