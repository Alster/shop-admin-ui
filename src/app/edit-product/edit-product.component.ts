import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { v4 as uuid } from 'uuid';
import { fetchAPI } from '../helpers/fetchAPI';
import {
  Category,
  fetchCategoryTree,
  mapNode,
} from '../helpers/categoriesTreHelpers';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { AttributeDto } from '../../shop-shared/dto/product/attribute.dto';
import {
  ProductAdminDto,
  ProductItemDto,
} from '../../shop-shared/dto/product/product.dto';
import { LanguageEnum } from 'src/shop-shared/constants/localization';
import { ATTRIBUTE_TYPE } from '../../shop-shared/constants/product';
import { CategoriesNodeDto } from '../../shop-shared/dto/category/categories-tree.dto';
import {
  MoneyBig,
  moneyBigToSmall,
  moneySmallToBig,
} from '../../shop-shared/dto/primitiveTypes';

interface MultiselectEntry extends AttributeDto {
  name: string;
  code: string;
}

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss'],
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

  isLoading = false;

  categoryTree: Category[] = [];
  treeNodes: TreeNode[] = [];

  priceBig: MoneyBig = 0;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
  ) {}

  updateProductPrice() {
    console.log('Price:', this.priceBig);
    this.product!.price = moneyBigToSmall(this.priceBig);
    console.log('Price:', this.product!.price, this.priceBig);
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      const id = params['id'];
      const fetchProduct = async () => {
        const res = await fetchAPI(`product/get/${id}`, {
          method: 'GET',
        });
        const json: ProductAdminDto = await res.json();
        this.product = json;
        this.priceBig = moneySmallToBig(this.product.price);
        // console.log("Product:", this.product);
      };

      await Promise.all([fetchProduct(), this.fetchAttributes()]);

      if (!this.product) {
        return;
      }

      this.selectedAttributes = this.attributes.filter((attribute) => {
        return (
          (this.product?.attrs[attribute.key] &&
            !this.product?.characteristics[attribute.key]) ??
          false
        );
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
      const error = await res.json();
      this.messageService.add({
        severity: 'error',
        summary: error.error,
        detail: error.message,
      });
      this.isLoading = false;
      return;
    }
    const json: ProductAdminDto = await res.json();
    this.product = json;
    // console.log("Product:", json);
    this.isLoading = false;
  }

  async deleteProduct() {
    if (!this.product) {
      return;
    }

    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: async () => {
        if (!this.product) {
          return;
        }
        const response = await fetchAPI(`product/delete/${this.product.id}`, {
          method: 'POST',
        });
        if (!response.ok) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error deleting product',
          });
          return;
        }
        history.back();
      },
      reject: (type: any) => {},
    });
  }

  addItem() {
    this.product?.items.push({
      sku: uuid(),
      attributes: Object.fromEntries(
        this.selectedAttributes.map((attribute) => [attribute.code, []]),
      ),
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
        if (
          !this.selectedAttributes.find((attribute) => attribute.key === key)
        ) {
          delete item.attributes[key];
        }
      });
    });
  }

  changeLanguage(lang: string) {
    this.currentLanguage = lang as LanguageEnum;
    this.treeNodes.forEach((treeNode: TreeNode) => {
      this.changeLabel(treeNode);
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

  getAttributeValues(
    attribute: AttributeDto,
  ): { name: string; code: string }[] {
    return attribute.values.map((value) => ({
      name: value.title,
      code: value.key,
    }));
  }

  onSelectedCharacteristicsChange() {
    if (!this.product) {
      return;
    }
    for (const attribute of this.selectedCharacteristics) {
      this.product.characteristics[attribute.key] =
        this.product.characteristics[attribute.key] ?? [];
    }
    for (const key of Object.keys(this.product.characteristics)) {
      if (
        !this.selectedCharacteristics.find((attribute) => attribute.key === key)
      ) {
        delete this.product.characteristics[key];
      }
    }
  }

  getAttributesForItems() {
    return this.attributes.filter((attribute) => {
      return !this.selectedCharacteristics.find(
        (attr) => attr.key === attribute.key,
      );
    });
  }

  getAttributesForCharacteristics() {
    return this.attributes.filter((attribute) => {
      return !this.selectedAttributes.find(
        (attr) => attr.key === attribute.key,
      );
    });
  }

  onItemBooleanChange(
    item: ProductItemDto,
    attributeKey: string,
    valueKey: string,
  ) {
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
    // console.log("Category tree:", json);
    this.categoryTree = json;

    // Map tree to treeNodes
    this.categoryTree.forEach((node) => {
      this.treeNodes.push(mapNode(node, this.currentLanguage));
    });
  }

  findNodeById(id: string): TreeNode | undefined {
    for (const treeNode of this.treeNodes) {
      const node = this._findNodeById(id, treeNode);
      if (node) {
        return node;
      }
    }
    return undefined;
  }

  _findNodeById(id: string, node: TreeNode<Category>): TreeNode | undefined {
    if (node.data?.id === id) {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const res = this._findNodeById(id, child);
        if (res) {
          return res;
        }
      }
    }
    return undefined;
  }
}
