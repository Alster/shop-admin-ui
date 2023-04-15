import {Component, OnInit} from '@angular/core';
import {ProductListResponseDto} from "@shop/shared/dto/product-list.response.dto";
import {ProductDto} from "@shop/shared/dto/product.dto";
import {fetchAPI} from "../helpers/fetchAPI";

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  products: ProductDto[] = [];
  async ngOnInit() {
    // await this.fetchData();
  }

  getSeverityForActive(active: boolean): string {
    return active ? 'success' : 'warning';
  }

  getTitleForActive(active: boolean): string {
    return active ? 'active' : 'disabled';
  }

  async fetchData() {
    const response = await fetchAPI('product/list', {
      method: 'GET',
    });
    const json: ProductListResponseDto = await response.json();
    console.log(json);
    this.products = json.products;
  }

  async deleteProduct(id: string) {
    const response = await fetchAPI(`product/delete/${id}`, {
      method: 'POST',
    });
    if (!response.ok) {
      console.error('Error deleting product');
      return;
    }
    await this.fetchData();
  }
}
