import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormBuilderStoreService } from '../../services/form-builder-store.service';
import { FormBuilderApiService } from '@core/services/form-builder-api.service';
import { ComponentPaletteComponent } from '../component-palette/component-palette.component';
import { FormCanvasComponent } from '../form-canvas/form-canvas.component';
import { PropertiesPanelComponent } from '../properties-panel/properties-panel.component';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    ComponentPaletteComponent,
    FormCanvasComponent,
    PropertiesPanelComponent
  ],
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiService = inject(FormBuilderApiService);
  readonly store = inject(FormBuilderStoreService);

  definitionId = signal<string | null>(null);
  showMetadataModal = signal<boolean>(false);
  
  // Metadata form values
  formCode = '';
  formName = '';
  formDescription = '';
  formCategory = '';
  isStandard = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && id !== 'new') {
      this.definitionId.set(id);
      this.loadForm(id);
    } else {
      this.store.initializeNewForm();
      // Show metadata modal for new forms
      this.showMetadataModal.set(true);
    }
    
    // Sync metadata with store
    this.syncMetadataFromStore();
  }

  private loadForm(definitionId: string): void {
    this.store.setLoading(true);
    this.store.setError(null);
    
    this.apiService.getFormByDefinitionId(definitionId).subscribe({
      next: (formData) => {
        this.store.loadFormFromApi(formData);
        this.syncMetadataFromStore();
        this.store.setLoading(false);
      },
      error: (error) => {
        this.store.setError(error.message || 'Failed to load form');
        this.store.setLoading(false);
        // Initialize empty form on error
        this.store.initializeNewForm();
      }
    });
  }

  syncMetadataFromStore(): void {
    const metadata = this.store.metadata();
    this.formCode = metadata.code;
    this.formName = metadata.name;
    this.formDescription = metadata.description || '';
    this.formCategory = metadata.category || '';
    this.isStandard = metadata.isStandard;
  }

  openMetadataModal(): void {
    this.syncMetadataFromStore();
    this.showMetadataModal.set(true);
  }

  closeMetadataModal(): void {
    this.showMetadataModal.set(false);
  }

  saveMetadata(): void {
    this.store.updateMetadata({
      code: this.formCode,
      name: this.formName,
      description: this.formDescription,
      category: this.formCategory,
      isStandard: this.isStandard
    });
    this.showMetadataModal.set(false);
  }

  onSave(): void {
    const metadata = this.store.metadata();
    
    if (!metadata.code || !metadata.name) {
      this.openMetadataModal();
      return;
    }
    
    const sections = this.store.sections();
    if (sections.length === 0) {
      alert('Please add at least one section to the form');
      return;
    }
    
    const hasQuestions = sections.some(s => s.questions.length > 0);
    if (!hasQuestions) {
      alert('Please add at least one question to the form');
      return;
    }

    this.store.setSaving(true);
    
    const request = this.store.toSaveFormRequest();
    const saveObservable = this.definitionId()
      ? this.apiService.updateForm(this.definitionId()!, request)
      : this.apiService.createForm(request);

    saveObservable.subscribe({
      next: (result) => {
        this.store.setSaving(false);
        this.store.markAsSaved();
        alert(`Form saved successfully! Definition ID: ${result.definitionId}`);
        
        if (!this.definitionId()) {
          this.router.navigate(['/forms/edit', result.definitionId]);
        }
      },
      error: (error) => {
        this.store.setSaving(false);
        this.store.setError(error.message);
        alert(`Error saving form: ${error.message}`);
      }
    });
  }

  onPreview(): void {
    // TODO: Implement preview functionality
    alert('Preview functionality coming soon!');
  }

  onCancel(): void {
    if (this.store.isDirty()) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/forms']);
      }
    } else {
      this.router.navigate(['/forms']);
    }
  }

  onUndo(): void {
    // TODO: Implement undo
  }

  onRedo(): void {
    // TODO: Implement redo
  }
}

