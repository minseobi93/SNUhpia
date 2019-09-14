import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import dataJson from 'src/assets/data.json';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private data = dataJson.project;
  private projectList = new Array;

  private _projectName = new BehaviorSubject<string>('');
  projectName = this._projectName.asObservable();
  private _subjectList = new BehaviorSubject<string []>([]);
  subjectList = this._subjectList.asObservable();
  private _variableList = new BehaviorSubject<string []>([]);
  variableList = this._variableList.asObservable();
  private _variableDictionary = new BehaviorSubject<Object>({});
  variableDictionary = this._variableDictionary.asObservable();
  private _subjectDictionary = new BehaviorSubject<Object>({});
  subjectDictionary = this._subjectDictionary.asObservable();
  private _pathArray = new BehaviorSubject<any []>([]);
  pathArray = this._pathArray.asObservable();

  private localSubjectDictionary = {};
  private localVariableDictionary = {};
  private imgPath: string;

  constructor() {
    this.loadData()
  }

  private loadData() {
    for (let i = 0; i < this.data.length; i++) {
      this.projectList.push(this.data[i].projectName);
    }
  }

  getProjectList() {
    return this.projectList;
  }

  //Receive Project update request
  //Modify projectName and reinitialize dictionaries
  updateProject(name: string) {
    this._projectName.next(name);
    //namepath, subjectlist, variablelist, variabledic, subjectdic
    this.initializeData();
  }

  //Initialize VariableDictionary and SubjectDictionary
  //Key: (Variable/Subject)Name, Value: False
  private initializeData() {
    let tempSubjectList: string [];
    let tempVariableList: string [];
    let tempSubjectDictionary: Object = {};
    let tempVariableDictionary: Object = {};
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].projectName == this._projectName.value) {
        tempSubjectList = this.data[i].subjectList;
        for (let j = 0; j < this.data[i].subjectList.length; j++) {
          tempSubjectDictionary[this.data[i].subjectList[j]] = false;
        }
        tempVariableList = this.data[i].variableList;
        for (let j = 0; j < this.data[i].variableList.length; j++) {
          tempVariableDictionary[this.data[i].variableList[j]] = false;
        }
        this.imgPath = this.data[i].pathName;
        break;
      }
    }
    this._subjectList.next(tempSubjectList);
    this._variableList.next(tempVariableList);
    this._variableDictionary.next(tempVariableDictionary);
    this._subjectDictionary.next(tempSubjectDictionary);
  }

  updateSubjectDictionary(subject: string) {
    this.localSubjectDictionary = this._subjectDictionary.getValue();
    this.localSubjectDictionary[subject] = !this.localSubjectDictionary[subject];
    this._subjectDictionary.next(this.localSubjectDictionary);
  }

  updateSubjectDictionaryAll(subjectSelectAll: boolean) {
    this.localSubjectDictionary = this._subjectDictionary.getValue();
    for (let subject in this.localSubjectDictionary) {
      this.localSubjectDictionary[subject] = !subjectSelectAll;
    }
    this._subjectDictionary.next(this.localSubjectDictionary);
  }

  updateVariableDictionary(variable: string) {
    this.localVariableDictionary = this._variableDictionary.getValue();
    this.localVariableDictionary[variable] = !this.localVariableDictionary[variable];
    this._variableDictionary.next(this.localVariableDictionary);
    console.log(this._variableDictionary.getValue())
  }

  updateVariableDictionaryAll(variableSelectAll: boolean) {
    this.localVariableDictionary = this._variableDictionary.getValue();
    for (let variable in this.localVariableDictionary) {
      this.localVariableDictionary[variable] = !variableSelectAll;
    }
    this._variableDictionary.next(this.localVariableDictionary);
    console.log(this._variableDictionary.getValue())
  }

  constructImgPathArray() {
    let path2DArray = new Array;
    for (let subject in this.localSubjectDictionary) {
      if (this.localSubjectDictionary[subject]) {
        let pathArray: string [] = [];
        for (let variable in this.localVariableDictionary) {
          if (this.localVariableDictionary[variable]) {
            let newPath: string = this.imgPath.replace(/subjectName/gi, subject).replace(/variableName/gi, variable);
            pathArray.push(newPath)
          }
        }
        path2DArray.push(pathArray);
      }
    }
    this._pathArray.next(path2DArray);
    console.log(this._pathArray.getValue());
  }
}
