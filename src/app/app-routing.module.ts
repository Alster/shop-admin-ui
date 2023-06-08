import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateProductComponent } from './create-product/create-product.component';
import { EditProductComponent } from './edit-product/edit-product.component';
import { ProductsListComponent } from './products-list/products-list.component';
import { EditCategoriesComponent } from './edit-categories/edit-categories.component';
import { OrdersListComponent } from './orders-list/orders-list.component';
import { OrderViewComponent } from './order-view/order-view.component';

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
