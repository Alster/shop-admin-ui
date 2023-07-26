import { NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ImageCropperModule } from 'ngx-image-cropper';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DragDropModule } from 'primeng/dragdrop';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
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
import { CreateProductComponent } from './create-product/createProduct.component';
import { EditCategoriesComponent } from './edit-categories/editCategories.component';
import { EditProductComponent } from './edit-product/editProduct.component';
import { HeaderComponent } from './header/header.component';
import { OrderViewComponent } from './order-view/orderView.component';
import { OrdersListComponent } from './orders-list/ordersList.component';
import { ProductsListComponent } from './products-list/productsList.component';
import { SideMenuComponent } from './side-menu/sideMenu.component';

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
		NgOptimizedImage,
		ImageCropperModule,
	],
	providers: [ConfirmationService, MessageService],
	bootstrap: [AppComponent],
})
export class AppModule {}
