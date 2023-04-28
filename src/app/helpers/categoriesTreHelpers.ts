import {CategoriesNodeDto} from "../../../shopshared/dto/categories-tree.dto";
import {TreeNode} from "primeng/api";
import {LanguageEnum} from "../../../shopshared/constants/localization";
import {fetchAPI} from "./fetchAPI";

export interface Category extends CategoriesNodeDto {

}
export const mapNode = (node: Category, language: LanguageEnum): TreeNode => {
  const treeNode: TreeNode = {
    label: node.title[language],
    data: node,
    key: node.id,
    children: [],
  };
  if (node.children) {
    node.children.forEach((child: Category) => {
      treeNode.children!.push(mapNode(child, language));
    });
  }
  return treeNode;
};

export const fetchCategoryTree = async (): Promise<CategoriesNodeDto[]> => {
  const res = await fetchAPI(`category/tree`, {
    method: 'GET',
  });
  return await res.json();
};
