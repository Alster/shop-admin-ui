import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import * as qs from 'qs';
import { ATTRIBUTE_TYPE } from 'src/shop-shared/constants/product';
import { ProductAdminDto } from 'src/shop-shared/dto/product/product.dto';

import { formatPrice } from '../../shop-exchange-shared/formatPrice';
import { LanguageEnum } from '../../shop-shared/constants/localization';
import { CategoriesNodeAdminDto } from '../../shop-shared/dto/category/categoriesTree.dto';
import { CategoryDto } from '../../shop-shared/dto/category/category.dto';
import { moneySmallToBig } from '../../shop-shared/dto/primitiveTypes';
import { AttributeDto } from '../../shop-shared/dto/product/attribute.dto';
import { ProductListAdminResponseDto } from '../../shop-shared/dto/product/productList.admin.response.dto';
import { CategoryAdmin, fetchCategoryTree, mapNode } from '../helpers/categoriesTreHelpers';
import { fetchAPI } from '../helpers/fetchAPI';

interface IAttributeFilter {
	key: string;
	values: string[];
}

@Component({
	selector: 'app-products-list',
	templateUrl: './productsList.component.html',
	styleUrls: ['./productsList.component.scss'],
})
export class ProductsListComponent implements OnInit {
	attributeTypeEnum = ATTRIBUTE_TYPE;
	products: ProductAdminDto[] = [];
	filters: { key: string; values: string[]; selected: string[] }[] = [];
	availableCategories: string[] = [];
	selectedCategories: string[] = [];
	categories = new Map<string, CategoryDto>();
	attributes = new Map<string, AttributeDto>();
	totalProductsCount = 0;
	first = 0;
	rows = 0;
	sortField = '';
	sortOrder = 0;
	searchTitleQuery = '';

	categoryTree: CategoryAdmin[] = [];
	treeNodes: TreeNode[] = [];

	listIsNotLoaded = true;
	isRouteParamsLoaded = false;
	isLoading = false;

	protected readonly ATTRIBUTE_TYPE = ATTRIBUTE_TYPE;
	protected readonly moneySmallToBig = moneySmallToBig;
	protected readonly formatPrice = formatPrice;

	constructor(
		private confirmationService: ConfirmationService,
		private messageService: MessageService,
		private router: Router,
		private route: ActivatedRoute,
	) {}

	async ngOnInit(): Promise<void> {
		this.route.queryParamMap.subscribe(async (parameters) => {
			this.isRouteParamsLoaded = true;
			await this.fetchProducts();
		});

		await Promise.all([
			this.fetchCategories(),
			this.fetchAttributes(),
			this.fetchCategoryTree(),
		]);
	}

	getSeverityForActive(active: boolean): string {
		return active ? 'success' : 'warning';
	}

	getTitleForActive(active: boolean): string {
		return active ? 'active' : 'disabled';
	}

	async updateQuery(): Promise<void> {
		if (this.listIsNotLoaded) {
			return;
		}

		console.log('Update query and navigate');

		this.isLoading = true;

		const attributeFilters: IAttributeFilter[] = this.filters
			.map(({ key, selected }) => ({ key, values: selected.filter(Boolean) }))
			.filter(({ values }) => values.length > 0);

		const categoryFilters = this.selectedCategories;

		const queryParameters: any = {};
		queryParameters.attrs = JSON.stringify(attributeFilters);
		queryParameters.cat = JSON.stringify(categoryFilters);
		queryParameters.sortField = this.sortField;
		queryParameters.sortOrder = this.sortOrder;
		queryParameters.first = this.first;
		queryParameters.rows = this.rows;
		queryParameters.search = this.searchTitleQuery;

		console.log('Query params before:', queryParameters);

		await this.router.navigate([], {
			relativeTo: this.route,
			queryParams: queryParameters,
			queryParamsHandling: 'merge',
		});
		this.isLoading = false;
	}

	onSort(): void {
		console.log('onSort');
	}

	async onTitleSearchUpdate(event: any): Promise<void> {
		console.log('onTitleSearchUpdate', event.value);
		this.searchTitleQuery = event.value;
		await this.updateQuery();
	}

	async lazyLoadProducts(event: any): Promise<void> {
		console.log('lazyLoadProducts', event);
		this.sortField = event.sortField;
		this.sortOrder = event.sortOrder;
		this.first = event.first;
		this.rows = event.rows;
		await this.updateQuery();
	}

	async fetchProducts(): Promise<void> {
		if (!this.isRouteParamsLoaded) {
			return;
		}
		console.log('Fetch products');
		const parameters = this.route.snapshot.queryParams;
		const attributeFilters: IAttributeFilter[] = JSON.parse(parameters['attrs'] ?? '[]');
		const categoryFilters: string[] = JSON.parse(parameters['cat'] ?? '[]');
		const sortField: string = parameters['sortField'] ?? '';
		const sortOrder: number = +(parameters['sortOrder'] ?? '');
		const first: number = +(parameters['first'] ?? '');
		const rows: number = +(parameters['rows'] ?? '5');
		const searchTitleQuery: string = parameters['search'] ?? '';
		console.log('Query params after: attrs:', attributeFilters);
		console.log('Query params after: cat:', categoryFilters);
		console.log('Query params after: sortField:', sortField);
		console.log('Query params after: sortOrder:', sortOrder);
		console.log('Query params after: first:', first);
		console.log('Query params after: rows:', rows);
		console.log('Query params after: search:', searchTitleQuery);

		const response = await fetchAPI(
			'product/list',
			{
				method: 'GET',
			},
			qs.stringify({
				attrs: attributeFilters,
				categories: categoryFilters,
				sortField: sortField,
				sortOrder: sortOrder,
				skip: first,
				limit: rows,
				search: searchTitleQuery,
			}),
		);
		this.listIsNotLoaded = false;
		if (!response.ok) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to fetch products',
			});
			return;
		}
		const json: ProductListAdminResponseDto = await response.json();
		// console.log("Products list:", json);

		this.products = json.products;
		this.filters = Object.entries(json.filters).map(([key, values]) => ({
			key,
			values: [...values],
			selected: attributeFilters.find(({ key: k }) => k === key)?.values ?? [],
		}));
		this.availableCategories = json.categories;
		this.totalProductsCount = json.total;

		this.selectedCategories = categoryFilters;

		this.sortField = sortField;
		this.sortOrder = sortOrder;
		this.first = first;
		this.rows = rows;
		this.searchTitleQuery = searchTitleQuery;

		// Prepare category tree
		const isVisible = (id: string): boolean => {
			return (
				this.availableCategories.includes(id) ||
				this.availableCategories.some((categoryId) => {
					const category = this.categories.get(categoryId);
					return category?.parents?.includes(id) ?? false;
				})
			);
		};
		this.treeNodes = [];
		// Map tree to treeNodes
		for (const node of this.categoryTree) {
			if (!isVisible(node.id)) {
				continue;
			}
			this.treeNodes.push(mapNode(node, LanguageEnum.UA, isVisible));
		}
	}

	async fetchCategoryTree(): Promise<void> {
		const json: CategoriesNodeAdminDto[] = await fetchCategoryTree();
		// console.log("Category tree:", json);
		this.categoryTree = json;
	}

	getAttributeString(product: ProductAdminDto): string[] {
		return Object.entries(product.attrs)
			.map(([nameKey, valueKeys]) => ({
				attr: this.attributes.get(nameKey),
				valueKeys,
			}))
			.filter(({ attr }) => attr !== undefined)
			.map(({ attr, valueKeys }) => {
				const values = valueKeys.map(
					(valueKey) => attr!.values.find((value) => value.key === valueKey)?.title,
				);
				return `${attr!.title}: ${values.join(', ')}`;
			});
	}

	getAttributeValues(attribute: AttributeDto): { name: string; code: string }[] {
		return [
			{
				name: 'All',
				code: '',
			},
			...attribute.values
				.map((value) => ({
					name: value.title,
					code: value.key,
				}))
				.filter(
					({ code }) =>
						this.filters
							.find(({ key }) => key === attribute.key)
							?.values.includes(code) ?? false,
				),
		];
	}

	async fetchCategories() {
		const response = await fetchAPI('category/list', {
			method: 'GET',
		});
		const json: CategoryDto[] = await response.json();
		// console.log("Categories:", json);
		this.categories = new Map<string, CategoryDto>();
		for (const category of json) {
			this.categories.set(category.id, category);
		}
	}

	async fetchAttributes(): Promise<void> {
		const response = await fetchAPI(`product/attribute/list`, {
			method: 'GET',
		});
		const json: AttributeDto[] = await response.json();
		// console.log("Attributes:", json);
		this.attributes = new Map<string, AttributeDto>();
		for (const attribute of json) {
			this.attributes.set(attribute.key, attribute);
		}
	}

	async cloneProduct(id: string): Promise<void> {
		const response = await fetchAPI(`product/clone/${id}`, {
			method: 'POST',
		});
		if (!response.ok) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Error cloning product',
			});
			return;
		}
		const product: ProductAdminDto = await response.json();
		this.router.navigate(['/edit-product'], {
			queryParams: {
				id: product.id,
			},
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
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Error deleting product',
					});
					return;
				}
				await this.fetchProducts();
				this.messageService.add({
					severity: 'info',
					summary: 'Confirmed',
					detail: 'Product deleted',
				});
			},
			reject: (type: any) => {},
		});
	}
}
