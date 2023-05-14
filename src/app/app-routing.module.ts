import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateProductComponent } from './create-product/create-product.component';
import { EditProductComponent } from './edit-product/edit-product.component';
import { ProductsListComponent } from './products-list/products-list.component';
import { EditCategoriesComponent } from './edit-categories/edit-categories.component';

const routes: Routes = [
  { path: 'create-product', component: CreateProductComponent },
  { path: 'edit-product', component: EditProductComponent },
  { path: 'list-product', component: ProductsListComponent },
  { path: 'edit-categories', component: EditCategoriesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
