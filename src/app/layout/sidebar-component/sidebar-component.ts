import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { SidebarService } from '../../services/sidebar.service';
import { MenuItem } from '../../helperApi/model';   // ✅ import model

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TooltipModule, RippleModule, TieredMenuModule],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.scss'
})
export class SidebarComponent {
  collapsed = false;
  openMenus: { [key: string]: boolean } = {};

  // ✅ Typed menu array
  menu: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'icon-dashboard2',
      route: '/dashboard'
    },
    {
      label: 'Report',
      icon: 'icon-ClipboardText',
      route: '/users'
    },
    {
      label: 'Organization',
      icon: 'icon-Gear',
      subMenu: [
        {
          label: 'Invoices',
          icon: 'icon-Receipt'
        },
        {
          label: 'Users',
          icon: 'icon-UsersThree',
          route: '/add-user'
        }
      ]
    }
  ];

  constructor(private sidebarService: SidebarService, private router: Router) {}

  toggleSidebar() {
    this.collapsed = !this.collapsed;
    this.sidebarService.setCollapsed(this.collapsed);
  }

  toggleSubMenu(menu: string) {
    this.openMenus[menu] = !this.openMenus[menu];
  }

  isSubMenuOpen(menu: string): boolean {
    return !!this.openMenus[menu];
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, {
      paths: 'exact',
      queryParams: 'exact',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }
}
