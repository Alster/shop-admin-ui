import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

import { formatPrice } from '../../shop-exchange-shared/formatPrice';
import { NOVA_POSHTA_DELIVERY_TYPE } from '../../shop-shared/constants/checkout';
import { ORDER_STATUS, OrderStatus } from '../../shop-shared/constants/order';
import {
	DeliveryDataDto,
	DeliveryNVCourierDto,
	DeliveryNVOfficeDto,
} from '../../shop-shared/dto/order/createOrder.dto';
import { OrderAdminDto } from '../../shop-shared/dto/order/order.dto';
import { MoneyBig, moneySmallToBig } from '../../shop-shared/dto/primitiveTypes';
import { ProductAttributesDto } from '../../shop-shared/dto/product/product.dto';
import { STATUS_TO_SEVERITY_MAP } from '../constants/order';
import { fetchAPI } from '../helpers/fetchAPI';

@Component({
	selector: 'app-order-view',
	templateUrl: './orderView.component.html',
	styleUrls: ['./orderView.component.scss'],
})
export class OrderViewComponent implements OnInit {
	order?: OrderAdminDto;
	isLoading = false;
	NOVA_POSHTA_DELIVERY_TYPE = NOVA_POSHTA_DELIVERY_TYPE;
	ORDER_STATUS = ORDER_STATUS;

	priceBig: MoneyBig = 0;

	constructor(
		private confirmationService: ConfirmationService,
		private messageService: MessageService,
		private route: ActivatedRoute,
	) {}

	async ngOnInit() {
		this.route.queryParams.subscribe(async (parameters) => {
			const id = parameters['id'];
			const fetchOrder = async () => {
				const res = await fetchAPI(`order/get/${id}`, {
					method: 'GET',
				});
				const json: OrderAdminDto = await res.json();
				this.order = json;
				this.priceBig = moneySmallToBig(this.order.totalPrice);
				// console.log("Order:", this.order);
			};

			await Promise.all([fetchOrder()]);

			if (!this.order) {
				return;
			}
		});
	}

	getNVOffice(delivery: DeliveryDataDto): DeliveryNVOfficeDto {
		return delivery.data as DeliveryNVOfficeDto;
	}

	getNVCourier(delivery: DeliveryDataDto): DeliveryNVCourierDto {
		return delivery.data as DeliveryNVCourierDto;
	}

	getSeverityForStatus(status: OrderStatus): string {
		return STATUS_TO_SEVERITY_MAP[status];
	}

	getAttributesAsArray(attributes: ProductAttributesDto): string[] {
		return Object.entries(attributes).map(([key, values]) => {
			return `${key}: ${values.join(', ')}`;
		});
	}

	getHREFToProduct(id: string): string {
		return `/edit-product/?id=${id}`;
	}

	async markOrderAsFinished() {
		this.isLoading = true;
		const res = await fetchAPI(`order/${this.order?.id}/mark_finished`, {
			method: 'POST',
		});
		if (!res.ok) {
			console.error('Error updating order');
			this.isLoading = false;
			return;
		}
		const json: OrderAdminDto = await res.json();
		this.order = json;
		// console.log("Order:", json);
		this.isLoading = false;
	}

	protected readonly formatPrice = formatPrice;
}
