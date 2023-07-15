import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';

import { fetchAPI } from '../helpers/fetchAPI';

@Component({
	selector: 'app-create-product',
	templateUrl: './createProduct.component.html',
	styleUrls: ['./createProduct.component.scss'],
})
export class CreateProductComponent {
	name = '';
	price = 0;

	isLoading = false;

	constructor(private router: Router) {}

	async createProduct() {
		this.isLoading = true;
		const response = await fetchAPI('product/create', {
			method: 'POST',
			body: JSON.stringify({
				name: this.name,
				price: this.price,
			}),
		});
		if (!response.ok) {
			console.error('Error creating product');
			this.isLoading = false;
			return;
		}
		const json = await response.json();

		const navigationExtras: NavigationExtras = {
			queryParams: { id: json.id },
		};

		await this.router.navigate(['/edit-product'], navigationExtras);
	}
}
