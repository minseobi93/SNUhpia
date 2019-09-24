import { ChangeDetectionStrategy, Component, OnInit, Inject } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { Observable } from 'rxjs';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/overlay';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface Section {
  name: string;
  updated: Date;
}

export interface DialogData {
  csvDataMap: Object;
  csvDataList: Array<string>;
}

@Component({
  selector: 'sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent implements OnInit {
  notes: Section[] = [
    {
      name: 'Vacation Itinerary',
      updated: new Date('2/20/16'),
    },
    {
      name: 'Kitchen Remodel',
      updated: new Date('1/18/16'),
    }
  ];
  subjectSelectAll$ : Observable<boolean>;
  variableSelectAll$: Observable<boolean>;
  subjectList$: Observable<string []>;
  variableList$: Observable<string []>;
  pathArray$: Observable<any []>;
  activeSubjectCount$: Observable<number>;
  activeCSVEntry$: Observable<Array<string>>;
  
  opened: boolean = true;
  subjectMap: Object = {};
  variableMap: Object = {};
  csvDataMap: Object = {};
  csvDataList: Array<string> = [];

  constructor(private data: DataService, private scrollDispatcher: ScrollDispatcher, private dialog: MatDialog) {}

  ngOnInit() {
    this.activeSubjectCount$ = this.data.activeSubjectCount;
    this.subjectSelectAll$ = this.data.subjectSelectAll;
    this.variableSelectAll$ = this.data.variableSelectAll;
    this.subjectList$ = this.data.subjectList;
    this.variableList$ = this.data.variableList;
    this.data.subjectMap.subscribe(
      value => { 
        this.subjectMap = value;
        this.opened = true;
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
}

@Component({
  selector: 'sidenav-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./sidenav.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent implements OnInit{
  private entryMap: Object = {};
  private activeCSVEntry: Array<string>;

  constructor(public dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, private dataservice: DataService) {}

  ngOnInit() {
    this.dataservice.activeCSVEntry.subscribe(
      value => { 
        this.activeCSVEntry = value;
        for (let entry of this.activeCSVEntry) {
          this.entryMap[entry] = true;
        }
        console.log(this.activeCSVEntry);
      }
    );
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