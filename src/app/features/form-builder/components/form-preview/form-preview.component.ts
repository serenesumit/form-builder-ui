import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextBoxModule, NumericTextBoxModule, SliderModule } from '@syncfusion/ej2-angular-inputs';
import { ButtonModule, CheckBoxModule, RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule, TimePickerModule, DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import {
  FormBuilderSectionDto,
  FormBuilderQuestionDto,
  QuestionType
} from '@core/models/form-builder.models';

/**
 * FormPreview Component
 *
 * Renders a form in read-only mode for preview purposes.
 * Based on the React FormPreview component from behavioral-health-emr.
 */
@Component({
  selector: 'app-form-preview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TextBoxModule,
    NumericTextBoxModule,
    SliderModule,
    ButtonModule,
    CheckBoxModule,
    RadioButtonModule,
    DatePickerModule,
    TimePickerModule,
    DateTimePickerModule,
    DropDownListModule,
    MultiSelectModule
  ],
  templateUrl: './form-preview.component.html',
  styleUrls: ['./form-preview.component.scss']
})
export class FormPreviewComponent implements OnInit {
  @Input({ required: true }) sections: FormBuilderSectionDto[] = [];
  @Input({ required: true }) questions: FormBuilderQuestionDto[] = [];
  @Input() readonly: boolean = false;
  @Input() initialData: Record<string, any> = {};

  readonly QuestionType = QuestionType;

  formData = signal<Record<string, any>>({});
  errors = signal<Record<string, string>>({});

  ngOnInit(): void {
    // Initialize form data with initial values
    this.formData.set({ ...this.initialData });
  }

  /**
   * Get sections sorted by sortOrder
   */
  getSortedSections(): FormBuilderSectionDto[] {
    return [...this.sections].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Get questions for a specific section, sorted by displayOrder/sortOrder
   */
  getSectionQuestions(sectionId: string): FormBuilderQuestionDto[] {
    return this.questions
      .filter(q => q.sectionId === sectionId)
      .sort((a, b) => {
        const orderA = a.displayOrder ?? a.sortOrder ?? 0;
        const orderB = b.displayOrder ?? b.sortOrder ?? 0;
        return orderA - orderB;
      });
  }

  /**
   * Handle question value change
   */
  handleQuestionChange(questionId: string, value: any): void {
    if (this.readonly) return;

    this.formData.update(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Clear error when field is modified
    if (this.errors()[questionId]) {
      this.errors.update(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  }

  /**
   * Get value for a question
   */
  getQuestionValue(questionId: string): any {
    return this.formData()[questionId];
  }

  /**
   * Validate the form
   */
  validateForm(): boolean {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    this.questions.forEach(q => {
      if (q.isRequired && !this.formData()[q.questionId]) {
        newErrors[q.questionId] = 'This field is required';
        isValid = false;
      }
    });

    this.errors.set(newErrors);
    return isValid;
  }

  /**
   * Handle form submission
   */
  handleSubmit(): void {
    if (this.validateForm()) {
      console.log('Form submitted:', this.formData());
      // Emit event or call service to submit form data
    }
  }

  /**
   * Get error message for a question
   */
  getError(questionId: string): string | undefined {
    return this.errors()[questionId];
  }

  /**
   * Get dropdown fields configuration
   */
  getDropdownFields() {
    return { text: 'optionText', value: 'optionValue' };
  }

  /**
   * Check if question type supports options
   */
  supportsOptions(questionTypeId: number): boolean {
    return [
      QuestionType.Radio,
      QuestionType.Checkbox,
      QuestionType.Dropdown,
      QuestionType.Rating
    ].includes(questionTypeId);
  }

  /**
   * Handle checkbox change event
   */
  handleCheckboxChange(questionId: string, optionValue: string, checked: boolean): void {
    if (this.readonly) return;

    const currentValues = this.formData()[questionId] || [];
    let newValues: string[];

    if (checked) {
      // Add the value if checked
      newValues = [...currentValues, optionValue];
    } else {
      // Remove the value if unchecked
      newValues = currentValues.filter((v: string) => v !== optionValue);
    }

    this.handleQuestionChange(questionId, newValues);
  }

  /**
   * Check if a checkbox option is selected
   */
  isCheckboxSelected(questionId: string, optionValue: string): boolean {
    const values = this.formData()[questionId] || [];
    return values.includes(optionValue);
  }
}
