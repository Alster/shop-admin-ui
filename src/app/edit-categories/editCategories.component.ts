import { Component } from '@angular/core';
import ObjectId from 'bson-objectid';
import { TreeNode } from 'primeng/api';
import { LanguageEnum } from 'src/shop-shared/constants/localization';

import { CategoriesNodeAdminDto } from '../../shop-shared/dto/category/categoriesTree.dto';
import { CategoryAdmin, mapNode } from '../helpers/categoriesTreHelpers';
import { fetchAPI } from '../helpers/fetchAPI';
import { generatePublicId } from '../helpers/generatePublicId';

@Component({
	selector: 'app-edit-categories',
	templateUrl: './editCategories.component.html',
	styleUrls: ['./editCategories.component.scss'],
	providers: [],
})
export class EditCategoriesComponent {
	tree: CategoriesNodeAdminDto[] = [];
	files: TreeNode<CategoryAdmin>[] = [];
	selectedFile?: TreeNode<CategoryAdmin>;

	isLoading = false;

	currentLanguage: LanguageEnum = LanguageEnum.UA;
	languages = Object.values(LanguageEnum);

	constructor() {
		this.fetchTree();
	}

	async fetchTree(): Promise<void> {
		const response = await fetchAPI(`category/tree`, {
			method: 'GET',
		});
		const json: CategoriesNodeAdminDto[] = await response.json();
		// console.log("Category tree:", json);
		this.tree = json;

		// Map tree to files
		for (const node of this.tree) {
			this.files.push(mapNode(node, this.currentLanguage));
		}
	}

	async save(): Promise<void> {
		this.isLoading = true;
		await fetchAPI(`category/tree`, {
			method: 'POST',
			body: JSON.stringify(this.tree),
		});
	}

	// Map files to tree
	mapFiles(files: TreeNode[]): void {
		this.tree = [];
		for (const file of files) {
			this.tree.push(this.mapFile(file));
		}
	}

	mapFile(file: TreeNode): CategoryAdmin {
		const node: CategoryAdmin = file.data;
		node.children = [];
		if (file.children) {
			for (const child of file.children) {
				node.children!.push(this.mapFile(child));
			}
		}
		return node;
	}

	deleteNode(node: TreeNode): void {
		const childrens = node.parent ? node.parent.children || [] : this.files;
		const index = childrens.indexOf(node);
		childrens.splice(index, 1);
		this.mapFiles(this.files);
	}

	addChild(node: TreeNode): void {
		const title = {
			en: 'New category',
			ua: 'Нова категорія',
			ru: 'Новая категория',
		};
		const childrens = node.children || [];
		const newNode = {
			label: title[this.currentLanguage],
			data: {
				title,
				id: new ObjectId().toString(),
				publicId: '',
				description: {},
				children: [],
				sort: 0,
				active: true,
			},
			children: [],
		};
		this.selectedFile = newNode;
		childrens.push(newNode);
		node.expanded = true;
		this.mapFiles(this.files);
	}

	addRoot(): void {
		const title = {
			en: 'New category',
			ua: 'Нова категорія',
			ru: 'Новая категория',
		};
		const newNode = {
			label: title[this.currentLanguage],
			data: {
				title,
				id: new ObjectId().toString(),
				publicId: '',
				description: {},
				children: [],
				sort: 0,
				active: true,
			},
			children: [],
		};
		this.selectedFile = newNode;
		this.files.push(newNode);
		this.mapFiles(this.files);
	}

	changeLanguage(lang: string): void {
		this.currentLanguage = lang as LanguageEnum;
		// Recursively change labels
		for (const file of this.files) {
			this.changeLabel(file);
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

	moveNodeUp(node: TreeNode): void {
		const childrens = node.parent ? node.parent.children || [] : this.files;
		const index = childrens.indexOf(node);
		if (index > 0) {
			const previousNode = childrens[index - 1];
			childrens[index - 1] = node;
			childrens[index] = previousNode;
		}
		this.mapFiles(this.files);
	}

	moveNodeDown(node: TreeNode): void {
		const childrens = node.parent ? node.parent.children || [] : this.files;
		const index = childrens.indexOf(node);
		if (index < childrens.length - 1) {
			const nextNode = childrens[index + 1];
			childrens[index + 1] = node;
			childrens[index] = nextNode;
		}
		this.mapFiles(this.files);
	}

	makePublicIdFromTitle(node: TreeNode<CategoryAdmin>): void {
		const category = node.data;
		if (!category) {
			return;
		}
		const publicId = generatePublicId(category.title[LanguageEnum.EN]);
		category.publicId = publicId;
	}
}
