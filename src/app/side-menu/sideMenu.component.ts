import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
	selector: 'app-side-menu',
	templateUrl: './sideMenu.component.html',
	styleUrls: ['./sideMenu.component.scss'],
})
export class SideMenuComponent implements OnInit {
	items: MenuItem[] = [];

	ngOnInit() {
		this.items = [
			{
				label: 'Products',
				icon: 'pi pi-fw pi-file',
				expanded: true,
				items: [
					{
						label: 'New',
						icon: 'pi pi-fw pi-plus',
						routerLink: ['/create-product'],
					},
					{
						label: 'List',
						icon: 'pi pi-fw pi-list',
						routerLink: ['/list-product'],
					},
					{
						label: 'Categories',
						icon: 'pi pi-fw pi-sitemap',
						routerLink: ['/edit-categories'],
					},
				],
			},
			{
				label: 'Orders',
				icon: 'pi pi-fw pi-file',
				expanded: true,
				items: [
					{
						label: 'List',
						icon: 'pi pi-fw pi-list',
						routerLink: ['/list-order'],
					},
				],
			},
		];
	}
}
