import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DragDropModule } from 'primeng/dragdrop';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToastModule } from 'primeng/toast';
import { TreeModule } from 'primeng/tree';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CreateProductComponent } from './create-product/create-product.component';
import { EditCategoriesComponent } from './edit-categories/edit-categories.component';
import { EditProductComponent } from './edit-product/edit-product.component';
import { HeaderComponent } from './header/header.component';
import { OrderViewComponent } from './order-view/order-view.component';
import { OrdersListComponent } from './orders-list/orders-list.component';
import { ProductsListComponent } from './products-list/products-list.component';
import { SideMenuComponent } from './side-menu/side-menu.component';

@NgModule({
	declarations: [
		AppComponent,
		SideMenuComponent,
		HeaderComponent,
		CreateProductComponent,
		EditProductComponent,
		ProductsListComponent,
		EditCategoriesComponent,
		OrdersListComponent,
		OrderViewComponent,
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
		InputSwitchModule,
		KeyFilterModule,
		MultiSelectModule,
		DropdownModule,
		ConfirmDialogModule,
		ToastModule,
		CheckboxModule,
		TreeModule,
		DragDropModule,
		AccordionModule,
	],
	providers: [ConfirmationService, MessageService],
	bootstrap: [AppComponent],
})
export class AppModule {}
