import {
  Component,
  OnInit,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  MatButtonModule,
} from '@angular/material/button';

import {
  MatTableModule,
} from '@angular/material/table';

import {
  OffersService,
  Offer,
} from './offers.service';

@Component({
  selector: 'app-offers',
  standalone: true,

  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
  ],

  templateUrl:
    './offers.component.html',

  styleUrl:
    './offers.component.scss',
})
export class OffersComponent
  implements OnInit {

  offers: Offer[] = [];

  displayedColumns = [
    'offerNumber',
    'customerName',
    'total',
    'status',
    'createdAt',
  ];

  loading = false;

  constructor(
    private readonly offersService:
      OffersService,
  ) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {

    this.loading = true;

    this.offersService
      .getOffers()
      .subscribe({
        next: offers => {

          this.offers = offers;

          this.loading = false;
        },

        error: error => {

          console.error(
            'Failed to load offers',
            error,
          );

          this.loading = false;
        },
      });
  }
}