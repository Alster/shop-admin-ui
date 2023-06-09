import { TreeNode } from 'primeng/api';
import { fetchAPI } from './fetchAPI';
import { LanguageEnum } from '../../shop-shared/constants/localization';
import { CategoriesNodeDto } from '../../shop-shared/dto/category/categories-tree.dto';

export type Category = CategoriesNodeDto;
export const mapNode = (
  node: Category,
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
    node.children.forEach((child: Category) => {
      if (!isVisible(child.id)) {
        return;
      }
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
