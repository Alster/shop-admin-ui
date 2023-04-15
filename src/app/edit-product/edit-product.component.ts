import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { ProductDto } from '@shop/shared/dto/product.dto';
import {fetchAPI} from "../helpers/fetchAPI";

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {
  product?: ProductDto;

  isLoading: boolean = false;

  constructor(private route: ActivatedRoute) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const id = params['id'];
      const res = await fetchAPI(`product/get/${id}`, {
        method: 'GET',
      });
      const json: ProductDto = await res.json();
      this.product = json;
      console.log(json);
    });
  }

  async updateProduct() {
    this.isLoading = true;
    const res = await fetchAPI(`product/update/${this.product?.id}`, {
      method: 'POST',
      body: JSON.stringify(this.product),
    });
    if (!res.ok) {
      console.error('Error updating product');
      this.isLoading = false;
      return;
    }
    const json: ProductDto = await res.json();
    this.product = json;
    console.log(json);
    this.isLoading = false;
  }
}
