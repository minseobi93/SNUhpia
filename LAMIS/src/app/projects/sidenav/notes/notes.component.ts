import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Subscription } from 'rxjs';
import { NoteService } from 'src/app/note.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit, OnDestroy {
  noteList: Note[];
  noteSubs: Subscription;

  constructor(private _bottomSheetRef: MatBottomSheetRef<NotesComponent>, private noteService: NoteService) {}

  ngOnInit() {
    this.noteSubs = this.noteService.getNotes().subscribe(
      res => {
        this.noteList = res;
      },
      console.error
    );
  }
  
  ngOnDestroy() {
    this.noteSubs.unsubscribe();
  }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}

export class Note {
  constructor(
    public subject: string,
    public description: string,
    public _id?: number,
    public updatedAt?: Date,
    public createdAt?: Date,
    public lastUpdatedBy?: string,
  ) { }
}