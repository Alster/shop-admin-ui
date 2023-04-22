import {Component, OnInit} from '@angular/core';
import {fetchAPI} from "../helpers/fetchAPI";
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {ProductAdminDto} from "../../../shopshared/dto/product.dto";
import {ProductListResponseDto} from "../../../shopshared/dto/product-list.response.dto";

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  products: ProductAdminDto[] = [];
  attrStrings = new WeakMap<ProductAdminDto, string[]>();

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService) {
  }
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
    this.attrStrings = new WeakMap<ProductAdminDto, string[]>();
    this.products?.forEach((product) => {
      const attrStrings = Object.keys(product.attrs).map((key) => {
        return `${key}: ${product.attrs[key].join(", ")}`;
      });
      this.attrStrings.set(product, attrStrings);
    });
  }

  async deleteProduct(id: string) {
    console.log("deleting product");
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
