import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Papa } from 'ngx-papaparse';
import dataJson from 'src/assets/data.json';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private data = dataJson.project;
  private projectList = new Array;
  
  private _projectName = new BehaviorSubject<string>('');
  projectName = this._projectName.asObservable();
  
  //Boolean value for subjectSelectAll button
  private _subjectSelectAll = new BehaviorSubject<boolean>(false);
  subjectSelectAll = this._subjectSelectAll.asObservable();
  
  //Boolean value for variableSelectAll button
  private _variableSelectAll = new BehaviorSubject<boolean>(false);
  variableSelectAll = this._variableSelectAll.asObservable();
  
  //Array of subject names
  private _subjectList = new BehaviorSubject<string []>([]);
  subjectList = this._subjectList.asObservable();

  //Array of variable names
  private _variableList = new BehaviorSubject<string []>([]);
  variableList = this._variableList.asObservable();
  
  //Map to store variable names and activeness: Key(variableName), Value(boolean)
  private _variableMap = new BehaviorSubject<Object>({});
  variableMap = this._variableMap.asObservable();

  //Map to store subject names and activeness: Key(subjectName), Value(boolean)
  private _subjectMap = new BehaviorSubject<Object>({});
  subjectMap = this._subjectMap.asObservable();
  
  //Array of image path
  private _pathArray = new BehaviorSubject<any []>([]);
  pathArray = this._pathArray.asObservable(); 
  
  //Total count of active subjects
  private _activeSubjectCount = new BehaviorSubject<number>(0);
  activeSubjectCount = this._activeSubjectCount.asObservable();

  //Streaming csv info( Key: SubjectName, Value: Object { Key: csvHeader, Value: csvValue} ) from CSVs
  private _csvDataMap = new BehaviorSubject<Object>({});
  csvDataMap = this._csvDataMap.asObservable();

  //csvMask info( Array of csvHeaders )
  private _csvDataList = new BehaviorSubject<Array<string>>([]);
  csvDataList = this._csvDataList.asObservable();

  //Update default csv entries to present (ex: [Proj, Subj, ... ])
  public _activeCSVEntry = new BehaviorSubject<Array<string>>([]);
  activeCSVEntry = this._activeCSVEntry.asObservable();


  private activeVariableCount: number = 0;
  private totalSubjectNum: number;
  private totalVariableNum: number;
  private localSubjectMap = {};
  private localVariableMap = {};
  private localCSVMap: Object = {};
  private localCSVList: Array<string> = [];
  private imgPath: string;
  private csvInfo: Object = {};
  private csvPathMap: Object = {};

  constructor(private http: HttpClient, private papa: Papa) {
    this.loadData()
  }

  private loadData() {
    for (let i = 0; i < this.data.length; i++) {
      this.projectList.push(this.data[i].projectName);
    }
  }

  public getProjectList() {
    return this.projectList;
  }

  //Receive Project update request
  //Modify projectName and reinitialize Maps
  public updateProject(name: string) {
    this._projectName.next(name);
    //namepath, subjectlist, variablelist, variabledic, subjectdic
    this.initializeData();
  }

  //Initialize VariableDictionary and SubjectDictionary
  //Key: (Variable/Subject)Name, Value: False
  private initializeData() {
    let tempSubjectList: string [];
    let tempVariableList: string [];
    let tempSubjectMap: Object = {};
    let tempVariableMap: Object = {};
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].projectName == this._projectName.value) {
        tempSubjectList = this.data[i].subjectList;
        this.totalSubjectNum = this.data[i].subjectList.length;
        for (let j = 0; j < this.totalSubjectNum; j++) {
          tempSubjectMap[this.data[i].subjectList[j]] = false;
        }
        tempVariableList = this.data[i].variableList;
        this.totalVariableNum = this.data[i].variableList.length
        for (let j = 0; j < this.totalVariableNum; j++) {
          tempVariableMap[this.data[i].variableList[j]] = false;
        }
        this.imgPath = this.data[i].pathName;
        this.csvInfo = this.data[i].csv;
        break;
      }
    }
    this._subjectList.next(tempSubjectList);
    this._variableList.next(tempVariableList);
    this._variableMap.next(tempVariableMap);
    this._subjectMap.next(tempSubjectMap);
    this._activeSubjectCount.next(0);
    this.updateActiveCSVEntry();
    this.updateSubjectMapAll(false);
    this.updateVariableSelectAll(false);
    this.constructImgPathArray();
    this.constructCSVPathArray();
    this.constructCSVHeaderList(tempSubjectList);
  }

  public getSubjectSelectAll() {
    return this._subjectSelectAll.getValue();
  }

  public updateSubjectSelectAll(bool: boolean) {
    if (bool) {
      this._activeSubjectCount.next(this.totalSubjectNum);
    }
    else {
      this._activeSubjectCount.next(0);
    }
    this._subjectSelectAll.next(bool);
    this.updateSubjectMapAll(this.getSubjectSelectAll());
  }

  public getVariableSelectAll() {
    return this._variableSelectAll.getValue()
  }

  public updateVariableSelectAll(bool: boolean) {
    if (bool) {
      this.activeVariableCount = this.totalVariableNum;
    }
    else {
      this.activeVariableCount = 0;
    }
    this._variableSelectAll.next(bool);
    this.updateVariableMapAll(this.getVariableSelectAll());
  }

  public updateSubjectMap(subject: string) {
    this.localSubjectMap = this._subjectMap.getValue();
    if (this.localSubjectMap[subject]) {
      //Update '_activeSubjectCount -= 1'
      this._activeSubjectCount.next(this._activeSubjectCount.getValue() - 1);
          //Destroy CSV info of 'subject'
          //this.localCSVMap[subject] = [];
          //this._csvLabel.next(this.localCSVMap);
      //Update 'subjectSelectAll'
      if (this._activeSubjectCount.getValue() == 0) {
        this.updateSubjectSelectAll(false);
      }
      //Otherwise update 'localSubjectMap'
      else {
        this.localSubjectMap[subject] = !this.localSubjectMap[subject];
        this._subjectMap.next(this.localSubjectMap);
      }
    }
    else {
      //Update '_activeSubjectCount += 1'
      this._activeSubjectCount.next(this._activeSubjectCount.getValue() + 1);
      //Construct CSV info of 'subject'
      this.loadSubjectCSV(subject);
      //Update 'subjectSelectAll'
      if (this._activeSubjectCount.getValue() == this.totalSubjectNum) {
        this.updateSubjectSelectAll(true)
      }
      //Otherwise update 'localSubjectMap'
      else {
        this.localSubjectMap[subject] = !this.localSubjectMap[subject];
        this._subjectMap.next(this.localSubjectMap);
      }
    }
    this.constructImgPathArray()
  }

  public updateSubjectMapAll(subjectSelectAll: boolean) {
    this.localSubjectMap = this._subjectMap.getValue();
    for (let subject in this.localSubjectMap) {
      this.localSubjectMap[subject] = subjectSelectAll;
      if (subjectSelectAll) {
        this.loadSubjectCSV(subject);
      }
    }
    this._subjectMap.next(this.localSubjectMap);
    this.constructImgPathArray()
  }

  public updateVariableMap(variable: string) {
    this.localVariableMap = this._variableMap.getValue();
    if (this.localVariableMap[variable]) {
      this.activeVariableCount -= 1;
      if (this.activeVariableCount == 0) {
        this.updateVariableSelectAll(false);
      }
      else {
        this.localVariableMap[variable] = !this.localVariableMap[variable];
        this._variableMap.next(this.localVariableMap);
      }
    }
    else {
      this.activeVariableCount += 1;
      if (this.activeVariableCount == this.totalVariableNum) {
        this.updateVariableSelectAll(true);
      }
      else {
        this.localVariableMap[variable] = !this.localVariableMap[variable];
        this._variableMap.next(this.localVariableMap);
      }
    }
    this.constructImgPathArray()
  }

  public updateVariableMapAll(variableSelectAll: boolean) {
    this.localVariableMap = this._variableMap.getValue();
    for (let variable in this.localVariableMap) {
      this.localVariableMap[variable] = variableSelectAll;
    }
    this._variableMap.next(this.localVariableMap);
    this.constructImgPathArray()
  }

  private constructImgPathArray() {
    let path2DArray = new Array;
    for (let subject in this.localSubjectMap) {
      if (this.localSubjectMap[subject]) {
        let pathArray: Array<string> = [];
        for (let variable in this.localVariableMap) {
          if (this.localVariableMap[variable]) {
            let newPath: string = this.imgPath.replace(/subjectName/gi, subject).replace(/variableName/gi, variable);
            pathArray.push(newPath)
          }
        }
        path2DArray.push(pathArray);
      }
    }
    this._pathArray.next(path2DArray);
  }

  public getSubjectList() {
    return this._subjectList.getValue()
  }

  public getVariableList() {
    return this._variableList.getValue()
  }

  private constructCSVPathArray() {
    this.localCSVMap = {};
    let subjectList: Array<string> = this.getSubjectList();
    let csvPath: string = this.csvInfo['pathName'];
    let folderList: Array<string> = this.csvInfo['folderList'];
    let fileList: Array<Array<string>> = this.csvInfo['fileList'];

    for (let subject of subjectList) {
      let subjectCSVPathArray: Array<Array<string>> = [];
      for (const [folderIndex, folder] of folderList.entries()) {
        let folderPathArray: Array<string> = [];
        for (let file of fileList[folderIndex]) {
          let newPath: string = csvPath.replace(/subjectName/gi, subject).replace(/directoryName/gi, folder).replace(/fileName/gi, file);
          folderPathArray.push(newPath);
        }
        subjectCSVPathArray.push(folderPathArray);
      }
      this.csvPathMap[subject] = subjectCSVPathArray;
      this.localCSVMap[subject] = [];
    }
    //Initialize _csvLabel
    this._csvDataMap.next(this.localCSVMap);
    //Clear csvInfo after using it
    this.csvInfo = {};
  }

  /*
  //Bring CSV info of 'subject'
  private loadSubjectCSV(subject: string) {
    let singleSubjectCSVData: Array<Array<string>> = [];
    for (let folder of this.csvPathMap[subject]) {
      for (let filePath of folder) {
        this.http.get(filePath, {
          responseType: 'text'
        }).subscribe(
          data => this.extractCSVData(data, singleSubjectCSVData),
          err => console.log('error: ', err)
        )
      }
    }
    this.localCSVMap[subject] = singleSubjectCSVData;
    this._csvLabel.next(this.localCSVMap);
  }

  private extractCSVData(res, singleSubjectCSVData: Array<Array<string>>) {
    let data = res || '';
    this.papa.parse(data, {
      complete: parsedData => {
        let tempSingleCSVFileDataArray = [];
        for (let dataIndex in parsedData.data[0]) {
          tempSingleCSVFileDataArray.push([parsedData.data[0][dataIndex], parsedData.data[1][dataIndex], false]);
        }
        singleSubjectCSVData.push(...tempSingleCSVFileDataArray)
      }
    })
  }
  */
  //Bring CSV info of 'subject'
  private loadSubjectCSV(subject: string) {
    let singleSubjectCSVData: Object = {};
    for (let folder of this.csvPathMap[subject]) {
      for (let filePath of folder) {
        this.http.get(filePath, {
          responseType: 'text'
        }).subscribe(
          data => this.extractCSVData(data, singleSubjectCSVData),
          err => console.log('error: ', err)
        )
      }
    }
    this.localCSVMap[subject] = singleSubjectCSVData;
    console.log(this.localCSVMap);
    this._csvDataMap.next(this.localCSVMap);
  }

  private extractCSVData(res, singleSubjectCSVData: Object) {
    let data = res || '';
    this.papa.parse(data, {
      complete: parsedData => {
        for (let dataIndex in parsedData.data[0]) {
          singleSubjectCSVData[parsedData.data[0][dataIndex]] = parsedData.data[1][dataIndex];
        }
      }
    })
  }

  private constructCSVHeaderList(subjectList: Array<string>) {
    if (subjectList.length) {
      for (let folder of this.csvPathMap[subjectList[0]]) {
        for (let filePath of folder) {
          this.http.get(filePath, {
            responseType: 'text'
          }).subscribe(
            data => this.extractCSVMaskData(data),
            err => console.log('error: ', err)
          )
        }
      }
    }
    console.log(this.localCSVList);
    this._csvDataList.next(this.localCSVList);
  }

  private extractCSVMaskData(res) {
    let data = res || '';
    this.papa.parse(data, {
      complete: parsedData => {
        for (let dataIndex in parsedData.data[0]) {
          this.localCSVList.push(parsedData.data[0][dataIndex])
        }
      }
    })
  }

  private updateActiveCSVEntry() {
    if (this._projectName.value == 'CBNCT') {
      this._activeCSVEntry.next(["Proj", "Subj", "Age", "Sex01", "Height", "FEV1ppPreBD", "FEV1FVCpreBD"]);
    }
  }

  public getActiveCSVEntry() : Array<string> {
    return this._activeCSVEntry.value;
  }

  public setActiveCSVEntry(entry: Array<string>) {
    this._activeCSVEntry.next(entry);
  }
}
