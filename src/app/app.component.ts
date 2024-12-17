import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';
import { CommonModule } from '@angular/common';
// import { AuthService } from './services/auth.service';
// import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isLogin = true;
  isSidebarOpen = false;
  appName: string = '';
  appLogo: string = '';
  appFavicon: string = '';
  isActiveRoute: boolean = false;
  selectedTemplate: any = null;

  constructor(private router: Router,
    private cdRef: ChangeDetectorRef
  ) {

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = this.router.url;
        this.isActiveRoute = currentUrl.startsWith('/project/') && currentUrl.includes('/ai-interactions');
        this.cdRef.detectChanges();
      }
    });
  }

  ngOnInit(): void {
    // this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
    //   this.isLogin = isLoggedIn;
    // });
  }



  updateMetaTags(): void {
    document.title = this.appName;
    const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = this.appFavicon;
    document.head.appendChild(link);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  title = this.appName;
}
