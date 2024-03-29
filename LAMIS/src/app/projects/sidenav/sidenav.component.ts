import { ChangeDetectionStrategy, Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { Observable, Subscription } from 'rxjs';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/overlay';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NotesComponent, Note } from './notes/notes.component';
import { NoteService } from 'src/app/note.service';

export interface DialogData {
  csvDataMap: Object;
  csvDataList: Object;
}

@Component({
  selector: 'sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent implements OnInit, OnDestroy {

  private subjectSelectAll$ : Observable<boolean>;
  private variableSelectAll$: Observable<boolean>;
  private subjectList$: Observable<string []>;
  private variableList$: Observable<string []>;
  private pathArray$: Observable<any []>;
  private activeSubjectCount$: Observable<number>;
  private activeCSVEntry$: Observable<Array<string>>;

  private subjectMap: Object = {};
  private variableMap: Object = {};
  private csvDataMap: Object = {};
  private csvDataList: Object = {};
  private sliderValue: number = 100;
  private noteList$: Observable<Note []>;
  private noteSubs: Subscription;

  constructor(private data: DataService, private scrollDispatcher: ScrollDispatcher, private dialog: MatDialog, private _bottomSheet: MatBottomSheet, private noteService: NoteService) {}

  ngOnInit() {
    this.noteList$ = this.noteService.noteList;
    this.noteService.getNotes();
    this.activeSubjectCount$ = this.data.activeSubjectCount;
    this.subjectSelectAll$ = this.data.subjectSelectAll;
    this.variableSelectAll$ = this.data.variableSelectAll;
    this.subjectList$ = this.data.subjectList;
    this.variableList$ = this.data.variableList;
    this.data.subjectMap.subscribe(
      value => { 
        this.subjectMap = value;
      }
    );
    this.data.variableMap.subscribe(
      value => this.variableMap = value
    )
    this.pathArray$ = this.data.pathArray;
    this.data.csvDataMap.subscribe(
      value => this.csvDataMap = value
    );
    this.data.csvDataList.subscribe(
      value => this.csvDataList = value
    );
    this.activeCSVEntry$ = this.data.activeCSVEntry;
    this.scrollDispatcher.scrolled().subscribe((scrollable: CdkScrollable) => {
      const top = scrollable.measureScrollOffset('top');
      Array.from(this.scrollDispatcher.scrollContainers.keys()).filter(otherScrollable => otherScrollable && otherScrollable !== scrollable).forEach(otherScrollable => {
        if (otherScrollable.measureScrollOffset('top') !== top) {
          otherScrollable.scrollTo({top});
        }
      })
    })
  }

  ngOnDestroy() {
    this.noteSubs.unsubscribe();
  }

  onSubjectClick(subject: string): void {
    this.data.updateSubjectMap(subject);
  }

  onSubjectClickAll(): void {
    this.data.updateSubjectSelectAll(!this.data.getSubjectSelectAll());
  }
  
  onVariableClick(variable: string): void {
    this.data.updateVariableMap(variable);
  }

  onVariableClickAll(): void {
    this.data.updateVariableSelectAll(!this.data.getVariableSelectAll());
  }

  // Open a dialog to access CSV data
  openDialog(): void {
    this.dialog.open(DialogComponent, {
      width: '25vw',
      height: '40vw',
      data: {
        csvData: this.csvDataMap,
        csvDataList: this.csvDataList
      }
    });
  }

  // Open a new note panel to compose a new note
  openNote(): void {
    this._bottomSheet.open(NotesComponent);
  }

  // Open saved notes when clicking them
  onNoteClick(note: Note) {
    this._bottomSheet.open(NotesComponent, { data: note });
  }
}

interface FileNode {
  name: string;
  children?: FileNode[];
}

@Component({
  selector: 'sidenav-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./sidenav.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent implements OnInit{
  private entryMap: Object = {};
  private fileList: Array<string>;
  private activeCSVEntry: Array<string>;
  private treeControl = new NestedTreeControl<FileNode>(node => node.children);
  private dataSource = new MatTreeNestedDataSource<FileNode>();
  private TREE_DATA: FileNode[] = [];

  constructor(public dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private dataservice: DataService) {}

  ngOnInit() {
    this.dataservice.activeCSVEntry.subscribe(
      value => { 
        this.activeCSVEntry = value;
        for (let entry of this.activeCSVEntry) {
          this.entryMap[entry] = true;
        }
      }
    );
    this.fileList = this.dataservice.csvfileList;
    this.constructTreeData();
    this.dataSource.data = this.TREE_DATA;
  }
  
  //Determine whether entry has child or not
  hasChild = (_: number, node: FileNode) => !!node.children && node.children.length > 0;

  //Construct Tree Data structure to use in dialog
  constructTreeData() {
    for (let file of this.fileList) {
      let tempFileNode: FileNode = {
        name: '',
        children: []
      }
      tempFileNode.name = file;
      for (let csvHeaders of this.data.csvDataList[file]) {
        let tempCSVHeadersNode: FileNode = {
          name: '',
          children: []
        }
        tempCSVHeadersNode.name = csvHeaders;
        tempFileNode.children.push(tempCSVHeadersNode);
      }
      this.TREE_DATA.push(tempFileNode);
    }
  }

  onUpdateClick(): void {
    this.dialogRef.close();
  }

  onEntryChecked(entry: string) {
    const index = this.dataservice.getActiveCSVEntry().indexOf(entry)
    //Entry does not present in the activeCSVEntry
    if (index == -1) {
      this.activeCSVEntry.push(entry);
      this.entryMap[entry] = true;
    }
    //Entry exists in the activeCSVEntry
    else {
      this.activeCSVEntry.splice(index, 1)
      this.entryMap[entry] = false;
    }
    this.dataservice.setActiveCSVEntry(this.activeCSVEntry);
  }
}