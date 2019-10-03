import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';

import { AuthService } from './auth.service';
import { DataService } from './data.service';
import { NoteService } from './note.service';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProjectsComponent } from './projects/projects.component';
import { HomeComponent } from './home/home.component';
import { SidenavComponent, DialogComponent } from './projects/sidenav/sidenav.component';
import { NotesComponent } from './projects/sidenav/notes/notes.component';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatTreeModule } from '@angular/material/tree';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgScrollbarModule } from 'ngx-scrollbar';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ProjectsComponent,
    HomeComponent,
    SidenavComponent,
    DialogComponent,
    NotesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonToggleModule,
    NgScrollbarModule,
    ScrollingModule,
    MatExpansionModule,
    MatDialogModule,
    MatCheckboxModule,
    MatSliderModule,
    MatTreeModule,
    MatBottomSheetModule,
    MatFormFieldModule,
    MatInputModule
  ],
  entryComponents: [
    DialogComponent,
    NotesComponent
  ],
  providers: [
    AuthService,
    DataService,
    NoteService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
