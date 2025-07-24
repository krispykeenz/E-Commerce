import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  selectedCategory: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get category from query params if available
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || '';
    });
  }
}
