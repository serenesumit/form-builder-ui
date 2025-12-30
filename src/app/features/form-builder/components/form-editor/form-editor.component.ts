import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { TabModule, SelectEventArgs } from '@syncfusion/ej2-angular-navigations';
import { FormBuilderService } from '@core/services/form-builder.service';
import { SaveFormRequest } from '@core/models/form-builder.models';
import { SectionEditorComponent } from '../section-editor/section-editor.component';
import { FormRendererComponent } from '../form-renderer/form-renderer.component';

@Component({
  selector: 'app-form-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TextBoxModule,
    ButtonModule,
    CheckBoxModule,
    TabModule,
    SectionEditorComponent,
    FormRendererComponent
  ],
  templateUrl: './form-editor.component.html',
  styleUrls: ['./form-editor.component.scss']
})
export class FormEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly formBuilderService = inject(FormBuilderService);

  definitionId = signal<string | null>(null);
  selectedTabIndex = signal<number>(0);

  // Form metadata bindings
  formCode = signal<string>('');
  formName = signal<string>('');
  formDescription = signal<string>('');
  formCategory = signal<string>('');
  isStandard = signal<boolean>(false);

  constructor() {
    // Sync form metadata with service
    effect(() => {
      const form = this.formBuilderService.currentForm();
      if (form) {
        this.formCode.set(form.code);
        this.formName.set(form.name);
        this.formDescription.set(form.description || '');
        this.formCategory.set(form.category || '');
        this.isStandard.set(form.isStandard);
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'new') {
      this.definitionId.set(id);
      this.formBuilderService.loadForm(id);
    } else {
      this.formBuilderService.initializeNewForm();
    }
  }

  onMetadataChange(): void {
    this.formBuilderService.updateFormMetadata({
      code: this.formCode(),
      name: this.formName(),
      description: this.formDescription(),
      category: this.formCategory(),
      isStandard: this.isStandard()
    });
  }

  onAddSection(): void {
    this.formBuilderService.addSection();
    // Switch to sections tab
    this.selectedTabIndex.set(1);
  }

  onSave(): void {
    const form = this.formBuilderService.currentForm();

    // Basic validation
    if (!form) {
      alert('No form to save');
      return;
    }

    if (!form.code || !form.name) {
      alert('Form code and name are required');
      return;
    }

    if (form.sections.length === 0) {
      alert('At least one section is required');
      return;
    }

    this.formBuilderService.saveForm(this.definitionId() || undefined);
  }

  onCancel(): void {
    if (this.formBuilderService.hasUnsavedChanges()) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/forms']);
      }
    } else {
      this.router.navigate(['/forms']);
    }
  }

  onPreview(): void {
    const form = this.formBuilderService.currentForm();
    if (!form) {
      alert('No form to preview');
      return;
    }

    // Navigate to preview page
    const id = this.definitionId();
    if (id) {
      // If editing existing form, navigate to preview by definition ID
      this.router.navigate(['/forms/preview', id]);
    } else {
      // If creating new form, show alert that form must be saved first
      alert('Please save the form first before previewing. The preview feature requires a saved form.');
    }
  }

  onTabSelected(event: SelectEventArgs): void {
    this.selectedTabIndex.set(event.selectedIndex);
  }
}
