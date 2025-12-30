import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormPreviewComponent } from '../../components/form-preview/form-preview.component';
import { FormBuilderApiService } from '@core/services/form-builder-api.service';
import { FormBuilderDto } from '@core/models/form-builder.models';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

/**
 * FormPreviewPage Component
 *
 * Displays a preview of a form/questionnaire in read-only mode.
 * Based on the React FormPreviewPage from behavioral-health-emr.
 *
 * Usage:
 * - Navigate to /forms/preview/:definitionId to preview the latest version of a form
 * - Navigate to /forms/preview/version/:versionId to preview a specific version
 */
@Component({
  selector: 'app-form-preview-page',
  standalone: true,
  imports: [
    CommonModule,
    FormPreviewComponent,
    ButtonModule
  ],
  templateUrl: './form-preview-page.component.html',
  styleUrls: ['./form-preview-page.component.scss']
})
export class FormPreviewPageComponent implements OnInit {
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  formName = signal<string>('');
  formDefinition = signal<FormBuilderDto | null>(null);
  versionId = signal<string | undefined>(undefined);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilderApi: FormBuilderApiService
  ) {}

  ngOnInit(): void {
    this.loadForm();
  }

  /**
   * Load the form based on route parameters
   * Supports both definitionId and versionId parameters
   */
  private loadForm(): void {
    const definitionId = this.route.snapshot.paramMap.get('id');
    const versionIdParam = this.route.snapshot.paramMap.get('versionId');

    if (!definitionId && !versionIdParam) {
      this.error.set('Form ID is required');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    // If versionId is provided, load that specific version
    if (versionIdParam) {
      this.loadByVersionId(versionIdParam);
    }
    // Otherwise, load the latest version by definitionId
    else if (definitionId) {
      this.loadByDefinitionId(definitionId);
    }
  }

  /**
   * Load form by definition ID (latest version)
   */
  private loadByDefinitionId(definitionId: string): void {
    this.formBuilderApi.getFormByDefinitionId(definitionId).subscribe({
      next: (formData) => {
        this.formDefinition.set(formData);
        this.formName.set(formData.name || 'Form Preview');
        this.versionId.set(formData.versionId || formData.latestVersionId);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading form:', err);
        this.error.set(err.message || 'Failed to load form preview');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Load form by version ID (specific version)
   */
  private loadByVersionId(versionId: string): void {
    this.formBuilderApi.getFormByVersionId(versionId).subscribe({
      next: (formData) => {
        this.formDefinition.set(formData);
        this.formName.set(formData.name || 'Form Preview');
        this.versionId.set(formData.versionId);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading form version:', err);
        this.error.set(err.message || 'Failed to load form preview');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Handle back navigation
   */
  handleBackClick(): void {
    this.router.navigate(['/forms']);
  }

  /**
   * Retry loading the form
   */
  handleRetry(): void {
    this.loadForm();
  }

  /**
   * Get sections from form definition
   */
  getSections() {
    const form = this.formDefinition();
    return form?.sections || [];
  }

  /**
   * Get questions from form definition
   * Handles both sectioned and legacy flat structure
   */
  getQuestions() {
    const form = this.formDefinition();

    // If form has sections, extract questions from sections
    if (form?.sections && form.sections.length > 0) {
      return form.sections.flatMap(section => section.questions || []);
    }

    // Fallback to legacy flat structure
    return form?.questions || [];
  }
}
