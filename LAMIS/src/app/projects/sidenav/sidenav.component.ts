import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/data.service';
import { Observable } from 'rxjs';

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
  subjectSelectAll: boolean = false;
  variableSelectAll: boolean = false;
  subjectList$: Observable<string []>;
  variableList$: Observable<string []>;
  pathArray$: Observable<any []>;
  subjectDictionary: {};
  variableDictionary: {};

  constructor(private data: DataService) { }

  ngOnInit() {
    this.subjectList$ = this.data.subjectList;
    this.variableList$ = this.data.variableList;
    this.data.subjectDictionary.subscribe(
      value => { 
        this.subjectDictionary = value;
        this.opened = true;
        this.subjectSelectAll = false;
        this.variableSelectAll = false;
      }
    );
    this.data.variableDictionary.subscribe(
      value => this.variableDictionary = value
    )
    this.pathArray$ = this.data.pathArray;
  }

  onSubjectClick(subject: string) {
    this.data.updateSubjectDictionary(subject);
  }

  onSubjectClickAll() {
    this.data.updateSubjectDictionaryAll(this.subjectSelectAll);
    this.subjectSelectAll = !this.subjectSelectAll;
  }
  
  onVariableClick(variable: string) {
    this.data.updateVariableDictionary(variable);
    this.data.constructImgPathArray();
  }

  onVariableClickAll() {
    this.data.updateVariableDictionaryAll(this.variableSelectAll);
    this.data.constructImgPathArray();
    this.variableSelectAll = !this.variableSelectAll;
  }
}
