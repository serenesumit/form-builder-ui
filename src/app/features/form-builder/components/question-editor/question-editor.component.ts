import { Component, Input, inject, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { ButtonModule, CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { FormBuilderService } from '@core/services/form-builder.service';
import { FormQuestionRequest, FormQuestionOptionRequest, QuestionTypeInfo } from '@core/models/form-builder.models';

@Component({
  selector: 'app-question-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TextBoxModule,
    ButtonModule,
    CheckBoxModule,
    DropDownListModule,
    NumericTextBoxModule
  ],
  templateUrl: './question-editor.component.html',
  styleUrls: ['./question-editor.component.scss']
})
export class QuestionEditorComponent implements OnInit {
  @Input({ required: true }) sectionIndex!: number;
  @Input({ required: true }) questionIndex!: number;
  @Input({ required: true }) question!: FormQuestionRequest;

  readonly formBuilderService = inject(FormBuilderService);

  // Question basic properties
  questionText = signal<string>('');
  questionCode = signal<string>('');
  questionTypeId = signal<number>(1);
  helpText = signal<string>('');
  placeholderText = signal<string>('');
  displayOrder = signal<number>(0);

  // Flags
  isRequired = signal<boolean>(false);
  isActive = signal<boolean>(true);
  isPhi = signal<boolean>(false);
  isCalculated = signal<boolean>(false);

  // Validation
  minValue = signal<number | null>(null);
  maxValue = signal<number | null>(null);
  minLength = signal<number | null>(null);
  maxLength = signal<number | null>(null);
  regexPattern = signal<string>('');
  regexErrorMessage = signal<string>('');

  // Styling
  backgroundColor = signal<string>('');
  borderColor = signal<string>('');
  height = signal<number | null>(null);

  // Clinical codes
  cptCode = signal<string>('');
  loincCode = signal<string>('');
  snomedCode = signal<string>('');

  // Calculated fields
  calculationFormula = signal<string>('');
  defaultValue = signal<string>('');

  isExpanded = signal<boolean>(false);
  showAdvanced = signal<boolean>(false);

  // Question types for dropdown
  questionTypes = computed(() => this.formBuilderService.questionTypes());
  selectedQuestionType = computed(() =>
    this.formBuilderService.getQuestionTypeById(this.questionTypeId())
  );
  supportsOptions = computed(() =>
    this.formBuilderService.questionTypeSupportsOptions(this.questionTypeId())
  );

  questionTypeFields = { text: 'name', value: 'id' };

  ngOnInit(): void {
    this.loadQuestionData();
  }

  loadQuestionData(): void {
    this.questionText.set(this.question.questionText);
    this.questionCode.set(this.question.questionCode || '');
    this.questionTypeId.set(this.question.questionTypeId);
    this.helpText.set(this.question.helpText || '');
    this.placeholderText.set(this.question.placeholderText || '');
    this.displayOrder.set(this.question.displayOrder);

    this.isRequired.set(this.question.isRequired);
    this.isActive.set(this.question.isActive);
    this.isPhi.set(this.question.isPhi);
    this.isCalculated.set(this.question.isCalculated);

    this.minValue.set(this.question.minValue ?? null);
    this.maxValue.set(this.question.maxValue ?? null);
    this.minLength.set(this.question.minLength ?? null);
    this.maxLength.set(this.question.maxLength ?? null);
    this.regexPattern.set(this.question.regexPattern || '');
    this.regexErrorMessage.set(this.question.regexErrorMessage || '');

    this.backgroundColor.set(this.question.backgroundColor || '');
    this.borderColor.set(this.question.borderColor || '');
    this.height.set(this.question.height ?? null);

    this.cptCode.set(this.question.cptCode || '');
    this.loincCode.set(this.question.loincCode || '');
    this.snomedCode.set(this.question.snomedCode || '');

    this.calculationFormula.set(this.question.calculationFormula || '');
    this.defaultValue.set(this.question.defaultValue || '');
  }

  onQuestionChange(): void {
    this.formBuilderService.updateQuestion(this.sectionIndex, this.questionIndex, {
      questionText: this.questionText(),
      questionCode: this.questionCode(),
      questionTypeId: this.questionTypeId(),
      helpText: this.helpText(),
      placeholderText: this.placeholderText(),
      displayOrder: this.displayOrder(),
      isRequired: this.isRequired(),
      isActive: this.isActive(),
      isPhi: this.isPhi(),
      isCalculated: this.isCalculated(),
      minValue: this.minValue(),
      maxValue: this.maxValue(),
      minLength: this.minLength(),
      maxLength: this.maxLength(),
      regexPattern: this.regexPattern(),
      regexErrorMessage: this.regexErrorMessage(),
      backgroundColor: this.backgroundColor(),
      borderColor: this.borderColor(),
      height: this.height(),
      cptCode: this.cptCode(),
      loincCode: this.loincCode(),
      snomedCode: this.snomedCode(),
      calculationFormula: this.calculationFormula(),
      defaultValue: this.defaultValue()
    });
  }

  onAddOption(): void {
    const newOption: FormQuestionOptionRequest = {
      optionId: null,
      optionText: 'New Option',
      optionValue: '',
      numericScore: null,
      displayOrder: this.question.options.length
    };

    this.formBuilderService.updateQuestion(this.sectionIndex, this.questionIndex, {
      options: [...this.question.options, newOption]
    });
  }

  onUpdateOption(optionIndex: number, updates: Partial<FormQuestionOptionRequest>): void {
    const updatedOptions = [...this.question.options];
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], ...updates };

    this.formBuilderService.updateQuestion(this.sectionIndex, this.questionIndex, {
      options: updatedOptions
    });
  }

  onRemoveOption(optionIndex: number): void {
    const updatedOptions = this.question.options.filter((_, i) => i !== optionIndex);
    this.formBuilderService.updateQuestion(this.sectionIndex, this.questionIndex, {
      options: updatedOptions
    });
  }

  onRemoveQuestion(): void {
    if (confirm('Are you sure you want to remove this question?')) {
      this.formBuilderService.removeQuestion(this.sectionIndex, this.questionIndex);
    }
  }

  toggleExpanded(): void {
    this.isExpanded.set(!this.isExpanded());
  }

  toggleAdvanced(): void {
    this.showAdvanced.set(!this.showAdvanced());
  }
}
