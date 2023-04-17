import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { v4 as uuid } from 'uuid';
import {ProductAdminDto, ProductDto, ProductItemDto} from '@shop/shared/dto/product.dto';
import {fetchAPI} from "../helpers/fetchAPI";
import {AttributeType} from "../constants/product";
import {AttributeDto} from '@shop/shared/dto/attribute.dto';

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
  product?: ProductAdminDto;
  availableAttributes: AttributeDto[] = [];
  attributes: MultiselectEntry[] = [];
  selectedAttributes: MultiselectEntry[] = [];
  selectedCharacteristics: MultiselectEntry[] = [];

  attributeTypeEnum = AttributeType;
  currentLanguage = 'ua';
  languages = ['en', 'ua'];

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
        const json: ProductAdminDto = await res.json();
        this.product = json;
        console.log(this.product);
      }

      await Promise.all([fetchProduct(), this.fetchAttributes()]);

      if (!this.product) {
        return;
      }

      this.selectedAttributes = this.attributes.filter((attribute) => {
        return (this.product?.attrs[attribute.key] && !this.product?.characteristics[attribute.key]) ?? false;
      });

      this.selectedCharacteristics = this.attributes.filter((attribute) => {
        return this.product?.characteristics[attribute.key] ?? false;
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
    const json: ProductAdminDto = await res.json();
    this.product = json;
    console.log(json);
    this.isLoading = false;
  }

  addItem() {
    this.product?.items.push({
      sku: uuid(),
      attributes: Object.fromEntries(this.selectedAttributes.map((attribute) => [attribute.code, []])),
    });
  }

  removeItem(item: ProductItemDto) {
    if (!this.product) {
      return;
    }
    this.product.items = this.product.items.filter((i) => i.sku !== item.sku);
  }

  cloneItem(item: ProductItemDto) {
    if (!this.product) {
      return;
    }
    this.product.items.push({
      ...item,
      sku: uuid(),
    });
  }

  onSelectedAttributesChange() {
    if (!this.product) {
      return;
    }
    this.product.items.forEach((item) => {
      this.selectedAttributes.forEach((attribute) => {
        item.attributes[attribute.key] = item.attributes[attribute.key] ?? [];
      });
      Object.keys(item.attributes).forEach((key) => {
        if (!this.selectedAttributes.find((attribute) => attribute.key === key)) {
          delete item.attributes[key];
        }
      });
    });
  }

  changeLanguage(lang: string) {
    this.currentLanguage = lang;
  }

  getAttributeValues(attribute: AttributeDto): { name: string, code: string }[] {
    return attribute.values.map((value) => ({
      name: value.title,
      code: value.key,
    }));
  }

  onSelectedCharacteristicsChange() {
    if (!this.product) {
      return;
    }
    for (let attribute of this.selectedCharacteristics) {
      this.product.characteristics[attribute.key] = this.product.characteristics[attribute.key] ?? [];
    }
    for (let key of Object.keys(this.product.characteristics)) {
      if (!this.selectedCharacteristics.find((attribute) => attribute.key === key)) {
        delete this.product.characteristics[key];
      }
    }
  }

  getAttributesForItems() {
    return this.attributes.filter((attribute) => {
      return !this.selectedCharacteristics.find((attr) => attr.key === attribute.key);
    });
  }

  getAttributesForCharacteristics() {
    return this.attributes.filter((attribute) => {
      return !this.selectedAttributes.find((attr) => attr.key === attribute.key);
    });
  }

  onItemBooleanChange(item: ProductItemDto, attributeKey: string, valueKey: string) {
    if (!this.product) {
      return;
    }
    item.attributes[attributeKey][0] = valueKey;
  }

  onCharacteristicBooleanChange(attributeKey: string, valueKey: string) {
    if (!this.product) {
      return;
    }
    this.product.characteristics[attributeKey][0] = valueKey;
  }
}
