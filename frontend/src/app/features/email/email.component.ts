import {
  Component,
  OnInit,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  FormsModule,
} from '@angular/forms';

import {
  MatButtonModule,
} from '@angular/material/button';

import {
  MatFormFieldModule,
} from '@angular/material/form-field';

import {
  MatInputModule,
} from '@angular/material/input';

import {
  MatSelectModule,
} from '@angular/material/select';

import {
  EmailService,
  EmailType,
  GenerateEmailResponse,
} from './email.service';

import {
  OffersService,
} from '../offers/offers.service';

@Component({
  selector: 'app-email',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],

  templateUrl:
    './email.component.html',

  styleUrl:
    './email.component.scss',
})
export class EmailComponent implements OnInit {

  emailType: EmailType = 'sales';

  recipientName = '';

  recipientEmail = '';

  subject = '';

  language = 'en';

  tone = 'professional';

  generatedEmail:
    GenerateEmailResponse | null = null;

  loading = false;

  error = '';

  // Dodato za Edit mode
  editing = false;

  // Polja za izabrane ponude
  offers: any[] = [];
  selectedOfferId = '';

  constructor(
    private readonly emailService:
      EmailService,
    private readonly offersService:
      OffersService,
  ) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.offersService.getOffers().subscribe({
      next: (data) => {
        this.offers = data;
      },
      error: (err) => {
        console.error('Failed to load offers', err);
        this.error = 'Failed to load offers list.';
      },
    });
  }

  generateEmail(): void {

    if (!this.selectedOfferId) {

      this.error =
        'Please select an offer.';

      return;
    }

    this.loading = true;

    this.error = '';

    this.generatedEmail = null;

    // Kada generišemo novi mejl, obavezno gasimo edit mode ako je bio uključen
    this.editing = false;

   this.emailService
      .generateEmail({
        emailType: this.emailType,
        recipientName: this.recipientName,
        recipientEmail: this.recipientEmail,
        subject: this.subject,
        offerId: this.selectedOfferId,
        language: this.language,
        tone: this.tone,
        context: `Generisanje email-a za ponudu ID: ${this.selectedOfferId}`, // 👈 DODAJ OVO! (ili prosledi neki drugi opisni tekst kao kontekst)
      })

      .subscribe({

        next: result => {

          this.generatedEmail =
            result;

          this.loading = false;
        },

        error: error => {

          console.error(
            'Email generation failed',
            error,
          );

          this.error =
            'Failed to generate email.';

          this.loading = false;
        },
      });
  }

  async copyEmail(): Promise<void> {

    if (!this.generatedEmail) {
      return;
    }

    const text =
      `Subject: ${this.generatedEmail.subject}\n\n${this.generatedEmail.body}`;

    await navigator.clipboard.writeText(
      text,
    );
  }

  // Metode za upravljanje editovanjem
  startEditing(): void {
    this.editing = true;
  }

  finishEditing(): void {
    this.editing = false;
  }
}