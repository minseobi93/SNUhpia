import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { Observable } from 'rxjs';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/overlay';

export interface Section {
  name: string;
  updated: Date;
}

@Component({
  selector: 'sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
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
  opened: boolean = true;
  subjectSelectAll$ : Observable<boolean>;
  variableSelectAll$: Observable<boolean>;
  subjectList$: Observable<string []>;
  variableList$: Observable<string []>;
  pathArray$: Observable<any []>;
  subjectDictionary: {};
  variableDictionary: {};

  constructor(private data: DataService, private scrollDispatcher: ScrollDispatcher) { }

  ngOnInit() {
    this.subjectSelectAll$ = this.data.subjectSelectAll;
    this.variableSelectAll$ = this.data.variableSelectAll;
    this.subjectList$ = this.data.subjectList;
    this.variableList$ = this.data.variableList;
    this.data.subjectDictionary.subscribe(
      value => { 
        this.subjectDictionary = value;
        this.opened = true;
      }
    );
    this.data.variableDictionary.subscribe(
      value => this.variableDictionary = value
    )
    this.pathArray$ = this.data.pathArray;

    this.scrollDispatcher.scrolled().subscribe((scrollable: CdkScrollable) => {
      const top = scrollable.measureScrollOffset('top');
      Array.from(this.scrollDispatcher.scrollContainers.keys()).filter(otherScrollable => otherScrollable && otherScrollable !== scrollable).forEach(otherScrollable => {
        if (otherScrollable.measureScrollOffset('top') !== top) {
          otherScrollable.scrollTo({top});
        }
      })
    })
  }

  onSubjectClick(subject: string) {
    this.data.updateSubjectDictionary(subject);
    this.data.constructImgPathArray();
  }

  onSubjectClickAll() {
    this.data.updateSubjectSelectAll(!this.data.getSubjectSelectAll());
    this.data.constructImgPathArray();
  }
  
  onVariableClick(variable: string) {
    this.data.updateVariableDictionary(variable);
    this.data.constructImgPathArray();
  }

  onVariableClickAll() {
    this.data.updateVariableSelectAll(!this.data.getVariableSelectAll());
    this.data.constructImgPathArray();
  }
}
