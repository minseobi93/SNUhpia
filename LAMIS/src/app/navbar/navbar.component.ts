import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isactive: boolean = false;
  projectList: string [];
  projectName$: Observable<string>;

  constructor(private auth: AuthService, private data: DataService) { }

  ngOnInit() {
    this.projectList = this.data.getProjectList();
    this.projectName$ = this.data.projectName;
  }

  login() {
    this.auth.login();
  }

  logout() {
    this.auth.logout();
  }

  updateProject(name: string) {
    this.data.updateProject(name);
  }
}
