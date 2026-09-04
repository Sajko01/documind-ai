import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
})
export class DocumentViewerComponent implements OnInit, OnDestroy {
  documentId: string | null = null;
  page = 1;
  pdfUrl?: SafeResourceUrl;
  loading = true;
  errorMessage = '';

  private currentBlobUrl?: string;
  private sub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    private readonly http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.sub = combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
    ]).subscribe(([params, queryParams]) => {
      const newId = params.get('id');
      const pageParam = queryParams.get('page');
      this.page = pageParam ? Number(pageParam) || 1 : 1;

      if (newId && newId !== this.documentId) {
        this.documentId = newId;
        this.fetchPdfFile(this.documentId);
      } else if (this.currentBlobUrl) {
        // Ako se promenila samo stranica na istom dokumentu
        this.updateSafeUrl(this.currentBlobUrl);
      }
    });
  }

  private fetchPdfFile(id: string): void {
    this.loading = true;
    this.errorMessage = '';

    // HTTP zahtev sa responseType: 'blob' prolazi kroz Angular Interceptor koji dodaje Token
    this.http
      .get(`http://localhost:3000/api/documents/${id}/file`, {
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl); // Oslobađanje memorije
          }
          this.currentBlobUrl = URL.createObjectURL(blob);
          this.updateSafeUrl(this.currentBlobUrl);
          this.loading = false;
        },
        error: (err) => {
          console.error('Greška pri učitavanju PDF-a:', err);
          this.errorMessage = 'Greška pri učitavanju dokumenta (401 Unauthorized ili nepostojeći fajl).';
          this.loading = false;
        },
      });
  }

  private updateSafeUrl(blobUrl: string): void {
    const rawUrl = `${blobUrl}#page=${this.page}`;
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
    }
  }
}