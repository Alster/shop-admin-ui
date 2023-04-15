import { Component } from '@angular/core';
import {NavigationExtras, Router} from "@angular/router";
import {fetchAPI} from "../helpers/fetchAPI";

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent {
  name: string = "";
  price: number = 0;

  isLoading: boolean = false;

  constructor(private router: Router) {

  }

  async createProduct() {
    this.isLoading = true;
    const response = await fetchAPI('product/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.name,
        price: this.price,
      })
    });
    if (!response.ok) {
      console.error('Error creating product');
      this.isLoading = false;
      return;
    }
    const json = await response.json();

    let navigationExtras: NavigationExtras = {
      queryParams: { 'id': json.id }
    };

    await this.router.navigate(['/edit-product'], navigationExtras);
  }
}
