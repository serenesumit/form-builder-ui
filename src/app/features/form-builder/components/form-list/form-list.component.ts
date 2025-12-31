import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GridModule, PageSettingsModel, ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { timeout, catchError, of, finalize } from 'rxjs';
import { FormBuilderApiService } from '@core/services/form-builder-api.service';
import { FormListItemDto } from '@core/models/form-builder.models';

@Component({
  selector: 'app-form-list',
  standalone: true,
  imports: [CommonModule, GridModule, ButtonModule],
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss']
})
export class FormListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly apiService = inject(FormBuilderApiService);

  // Signals
  readonly forms = signal<FormListItemDto[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Grid settings
  pageSettings: PageSettingsModel = { pageSize: 10, pageSizes: [10, 20, 50, 100] };
  toolbar: ToolbarItems[] = ['Search'];

  ngOnInit(): void {
    this.loadForms();
  }

  loadForms(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiService.getAllForms().pipe(
      timeout(10000), // 10 second timeout
      catchError((error) => {
        const errorMessage = error.name === 'TimeoutError'
          ? 'Request timed out. Please check if the API server is running.'
          : error.message || 'Failed to load forms';
        this.error.set(errorMessage);
        return of([]);
      }),
      finalize(() => this.isLoading.set(false)) // Always stop loading
    ).subscribe({
      next: (forms) => {
        this.forms.set(forms);
      }
    });
  }

  onCreateNew(): void {
    this.router.navigate(['/forms/new']);
  }

  onEdit(definitionId: string): void {
    this.router.navigate(['/forms/edit', definitionId]);
  }

  onView(definitionId: string): void {
    this.router.navigate(['/forms/preview', definitionId]);
  }

  onFillForm(definitionId: string): void {
    // For demo purposes, using placeholder values
    // In a real app, these would come from the current user/patient context
    const tenantId = '11111111-1111-1111-1111-111111111111'; // Use the same tenant ID as environment
    const patientId = '00000000-0000-0000-0000-000000000002'; // Replace with actual patient ID

    // First, get the form to find its latest version ID
    this.apiService.getFormByDefinitionId(definitionId).subscribe({
      next: (form: any) => {
        // Use the versionId from the form data
        const versionId = form.versionId || definitionId;
        this.router.navigate(['/forms/fill', tenantId, versionId, patientId]);
      },
      error: (error) => {
        console.error('Error loading form for filling:', error);
        alert('Failed to load form. Please try again.');
      }
    });
  }

  onDelete(definitionId: string): void {
    // Would implement delete functionality when API supports it
    if (confirm('Are you sure you want to delete this form?')) {
      console.log('Delete form:', definitionId);
      // API call would go here
    }
  }
}
