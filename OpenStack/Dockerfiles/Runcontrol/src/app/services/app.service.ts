import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable, throwError as observableThrowError} from 'rxjs';
import { map, catchError } from 'rxjs/operators';


@Injectable()
export class AppService {

    public static readonly postHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    constructor(protected http: HttpClient) {}

    getBuildNumber() {
        return this.http.get<number>('api/appv');
    }

}
