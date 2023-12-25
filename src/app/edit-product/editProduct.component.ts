import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ImageCroppedEvent, LoadedImage } from "ngx-image-cropper";
import { ConfirmationService, MessageService, TreeNode } from "primeng/api";
import { LanguageEnum } from "shop-shared/constants/localization";
import { v4 as uuid } from "uuid";

import { ATTRIBUTE_TYPE } from "../../../shop-shared/constants/product";
import { CategoriesNodeAdminDto } from "../../../shop-shared/dto/category/categoriesTree.dto";
import {
	MoneyBig,
	moneyBigToSmall,
	moneySmallToBig,
} from "../../../shop-shared/dto/primitiveTypes";
import { AttributeDto } from "../../../shop-shared/dto/product/attribute.dto";
import { ProductAdminDto, ProductItemDto } from "../../../shop-shared/dto/product/product.dto";
import { generatePublicId } from "../../../shop-shared/utils/generatePublicId";
import getProductImageUrl from "../../../shop-shared/utils/getProductImageUrl";
import {
	Category,
	CategoryAdmin,
	fetchCategoryTree,
	mapNode,
} from "../helpers/categoriesTreHelpers";
import { fetchAPI } from "../helpers/fetchAPI";
import { generateRandomString } from "../helpers/generateRandomString";

interface IMultiselectEntry extends AttributeDto {
	name: string;
	code: string;
}

@Component({
	selector: "app-edit-product",
	templateUrl: "./editProduct.component.html",
	styleUrls: ["./editProduct.component.scss"],
})
export class EditProductComponent implements OnInit {
	product?: ProductAdminDto;
	availableAttributes: AttributeDto[] = [];
	attributes: IMultiselectEntry[] = [];
	selectedAttributes: IMultiselectEntry[] = [];
	selectedCharacteristics: IMultiselectEntry[] = [];

	attributeTypeEnum = ATTRIBUTE_TYPE;
	currentLanguage: LanguageEnum = LanguageEnum.ua;
	languages = Object.values(LanguageEnum);

	isLoading = false;

	categoryTree: CategoryAdmin[] = [];
	treeNodes: TreeNode[] = [];

	priceBig: MoneyBig = 0;

	constructor(
		private confirmationService: ConfirmationService,
		private messageService: MessageService,
		private route: ActivatedRoute,
	) {}

	updateProductPrice(): void {
		console.log("Price:", this.priceBig);
		this.product!.price = moneyBigToSmall(this.priceBig);
		console.log("Price:", this.product!.price, this.priceBig);
	}

	async ngOnInit(): Promise<void> {
		this.route.queryParams.subscribe(async (parameters) => {
			const id = parameters["id"];
			const fetchProduct = async () => {
				const response = await fetchAPI(`product/get/${id}`, {
					method: "GET",
				});
				const json: ProductAdminDto = await response.json();
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

			if (!this.product?.publicId) {
				this.makePublicIdFromTitle();
			}
		});
		await this.fetchCategoryTree();
	}

	async fetchAttributes(): Promise<void> {
		const response = await fetchAPI(`product/attribute/list`, {
			method: "GET",
		});
		const json: AttributeDto[] = await response.json();
		this.availableAttributes = json;
		this.attributes = json.map((attribute) => {
			return {
				...attribute,
				name: attribute.title,
				code: attribute.key,
			};
		});
	}

	async updateProduct(): Promise<void> {
		this.isLoading = true;
		const response = await fetchAPI(`product/update/${this.product?.id}`, {
			method: "POST",
			body: JSON.stringify(this.product),
		});
		if (!response.ok) {
			const error = await response.json();
			this.messageService.add({
				severity: "error",
				summary: error.error,
				detail: error.message,
			});
			this.isLoading = false;
			return;
		}
		const json: ProductAdminDto = await response.json();
		this.product = json;
		// console.log("Product:", json);
		this.isLoading = false;
	}

	async deleteProduct(): Promise<void> {
		if (!this.product) {
			return;
		}

		this.confirmationService.confirm({
			message: "Do you want to delete this record?",
			header: "Delete Confirmation",
			icon: "pi pi-info-circle",
			accept: async () => {
				if (!this.product) {
					return;
				}
				const response = await fetchAPI(`product/delete/${this.product.id}`, {
					method: "POST",
				});
				if (!response.ok) {
					this.messageService.add({
						severity: "error",
						summary: "Error",
						detail: "Error deleting product",
					});
					return;
				}
				history.back();
			},
			reject: (type: any) => {},
		});
	}

	addItem(): void {
		this.product?.items.push({
			sku: uuid(),
			attributes: Object.fromEntries(
				this.selectedAttributes.map((attribute) => [attribute.code, []]),
			),
		});
	}

	removeItem(item: ProductItemDto): void {
		if (!this.product) {
			return;
		}
		this.product.items = this.product.items.filter((index) => index.sku !== item.sku);
	}

	cloneItem(item: ProductItemDto): void {
		if (!this.product) {
			return;
		}
		this.product.items.push({
			...JSON.parse(JSON.stringify(item)),
			sku: uuid(),
		});
	}

	onSelectedAttributesChange(): void {
		if (!this.product) {
			return;
		}
		for (const item of this.product.items) {
			for (const attribute of this.selectedAttributes) {
				item.attributes[attribute.key] = item.attributes[attribute.key] ?? [];
			}
			for (const key of Object.keys(item.attributes)) {
				if (!this.selectedAttributes.find((attribute) => attribute.key === key)) {
					delete item.attributes[key];
				}
			}
		}
	}

	changeLanguage(lang: string): void {
		this.currentLanguage = lang as LanguageEnum;
		for (const treeNode of this.treeNodes) {
			this.changeLabel(treeNode);
		}
	}

	changeLabel(node: TreeNode): void {
		node.label = node.data.title[this.currentLanguage];
		if (node.children) {
			for (const child of node.children) {
				this.changeLabel(child);
			}
		}
	}

	getAttributeValues(attribute: AttributeDto): { name: string; code: string }[] {
		return attribute.values.map((value) => ({
			name: value.title,
			code: value.key,
		}));
	}

	onSelectedCharacteristicsChange(): void {
		if (!this.product) {
			return;
		}
		for (const attribute of this.selectedCharacteristics) {
			this.product.characteristics[attribute.key] =
				this.product.characteristics[attribute.key] ?? [];
		}
		for (const key of Object.keys(this.product.characteristics)) {
			if (!this.selectedCharacteristics.some((attribute) => attribute.key === key)) {
				delete this.product.characteristics[key];
			}
		}
	}

	getAttributesForItems(): IMultiselectEntry[] {
		return this.attributes.filter((attribute) => {
			return !this.selectedCharacteristics.some(
				(attribute_) => attribute_.key === attribute.key,
			);
		});
	}

	getAttributesForCharacteristics(): IMultiselectEntry[] {
		return this.attributes.filter((attribute) => {
			return !this.selectedAttributes.some((attribute_) => attribute_.key === attribute.key);
		});
	}

	onItemBooleanChange(item: ProductItemDto, attributeKey: string, valueKey: string): void {
		if (!this.product) {
			return;
		}
		item.attributes[attributeKey][0] = valueKey;
	}

	onCharacteristicBooleanChange(attributeKey: string, valueKey: string): void {
		if (!this.product) {
			return;
		}
		this.product.characteristics[attributeKey][0] = valueKey;
	}

	async fetchCategoryTree(): Promise<void> {
		const json: CategoriesNodeAdminDto[] = await fetchCategoryTree();
		// console.log("Category tree:", json);
		this.categoryTree = json;

		// Map tree to treeNodes
		for (const node of this.categoryTree) {
			this.treeNodes.push(mapNode(node, this.currentLanguage));
		}
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

	makePublicIdFromTitle(): void {
		const publicId = generatePublicId(this.product!.title["en"]);
		const randomString = generateRandomString(6);
		this.product!.publicId = `${publicId}-${randomString}`;
	}

	getUsedColors(): string[] {
		const colors: string[] = [];
		for (const item of this.product!.items) {
			const color = item.attributes["color"][0];
			if (color && !colors.includes(color)) {
				colors.push(color);
			}
		}
		return colors;
	}

	deleteImage(color: string, image: string): void {
		if (!this.product) {
			return;
		}

		this.product.imagesByColor[color] = this.product.imagesByColor[color].filter(
			(img) => img !== image,
		);
	}

	imageChangedEvent: Record<string, any> = {};
	croppedImage: Record<string, any> = {};
	croppedBlob: Record<string, any> = {};

	fileChangeEvent(color: string, event: any): void {
		console.log("fileChangeEvent", color, event);
		this.imageChangedEvent[color] = event;
	}
	imageCropped(color: string, event: ImageCroppedEvent) {
		console.log("imageCropped", color, event);
		this.croppedBlob[color] = event.blob;
		// this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
		// event.blob can be used to upload the cropped image
	}
	imageLoaded(color: string, image: LoadedImage) {
		console.log("imageLoaded", image, color);
		// show cropper
	}
	cropperReady(color: string) {
		console.log("cropperReady", color);
		// cropper ready
	}
	loadImageFailed(color: string) {
		console.log("loadImageFailed", color);
		// show message
	}

	async uploadImage(color: string): Promise<void> {
		if (!this.product) {
			return;
		}

		const formData = new FormData();
		formData.append("image", this.croppedBlob[color]);
		formData.append("productId", this.product.publicId);

		const res = await this.upload(formData);

		console.log("uploadImage", res);

		if (!this.product.imagesByColor[color]) {
			this.product.imagesByColor[color] = [];
		}
		this.product.imagesByColor[color].push(res);
	}

	async upload(formData: FormData): Promise<string> {
		// const response = await fetch(
		// 	`http://localhost:4300/product/upload-product-image/` + this.product?.id,
		// 	{
		// 		method: 'POST',
		// 		body: formData,
		// 	},
		// );
		const response = await fetchAPI(`product/upload-product-image`, {
			method: "POST",
			body: formData,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});

		return await response.text();
	}

	getImageUrl(color: string, uid: string): string {
		return getProductImageUrl(this.product?.id ?? "", uid, "medium");
	}
}
