import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreateProductComponent } from './create-product/createProduct.component';
import { EditCategoriesComponent } from './edit-categories/editCategories.component';
import { EditProductComponent } from './edit-product/editProduct.component';
import { OrderViewComponent } from './order-view/orderView.component';
import { OrdersListComponent } from './orders-list/ordersList.component';
import { ProductsListComponent } from './products-list/productsList.component';

const routes: Routes = [
	{ path: 'create-product', component: CreateProductComponent },
	{ path: 'edit-product', component: EditProductComponent },
	{ path: 'list-product', component: ProductsListComponent },
	{ path: 'edit-categories', component: EditCategoriesComponent },
	{ path: 'list-order', component: OrdersListComponent },
	{ path: 'view-order', component: OrderViewComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
