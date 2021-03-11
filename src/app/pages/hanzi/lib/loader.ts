import { BehaviorSubject, Observable } from 'rxjs';
import { Record } from '.';

export class Loader {

    private dataSource = new BehaviorSubject<any>([]);
    private mediansUrl = '/assets/hanzi/medians.bin';
    private dictionaryurl = '/assets/hanzi/dictionary.txt'
    data$ = this.dataSource.asObservable();

    constructor() {
        this.loadMedians();
    }

    private loadMedians(): void {
        const request = new XMLHttpRequest;
        request.open('GET', this.mediansUrl, true);
        request.responseType = 'arraybuffer';
        const loader = this;

        request.onload = () => {
            const res = new Uint8Array(request.response);
            const result = loader.transform(res);
            loader.dataSource.next(result)
        }
        request.onerror = function () {
            console.error('BufferLoader: XHR error');
        };
        request.send();
    }

    public loadDictionary(): Observable<Record[]> {
        const request = new XMLHttpRequest;
        request.open('GET', this.dictionaryurl, true);
        request.responseType = 'json';
        request.send();
        return new Observable((observer) => {
            request.onload = () => {
                observer.next(request.response);
                observer.complete();
            }
            request.onerror = function () {
                console.error('DICT XHR error');
            };
        });
    }

    private transform(e): any[] {
        let arr = [];
        for (let i = 0; i < e.length;) {
            const a = this.n(e, i);
            arr.push(a[0]);
            i = a[1];
        }
        return arr;
    }

    private n(n, e): any {
        const r = String.fromCodePoint(n[e] + (n[e + 1] << 8))
            , a = []
            , i = n[e + 2];
        e += 3;
        for (let t = 0; i > t; t++) {
            const s = n[e];
            if (n.slice)
                a.push(n.slice(e + 1, e + s + 1));
            else {
                const o = [];
                for (let u = 0; s > u; u++)
                    o.push(n[e + u + 1]);
                a.push(o)
            }
            e += s + 1
        }
        return [[r, a], e]
    }
}