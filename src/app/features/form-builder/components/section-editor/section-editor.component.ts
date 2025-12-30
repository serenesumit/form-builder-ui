import { Component, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { AccordionModule } from '@syncfusion/ej2-angular-navigations';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { FormBuilderService } from '@core/services/form-builder.service';
import { FormBuilderSectionRequest } from '@core/models/form-builder.models';
import { QuestionEditorComponent } from '../question-editor/question-editor.component';

@Component({
  selector: 'app-section-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TextBoxModule,
    ButtonModule,
    CheckBoxModule,
    AccordionModule,
    NumericTextBoxModule,
    QuestionEditorComponent
  ],
  templateUrl: './section-editor.component.html',
  styleUrls: ['./section-editor.component.scss']
})
export class SectionEditorComponent implements OnInit {
  @Input({ required: true }) sectionIndex!: number;
  @Input({ required: true }) section!: FormBuilderSectionRequest;

  readonly formBuilderService = inject(FormBuilderService);

  // Local signals for two-way binding
  sectionName = signal<string>('');
  sectionDescription = signal<string>('');
  sortOrder = signal<number>(0);
  isRepeatable = signal<boolean>(false);
  minRepeat = signal<number>(1);
  maxRepeat = signal<number | null>(null);
  progressIndicator = signal<boolean>(true);
  isCollapsible = signal<boolean>(false);

  isExpanded = signal<boolean>(true);

  ngOnInit(): void {
    this.loadSectionData();
  }

  loadSectionData(): void {
    this.sectionName.set(this.section.sectionName);
    this.sectionDescription.set(this.section.sectionDescription || '');
    this.sortOrder.set(this.section.sortOrder);
    this.isRepeatable.set(this.section.isRepeatable);
    this.minRepeat.set(this.section.minRepeat);
    this.maxRepeat.set(this.section.maxRepeat ?? null);
    this.progressIndicator.set(this.section.progressIndicator);
    this.isCollapsible.set(this.section.isCollapsible);
  }

  onSectionChange(): void {
    this.formBuilderService.updateSection(this.sectionIndex, {
      sectionName: this.sectionName(),
      sectionDescription: this.sectionDescription(),
      sortOrder: this.sortOrder(),
      isRepeatable: this.isRepeatable(),
      minRepeat: this.minRepeat(),
      maxRepeat: this.maxRepeat(),
      progressIndicator: this.progressIndicator(),
      isCollapsible: this.isCollapsible()
    });
  }

  onAddQuestion(): void {
    this.formBuilderService.addQuestion(this.sectionIndex);
  }

  onRemoveSection(): void {
    if (confirm('Are you sure you want to remove this section and all its questions?')) {
      this.formBuilderService.removeSection(this.sectionIndex);
    }
  }

  toggleExpanded(): void {
    this.isExpanded.set(!this.isExpanded());
  }
}
