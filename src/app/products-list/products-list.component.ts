import {Component, OnInit} from '@angular/core';
import {fetchAPI} from "../helpers/fetchAPI";
import {ConfirmationService, MessageService, TreeNode} from "primeng/api";
import {ProductAdminDto} from "../../../shopshared/dto/product.dto";
import {ProductListResponseDto} from "../../../shopshared/dto/product-list.response.dto";
import {Category} from "../helpers/categoriesTreHelpers";
import {CategoryDto} from "../../../shopshared/dto/category.dto";

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  products: ProductAdminDto[] = [];
  attrStrings = new WeakMap<ProductAdminDto, string[]>();
  categories = new Map<string, CategoryDto>();

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService) {
  }
  async ngOnInit() {
    await this.fetchCategories();
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
    console.log("List:", json);
    this.products = json.products;
    this.attrStrings = new WeakMap<ProductAdminDto, string[]>();
    this.products?.forEach((product) => {
      const attrStrings = Object.keys(product.attrs).map((key) => {
        return `${key}: ${product.attrs[key].join(", ")}`;
      });
      this.attrStrings.set(product, attrStrings);
    });
  }

  async fetchCategories() {
    const response = await fetchAPI('category/list', {
      method: 'GET',
    });
    const json: CategoryDto[] = await response.json();
    console.log("Categories:", json);
    this.categories = new Map<string, CategoryDto>();
    json.forEach((category) => {
      this.categories.set(category.id, category);
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
        await this.fetchData();
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Product deleted' });
      },
      reject: (type: any) => {}
    })
  }
}
