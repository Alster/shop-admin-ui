import { Component } from '@angular/core';
import { TreeNode } from 'primeng/api';
import ObjectId from 'bson-objectid';
import { fetchAPI } from '../helpers/fetchAPI';
import { Category, mapNode } from '../helpers/categoriesTreHelpers';
import { LanguageEnum } from 'src/shop-shared/constants/localization';
import { CategoriesNodeDto } from '../../shop-shared/dto/category/categories-tree.dto';

@Component({
  selector: 'app-edit-categories',
  templateUrl: './edit-categories.component.html',
  styleUrls: ['./edit-categories.component.scss'],
  providers: [],
})
export class EditCategoriesComponent {
  tree: Category[] = [];
  files: TreeNode[] = [];
  selectedFile?: TreeNode;

  isLoading = false;

  currentLanguage: LanguageEnum = LanguageEnum.UA;
  languages = Object.values(LanguageEnum);

  constructor() {
    this.fetchTree();
  }

  async fetchTree() {
    const res = await fetchAPI(`category/tree`, {
      method: 'GET',
    });
    const json: CategoriesNodeDto[] = await res.json();
    // console.log("Category tree:", json);
    this.tree = json;

    // Map tree to files
    this.tree.forEach((node) => {
      this.files.push(mapNode(node, this.currentLanguage));
    });
  }

  async save() {
    this.isLoading = true;
    const res = await fetchAPI(`category/tree`, {
      method: 'POST',
      body: JSON.stringify(this.tree),
    });
  }

  // Map files to tree
  mapFiles(files: TreeNode[]) {
    this.tree = [];
    files.forEach((file: TreeNode) => {
      this.tree.push(this.mapFile(file));
    });
  }

  mapFile(file: TreeNode): Category {
    const node: Category = file.data;
    node.children = [];
    if (file.children) {
      file.children.forEach((child: TreeNode) => {
        node.children!.push(this.mapFile(child));
      });
    }
    return node;
  }

  deleteNode(node: TreeNode) {
    const childrens = node.parent ? node.parent.children || [] : this.files;
    const index = childrens.indexOf(node);
    childrens.splice(index, 1);
    this.mapFiles(this.files);
  }

  addChild(node: TreeNode) {
    const title = {
      en: 'New category',
      ua: 'Нова категорія',
    };
    const childrens = node.children || [];
    const newNode = {
      label: title[this.currentLanguage],
      data: {
        title,
        id: new ObjectId().toString(),
      },
      children: [],
    };
    this.selectedFile = newNode;
    childrens.push(newNode);
    node.expanded = true;
    this.mapFiles(this.files);
  }

  addRoot() {
    const title = {
      en: 'New category',
      ua: 'Нова категорія',
    };
    const newNode = {
      label: title[this.currentLanguage],
      data: {
        title,
        id: new ObjectId().toString(),
      },
      children: [],
    };
    this.selectedFile = newNode;
    this.files.push(newNode);
    this.mapFiles(this.files);
  }

  changeLanguage(lang: string) {
    this.currentLanguage = lang as LanguageEnum;
    // Recursively change labels
    this.files.forEach((file: TreeNode) => {
      this.changeLabel(file);
    });
  }

  changeLabel(node: TreeNode) {
    node.label = node.data.title[this.currentLanguage];
    if (node.children) {
      node.children.forEach((child: TreeNode) => {
        this.changeLabel(child);
      });
    }
  }

  moveNodeUp(node: TreeNode) {
    const childrens = node.parent ? node.parent.children || [] : this.files;
    const index = childrens.indexOf(node);
    if (index > 0) {
      const prevNode = childrens[index - 1];
      childrens[index - 1] = node;
      childrens[index] = prevNode;
    }
    this.mapFiles(this.files);
  }

  moveNodeDown(node: TreeNode) {
    const childrens = node.parent ? node.parent.children || [] : this.files;
    const index = childrens.indexOf(node);
    if (index < childrens.length - 1) {
      const nextNode = childrens[index + 1];
      childrens[index + 1] = node;
      childrens[index] = nextNode;
    }
    this.mapFiles(this.files);
  }
}
