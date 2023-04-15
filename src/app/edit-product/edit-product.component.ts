import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { v4 as uuid } from 'uuid';
import {ProductDto, ProductItemDto} from '@shop/shared/dto/product.dto';
import {fetchAPI} from "../helpers/fetchAPI";
import {AttributeDto} from "@shop/shared/dto/attribute.dto"
import {AttributeType} from "../constants/product";

interface MultiselectEntry extends AttributeDto {
  name: string,
  code: string,
}

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {
  product?: ProductDto;
  availableAttributes: AttributeDto[] = [];
  attributes: MultiselectEntry[] = [];
  selectedAttributes: MultiselectEntry[] = [];

  attributeTypeEnum = AttributeType;

  isLoading: boolean = false;

  constructor(private route: ActivatedRoute) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const id = params['id'];
      const fetchProduct = async () => {
        const res = await fetchAPI(`product/get/${id}`, {
          method: 'GET',
        });
        const json: ProductDto = await res.json();
        this.product = json;
        console.log(this.product);
      }

      await Promise.all([fetchProduct(), this.fetchAttributes()]);

      if (!this.product) {
        return;
      }

      this.selectedAttributes = this.attributes.filter((attribute) => {
        return this.product?.attrs[attribute.key] ?? false;
      });
    });
  }

  async fetchAttributes() {
    const res = await fetchAPI(`product/attribute/list`, {
      method: 'GET',
    });
    const json: AttributeDto[] = await res.json();
    this.availableAttributes = json;
    this.attributes = json.map((attribute) => {
      return {
        ...attribute,
        name: attribute.title,
        code: attribute.key,
      };
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

  addItem() {
    this.product?.items.push({
      _id: uuid(),
      attributes: Object.fromEntries(this.selectedAttributes.map((attribute) => [attribute.code, []])),
      quantity: 1,
    });
  }

  removeItem(item: ProductItemDto) {
    if (!this.product) {
      return;
    }
    this.product.items = this.product.items.filter((i) => i._id !== item._id);
  }

  onSelectedAttributesChange() {
    if (!this.product) {
      return;
    }
    this.product.items.forEach((item) => {
      this.availableAttributes.forEach((attribute) => {
        item.attributes[attribute.key] = item.attributes[attribute.key] ?? [];
      });
      Object.keys(item.attributes).forEach((key) => {
        if (!this.selectedAttributes.find((attribute) => attribute.key === key)) {
          delete item.attributes[key];
        }
      });
    });
  }
}
