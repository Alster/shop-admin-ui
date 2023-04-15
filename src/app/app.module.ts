import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { InputTextModule } from 'primeng/inputtext'
import { InputNumberModule } from 'primeng/inputnumber';
import { AppComponent } from './app.component';
import { SideMenuComponent } from './side-menu/side-menu.component';
import { HeaderComponent } from './header/header.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { CreateProductComponent } from './create-product/create-product.component';
import { EditProductComponent } from './edit-product/edit-product.component';
import {FormsModule} from "@angular/forms";
import {CardModule} from "primeng/card";
import { ProductsListComponent } from './products-list/products-list.component';
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {TagModule} from "primeng/tag";

@NgModule({
  declarations: [
    AppComponent,
    SideMenuComponent,
    HeaderComponent,
    CreateProductComponent,
    EditProductComponent,
    ProductsListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PanelMenuModule,
    TieredMenuModule,
    BrowserAnimationsModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
