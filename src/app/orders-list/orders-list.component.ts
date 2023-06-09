import { Component, OnInit } from '@angular/core';
import { OrderAdminDto } from '../../shop-shared/dto/order/order.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { fetchAPI } from '../helpers/fetchAPI';
import * as qs from 'qs';
import { ProductListAdminResponseDto } from '../../shop-shared/dto/product/product-list.admin.response.dto';
import { mapNode } from '../helpers/categoriesTreHelpers';
import { LanguageEnum } from '../../shop-shared/constants/localization';
import { MessageService } from 'primeng/api';
import { OrderListAdminResponseDto } from '../../shop-shared/dto/product/order-list.admin.response.dto';
import { ORDER_STATUS, OrderStatus } from '../../shop-shared/constants/order';
import { STATUS_TO_SEVERITY_MAP } from '../constants/order';
import { ATTRIBUTE_TYPE } from '../../shop-shared/constants/product';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss'],
})
export class OrdersListComponent implements OnInit {
  ORDER_STATUS = ORDER_STATUS;

  orders: OrderAdminDto[] = [];
  totalOrdersCount = 0;
  first = 0;
  rows = 0;
  sortField = '';
  sortOrder = 0;
  searchTitleQuery = '';
  selectedStatus = '';

  listIsNotLoaded = true;
  isRouteParamsLoaded = false;
  isLoading = false;

  constructor(
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    this.route.queryParamMap.subscribe(async (params) => {
      this.isRouteParamsLoaded = true;
      await this.fetchProducts();
    });
  }

  getOrderStatuses(): { name: string; code: string }[] {
    return [
      {
        name: 'ANY',
        code: '',
      },
      ...Object.values(ORDER_STATUS).map((status) => ({
        name: status,
        code: status,
      })),
    ];
  }

  async updateQuery() {
    if (this.listIsNotLoaded) {
      return;
    }

    console.log('Update query and navigate');

    this.isLoading = true;

    const queryParams: any = {};
    queryParams.sortField = this.sortField;
    queryParams.sortOrder = this.sortOrder;
    queryParams.first = this.first;
    queryParams.rows = this.rows;
    queryParams.search = this.searchTitleQuery;
    queryParams.status = this.selectedStatus;

    console.log('Query params before:', queryParams);

    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
    this.isLoading = false;
  }

  onSort() {
    console.log('onSort');
  }

  async onTitleSearchUpdate(event: any) {
    console.log('onTitleSearchUpdate', event.value);
    this.searchTitleQuery = event.value;
    await this.updateQuery();
  }

  async lazyLoadOrders(event: any) {
    console.log('lazyLoadOrders', event);
    this.sortField = event.sortField;
    this.sortOrder = event.sortOrder;
    this.first = event.first;
    this.rows = event.rows;
    await this.updateQuery();
  }

  async fetchProducts() {
    if (!this.isRouteParamsLoaded) {
      return;
    }
    console.log('Fetch orders');
    const params = this.route.snapshot.queryParams;
    const sortField: string = params['sortField'] ?? '';
    const sortOrder: number = +(params['sortOrder'] ?? '');
    const first: number = +(params['first'] ?? '');
    const rows: number = +(params['rows'] ?? '5');
    const searchTitleQuery: string = params['search'] ?? '';
    const status: string = params['status'] ?? '';
    console.log('Query params after: sortField:', sortField);
    console.log('Query params after: sortOrder:', sortOrder);
    console.log('Query params after: first:', first);
    console.log('Query params after: rows:', rows);
    console.log('Query params after: search:', searchTitleQuery);
    console.log('Query params after: status:', status);

    const response = await fetchAPI(
      'order/list',
      {
        method: 'GET',
      },
      qs.stringify({
        sortField: sortField,
        sortOrder: sortOrder,
        skip: first,
        limit: rows,
        search: searchTitleQuery,
        status: status,
      }),
    );
    this.listIsNotLoaded = false;
    if (!response.ok) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch orders',
      });
      return;
    }
    const json: OrderListAdminResponseDto = await response.json();
    // console.log("Orders list:", json);

    this.orders = json.orders;
    this.totalOrdersCount = json.total;

    this.sortField = sortField;
    this.sortOrder = sortOrder;
    this.first = first;
    this.rows = rows;
    this.searchTitleQuery = searchTitleQuery;
    this.selectedStatus = status;
  }

  getSeverityForStatus(status: OrderStatus): string {
    return STATUS_TO_SEVERITY_MAP[status];
  }

  protected readonly ATTRIBUTE_TYPE = ATTRIBUTE_TYPE;
}
