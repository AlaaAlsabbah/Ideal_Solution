import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar-component/sidebar-component';
import { SidebarService } from './services/sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit, OnDestroy {
  protected readonly title = 'ideal';
  isCollapsed = false;
  private subscription!: Subscription; // Use ! to assert it will be assigned

  constructor(private sidebarService: SidebarService) {}

  ngOnInit() {
    this.subscription = this.sidebarService.collapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // Clean up subscription
  }
}