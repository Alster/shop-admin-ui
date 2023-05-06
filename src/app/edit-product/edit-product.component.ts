import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import { v4 as uuid } from 'uuid';
import {fetchAPI} from "../helpers/fetchAPI";
import {AttributeDto} from "../../../shopshared/dto/attribute.dto";
import {ATTRIBUTE_TYPE} from "../../../shopshared/constants/product";
import {ProductAdminDto, ProductItemDto} from "../../../shopshared/dto/product.dto";
import {LanguageEnum} from "../../../shopshared/constants/localization";
import {CategoriesNodeDto} from "../../../shopshared/dto/categories-tree.dto";
import {Category, fetchCategoryTree, mapNode} from "../helpers/categoriesTreHelpers";
import {TreeNode} from "primeng/api";

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

  attributeTypeEnum = ATTRIBUTE_TYPE;
  currentLanguage: LanguageEnum = LanguageEnum.UA;
  languages = Object.values(LanguageEnum);

  isLoading: boolean = false;

  tree: Category[] = [];
  files: TreeNode[] = [];

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
        console.log("Product:", this.product);
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
    await this.fetchCategoryTree();
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
    console.log("Product:", json);
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
      ...JSON.parse(JSON.stringify(item)),
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
    this.currentLanguage = lang as LanguageEnum;
    this.files.forEach((file: TreeNode) => {
      this.changeLabel(file);
    });
  }

  changeLabel(node: TreeNode) {
    node.label = node.data.title[this.currentLanguage];
    if (node.children) {
      node.children.forEach((child: TreeNode) => {
        this.changeLabel(child);
      });
    }
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

  async fetchCategoryTree() {
    const json: CategoriesNodeDto[] = await fetchCategoryTree();
    console.log("Category tree:", json);
    this.tree = json;

    // Map tree to files
    this.tree.forEach((node) => {
      this.files.push(mapNode(node, this.currentLanguage));
    });
  }

  findNodeById(id: string): TreeNode | undefined {
    for (let file of this.files) {
      const node = this._findNodeById(id, file);
      if (node) {
        return node;
      }
    }
    return undefined;
  }

  _findNodeById(id: string, node: TreeNode): TreeNode | undefined {
    if (node.data.id === id) {
      return node;
    }
    if (node.children) {
      for (let child of node.children) {
        const res = this._findNodeById(id, child);
        if (res) {
          return res;
        }
      }
    }
    return undefined;
  }
}
