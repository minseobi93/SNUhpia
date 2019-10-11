import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Note } from './projects/sidenav/notes/notes.component';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private _noteList = new BehaviorSubject<Note []>([]);
  noteList = this._noteList.asObservable();

  constructor(private http: HttpClient) { }

  private static _handleError(err: HttpErrorResponse | any) {
    return Observable.throw(err.message || 'Error: Unable to complete request.');
  }

  // Get noteList
  getNotes() {
    this.http.get<Note []>(`http://localhost:5000/notes`)
      .pipe(
        catchError(NoteService._handleError)
      ).subscribe(
        res => {
          this._noteList.next(res);
        }
      )
  }
  
  // Add, revise, and delete note
  updateNotes(note: Note) {
    console.log(note);
    this.http.post(`http://localhost:5000/notes`, note).pipe(
      catchError(NoteService._handleError)
    ).subscribe(
      () => this.getNotes()
    )
  }
}