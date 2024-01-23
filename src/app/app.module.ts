import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatRadioModule } from '@angular/material/radio';

import { AppComponent } from './app.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule  } from '@angular/material/button-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { NavService } from './nav.service';
import { MainComponent } from './main.component';
import { NavComponent } from './nav/nav.component';
import { AppRoutingModule } from './app-routing.module';
import { MenuListItemComponent } from './nav/menu-list-item.component';
import { CommonModule } from '@angular/common';
import { a201815Component } from './visualization/2018/15/a201815';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    MenuListItemComponent,
    NavComponent,
    a201815Component
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatRadioModule,
    MatIconModule,
    MatCheckboxModule,
    AppRoutingModule,
  ],
  providers: [NavService],
  bootstrap: [AppComponent]
})
export class AppModule { }
