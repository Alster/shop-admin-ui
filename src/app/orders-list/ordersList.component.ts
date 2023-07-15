import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import * as qs from 'qs';

import { ORDER_STATUS, OrderStatus } from '../../shop-shared/constants/order';
import { ATTRIBUTE_TYPE } from '../../shop-shared/constants/product';
import { OrderAdminDto } from '../../shop-shared/dto/order/order.dto';
import { OrderListAdminResponseDto } from '../../shop-shared/dto/product/orderList.admin.response.dto';
import { STATUS_TO_SEVERITY_MAP } from '../constants/order';
import { fetchAPI } from '../helpers/fetchAPI';

@Component({
	selector: 'app-orders-list',
	templateUrl: './ordersList.component.html',
	styleUrls: ['./ordersList.component.scss'],
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
		this.route.queryParamMap.subscribe(async (parameters) => {
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

		const queryParameters: any = {};
		queryParameters.sortField = this.sortField;
		queryParameters.sortOrder = this.sortOrder;
		queryParameters.first = this.first;
		queryParameters.rows = this.rows;
		queryParameters.search = this.searchTitleQuery;
		queryParameters.status = this.selectedStatus;

		console.log('Query params before:', queryParameters);

		await this.router.navigate([], {
			relativeTo: this.route,
			queryParams: queryParameters,
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
		const parameters = this.route.snapshot.queryParams;
		const sortField: string = parameters['sortField'] ?? '';
		const sortOrder: number = +(parameters['sortOrder'] ?? '');
		const first: number = +(parameters['first'] ?? '');
		const rows: number = +(parameters['rows'] ?? '5');
		const searchTitleQuery: string = parameters['search'] ?? '';
		const status: string = parameters['status'] ?? '';
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
