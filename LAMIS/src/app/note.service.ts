import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Note } from './projects/sidenav/notes/notes.component';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(private http: HttpClient) { }

  private static _handleError(err: HttpErrorResponse | any) {
    return Observable.throw(err.message || 'Error: Unable to complete request.');
  }

  getNotes(): Observable<any> {
    return this.http
      .get(`http://localhost:5000/notes`)
      .pipe(
        catchError(NoteService._handleError)
      );
  }
  
}