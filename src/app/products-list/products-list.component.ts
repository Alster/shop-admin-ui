import {Component, OnInit} from '@angular/core';
import * as qs from "qs";
import {fetchAPI} from "../helpers/fetchAPI";
import {ConfirmationService, MessageService, TreeNode} from "primeng/api";
import {ProductAdminDto} from "../../../shopshared/dto/product.dto";
import {ProductListResponseDto} from "../../../shopshared/dto/product-list.response.dto";
import {CategoryDto} from "../../../shopshared/dto/category.dto";
import {AttributeDto} from "../../../shopshared/dto/attribute.dto";
import {ATTRIBUTE_TYPE} from "../../../shopshared/constants/product";
import {ActivatedRoute, Router} from "@angular/router";

interface AttributeFilter {
  key: string,
  values: string[],
}

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  attributeTypeEnum = ATTRIBUTE_TYPE;
  products: ProductAdminDto[] = [];
  filters: { key: string, values: string[], selected: string[] }[] = [];
  availableCategories: string[] = [];
  categories = new Map<string, CategoryDto>();
  attributes = new Map<string, AttributeDto>();
  totalProductsCount = 0;

  listIsNotLoaded = true;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
    ) {
  }
  async ngOnInit() {
    this.route.queryParamMap.subscribe(async params => {
      await this.fetchProducts();
    });

    await Promise.all([this.fetchCategories(), this.fetchAttributes()]);
  }

  getSeverityForActive(active: boolean): string {
    return active ? 'success' : 'warning';
  }

  getTitleForActive(active: boolean): string {
    return active ? 'active' : 'disabled';
  }

  async updateQuery() {
    if (this.listIsNotLoaded){
      return;
    }

    const attrFilters: AttributeFilter[] = this.filters
      .map(({ key, selected }) => ({ key, values: selected.filter(v => v) }))
      .filter(({ values }) => values.length > 0);

    const queryParams: any = {};
    queryParams.attrs = JSON.stringify(attrFilters);

    console.log("Query params before:", queryParams);

    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  async fetchProducts() {
    const params = this.route.snapshot.queryParams;
    const attrFilters: AttributeFilter[] = JSON.parse(params['attrs'] ?? '[]')
    console.log("Query params after: attrs:", attrFilters);

    const response = await fetchAPI('product/list', {
      method: 'GET',
    }, qs.stringify({ attrs: attrFilters }));
    this.listIsNotLoaded = false;
    if (!response.ok) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch products' });
      return;
    }
    const json: ProductListResponseDto = await response.json();
    // console.log("Products list:", json);

    this.products = json.products;
    this.filters = Object
      .entries(json.filters)
      .map(([key, values]) => ({
        key,
        values: [...values],
        selected: attrFilters.find(({ key: k }) => k === key)?.values ?? []
      }));
    this.availableCategories = json.categories;
    this.totalProductsCount = json.total;
  }

  getAttributeString(product: ProductAdminDto): string[] {
    return Object
      .entries(product.attrs)
      .map(([nameKey, valueKeys]) => ({ attr: this.attributes.get(nameKey), valueKeys }))
      .filter(({ attr }) => attr !== undefined)
      .map(({ attr, valueKeys }) => {
        const values = valueKeys.map((valueKey) => attr!.values.find((value) => value.key === valueKey)?.title);
        return `${attr!.title}: ${values.join(", ")}`;
      });
  }

  getAttributeValues(attribute: AttributeDto): { name: string, code: string }[] {
    return [{
      name: 'All',
      code: '',
    }, ...attribute.values
      .map((value) => ({
        name: value.title,
        code: value.key,
      }))
      .filter(({ code }) => this.filters.find(({ key }) => key === attribute.key)?.values.includes(code) ?? false)
    ];
  }

  async fetchCategories() {
    const response = await fetchAPI('category/list', {
      method: 'GET',
    });
    const json: CategoryDto[] = await response.json();
    // console.log("Categories:", json);
    this.categories = new Map<string, CategoryDto>();
    json.forEach((category) => {
      this.categories.set(category.id, category);
    });
  }

  async fetchAttributes() {
    const res = await fetchAPI(`product/attribute/list`, {
      method: 'GET',
    });
    const json: AttributeDto[] = await res.json();
    // console.log("Attributes:", json);
    this.attributes = new Map<string, AttributeDto>();
    json.forEach((attribute) => {
      this.attributes.set(attribute.key, attribute);
    });
  }

  async cloneProduct(id: string) {
    const response = await fetchAPI(`product/clone/${id}`, {
      method: 'POST',
    });
    if (!response.ok) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error cloning product' });
      return;
    }
    const product: ProductAdminDto = await response.json();
    this.router.navigate(['/edit-product'], {
      queryParams: {
        id: product.id,
      }
    });
  }

  async deleteProduct(id: string) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: async () => {
        const response = await fetchAPI(`product/delete/${id}`, {
          method: 'POST',
        });
        if (!response.ok) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error deleting product' });
          return;
        }
        await this.fetchProducts();
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Product deleted' });
      },
      reject: (type: any) => {}
    })
  }

  protected readonly ATTRIBUTE_TYPE = ATTRIBUTE_TYPE;
}
