import { Component } from '@angular/core';
import { TreeNode } from 'primeng/api';
import ObjectId from 'bson-objectid';
import {LanguageEnum} from "../../../shopshared/constants/localization";

interface Category {
  title: {
    en: string;
    ua: string;
  },
  id: string;
  children?: Category[];
}

@Component({
  selector: 'app-edit-categories',
  templateUrl: './edit-categories.component.html',
  styleUrls: ['./edit-categories.component.scss']
})
export class EditCategoriesComponent {
  tree: Category[] = [
    {
      title: {
        "en": "Man",
        "ua": "Чоловікам",
      },
      id: new ObjectId().toString(),
      children: [
        {
          title: {
            "en": "Shoes",
            "ua": "Взуття",
          },
          id: new ObjectId().toString(),
        },
        {
          title: {
            "en": "Clothes",
            "ua": "Одяг",
          },
          id: new ObjectId().toString(),
          children: [
            {
              title: {
                "en": "T-shirts",
                "ua": "Футболки",
              },
              id: new ObjectId().toString(),
            },
            {
              title: {
                "en": "Pants",
                "ua": "Штани",
              },
              id: new ObjectId().toString(),
            }
          ]
        },
      ],
    },
    {
      title: {
        "en": "Woman",
        "ua": "Жінкам",
      },
      id: new ObjectId().toString(),
      children: [
        {
          title: {
            "en": "Shoes",
            "ua": "Взуття",
          },
          id: new ObjectId().toString(),
        },
        {
          title: {
            "en": "Clothes",
            "ua": "Одяг",
          },
          id: new ObjectId().toString(),
          children: [
            {
              title: {
                "en": "T-shirts",
                "ua": "Футболки",
              },
              id: new ObjectId().toString(),
            },
            {
              title: {
                "en": "Pants",
                "ua": "Штани",
              },
              id: new ObjectId().toString(),
            }
          ]
        }
      ]
    }
  ];
  files: TreeNode[] = [];
  selectedFile?: TreeNode;

  currentLanguage: LanguageEnum = LanguageEnum.UA;
  languages = Object.values(LanguageEnum);

  constructor() {
    // Map tree to files
    this.tree.forEach((node) => {
      this.files.push(this.mapNode(node));
    });
  }

  mapNode(node: Category): TreeNode {
    const treeNode: TreeNode = {
      label: node.title[this.currentLanguage],
      data: node,
      children: [],
    };
    if (node.children) {
      node.children.forEach((child: Category) => {
        treeNode.children!.push(this.mapNode(child));
      });
    }
    return treeNode;
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
    const childrens = node.parent ? (node.parent.children || []) : this.files;
    const index = childrens.indexOf(node);
    childrens.splice(index, 1);
    this.mapFiles(this.files);
  }

  addChild(node: TreeNode) {
    const title = {
      "en": "New category",
      "ua": "Нова категорія",
    };
    const childrens = node.children || [];
    childrens.push({
      label: title[this.currentLanguage],
      data: {
        title,
        id: new ObjectId().toString(),
      },
      children: [],
    });
    node.expanded = true;
    this.mapFiles(this.files);
  }

  addRoot() {
    const title = {
      "en": "New category",
      "ua": "Нова категорія",
    };
    this.files.push({
      label: title[this.currentLanguage],
      data: {
        title,
        id: new ObjectId().toString(),
      },
      children: [],
    });
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

  async save() {
    console.log(this.tree);
  }
}
