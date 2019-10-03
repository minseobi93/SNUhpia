import { Component, OnInit, OnDestroy, Inject} from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Subscription } from 'rxjs';
import { NoteService } from 'src/app/note.service';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit, OnDestroy {
  private noteList: Note[];
  private noteSubs: Subscription;
  private temp_note = new Note('', '');
  private receiveData: boolean;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) private data: Note, private _bottomSheetRef: MatBottomSheetRef<NotesComponent>, private noteService: NoteService) {}

  ngOnInit() {
    this.noteSubs = this.noteService.getNotes().subscribe(
      res => {
        this.noteList = res;
      },
      console.error
    );
    // Receive existing note data
    if (this.data != null) {
      this.receiveData = true;
    }
    else {
      this.receiveData = false;
    }
  }
  
  ngOnDestroy() {
    this.noteSubs.unsubscribe();
  }
  
  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  // Add new note to the db
  saveNote() {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
    this.updateNoteList();
  }

  updateNoteList() {

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