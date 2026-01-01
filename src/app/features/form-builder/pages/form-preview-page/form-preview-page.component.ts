import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormPreviewComponent } from '../../components/form-preview/form-preview.component';
import { FormBuilderApiService } from '@core/services/form-builder-api.service';
import { FormBuilderDto, FormVersionDto } from '@core/models/form-builder.models';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { TabModule, SelectEventArgs } from '@syncfusion/ej2-angular-navigations';
import { DropDownListModule, ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';

export type ViewMode = 'scroll' | 'tabs';

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
    ButtonModule,
    TabModule,
    DropDownListModule
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
  viewMode = signal<ViewMode>('scroll');
  selectedTabIndex = signal<number>(0);

  // Version management
  definitionId = signal<string | null>(null);
  versions = signal<FormVersionDto[]>([]);
  isLoadingVersions = signal<boolean>(false);
  selectedVersionId = signal<string | undefined>(undefined);

  // Dropdown field configuration
  versionFields = { text: 'displayText', value: 'versionId' };

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
    const definitionIdParam = this.route.snapshot.paramMap.get('id');
    const versionIdParam = this.route.snapshot.paramMap.get('versionId');

    if (!definitionIdParam && !versionIdParam) {
      this.error.set('Form ID is required');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    // Store definitionId for loading versions
    if (definitionIdParam) {
      this.definitionId.set(definitionIdParam);
    }

    // If versionId is provided, load that specific version
    if (versionIdParam) {
      this.loadByVersionId(versionIdParam);
    }
    // Otherwise, load the latest version by definitionId
    else if (definitionIdParam) {
      this.loadByDefinitionId(definitionIdParam);
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
        const currentVersionId = formData.versionId || formData.latestVersionId;
        this.versionId.set(currentVersionId);
        this.selectedVersionId.set(currentVersionId);
        this.definitionId.set(formData.definitionId);
        this.isLoading.set(false);

        // Load all versions for this form
        this.loadVersions(formData.definitionId);
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
        this.selectedVersionId.set(formData.versionId);
        this.definitionId.set(formData.definitionId);
        this.isLoading.set(false);

        // Load all versions for this form
        this.loadVersions(formData.definitionId);
      },
      error: (err) => {
        console.error('Error loading form version:', err);
        this.error.set(err.message || 'Failed to load form preview');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Load all versions for the form
   */
  private loadVersions(definitionId: string): void {
    this.isLoadingVersions.set(true);

    this.formBuilderApi.getFormVersions(definitionId).subscribe({
      next: (versions) => {
        // Sort by version number descending (latest first) and add display text
        const sortedVersions = versions
          .sort((a, b) => b.versionNumber - a.versionNumber)
          .map(v => ({
            ...v,
            displayText: this.formatVersionLabel(v)
          }));
        this.versions.set(sortedVersions);
        this.isLoadingVersions.set(false);
      },
      error: (err) => {
        console.error('Error loading versions:', err);
        this.isLoadingVersions.set(false);
      }
    });
  }

  /**
   * Format version label for display
   */
  private formatVersionLabel(version: FormVersionDto): string {
    const date = new Date(version.createdDate).toLocaleDateString();
    const statusBadge = version.status === 'Published' ? ' (Published)' :
                        version.status === 'Draft' ? ' (Draft)' :
                        version.status === 'Archived' ? ' (Archived)' : '';
    return `v${version.versionNumber}${version.versionLabel ? ' - ' + version.versionLabel : ''}${statusBadge} - ${date}`;
  }

  /**
   * Handle version change from dropdown
   */
  onVersionChange(event: ChangeEventArgs): void {
    const newVersionId = event.value as string;
    if (newVersionId && newVersionId !== this.selectedVersionId()) {
      this.selectedVersionId.set(newVersionId);
      this.isLoading.set(true);

      // Load the selected version
      this.formBuilderApi.getFormByVersionId(newVersionId).subscribe({
        next: (formData) => {
          this.formDefinition.set(formData);
          this.formName.set(formData.name || 'Form Preview');
          this.versionId.set(formData.versionId);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading form version:', err);
          this.error.set(err.message || 'Failed to load form version');
          this.isLoading.set(false);
        }
      });
    }
  }

  /**
   * Get the currently selected version info
   */
  getSelectedVersionInfo(): FormVersionDto | undefined {
    const vId = this.selectedVersionId();
    return this.versions().find(v => v.versionId === vId);
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

  /**
   * Set view mode (scroll or tabs)
   */
  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  /**
   * Get questions for a specific section
   */
  getSectionQuestions(sectionId: string) {
    return this.getQuestions().filter(q => q.sectionId === sectionId);
  }

  /**
   * Handle tab selection event (like FormEditorComponent)
   */
  onTabSelected(event: SelectEventArgs): void {
    this.selectedTabIndex.set(event.selectedIndex);
  }
}
