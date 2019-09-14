import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projectName$: Observable<string>
  
  constructor(private data: DataService) { }
  
  ngOnInit() {
    this.projectName$ = this.data.projectName;
  }
}
