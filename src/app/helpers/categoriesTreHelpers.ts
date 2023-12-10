import { TreeNode } from "primeng/api";

import { LanguageEnum } from "../../../shop-shared/constants/localization";
import {
	CategoriesNodeAdminDto,
	CategoriesNodeDto,
} from "../../../shop-shared/dto/category/categoriesTree.dto";
import { fetchAPI } from "./fetchAPI";

export type Category = CategoriesNodeDto;
export type CategoryAdmin = CategoriesNodeAdminDto;

export const mapNode = (
	node: CategoryAdmin,
	language: LanguageEnum,
	isVisible: (id: string) => boolean = () => true,
): TreeNode => {
	const treeNode: TreeNode = {
		label: node.title[language],
		data: node,
		key: node.id,
		children: [],
	};
	if (node.children) {
		for (const child of node.children) {
			if (!isVisible(child.id)) {
				continue;
			}
			treeNode.children!.push(mapNode(child, language));
		}
	}
	return treeNode;
};

export const fetchCategoryTree = async (): Promise<CategoriesNodeAdminDto[]> => {
	const response = await fetchAPI(`category/tree`, {
		method: "GET",
	});
	return await response.json();
};
