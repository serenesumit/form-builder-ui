import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GridModule, PageSettingsModel, ToolbarItems } from '@syncfusion/ej2-angular-grids';
import { FormBuilderApiService } from '@core/services/form-builder-api.service';
import { FormBuilderDto } from '@core/models/form-builder.models';

@Component({
  selector: 'app-form-list',
  standalone: true,
  imports: [CommonModule, GridModule],
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss']
})
export class FormListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly apiService = inject(FormBuilderApiService);

  // Signals
  readonly forms = signal<FormBuilderDto[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Grid settings
  pageSettings: PageSettingsModel = { pageSize: 10, pageSizes: [10, 20, 50, 100] };
  toolbar: ToolbarItems[] = ['Search'];

  ngOnInit(): void {
    // Note: The API doesn't have a "list all forms" endpoint in the documentation
    // This would typically be added to the API, or forms would be loaded differently
    // For now, this is a placeholder for when that endpoint is available
    this.loadForms();
  }

  loadForms(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Placeholder - would call apiService.getAllForms() when available
    // For demo purposes, setting empty array
    setTimeout(() => {
      this.forms.set([]);
      this.isLoading.set(false);
    }, 500);
  }

  onCreateNew(): void {
    this.router.navigate(['/forms/new']);
  }

  onEdit(definitionId: string): void {
    this.router.navigate(['/forms/edit', definitionId]);
  }

  onView(definitionId: string): void {
    this.router.navigate(['/forms/view', definitionId]);
  }

  onDelete(definitionId: string): void {
    // Would implement delete functionality when API supports it
    if (confirm('Are you sure you want to delete this form?')) {
      console.log('Delete form:', definitionId);
      // API call would go here
    }
  }
}
