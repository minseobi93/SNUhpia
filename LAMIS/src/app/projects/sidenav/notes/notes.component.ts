import { Component, OnInit, Inject} from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { NoteService } from 'src/app/note.service';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  private temp_note = new Note('', '');
  private receiveData: boolean;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) private data: Note, private _bottomSheetRef: MatBottomSheetRef<NotesComponent>, private noteService: NoteService) {}

  ngOnInit() {
    // Receive existing note data
    if (this.data != null) {
      this.receiveData = true;
    }
    else {
      this.receiveData = false;
    }
  }
  
  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  // Add a new note to the db
  saveNote() {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
    this.temp_note.mode = "add";
    this.noteService.updateNotes(this.temp_note).subscribe(
      () => this.noteService.getNotes()
    );
  }

  // Update a note content and push to the db
  updateNote() {

  }
}

export class Note {
  constructor(
    public subject: string,
    public description: string,
    public mode?: string,
    public _id?: number,
    public updatedAt?: Date,
    public createdAt?: Date,
    public lastUpdatedBy?: string,
  ) { }
}