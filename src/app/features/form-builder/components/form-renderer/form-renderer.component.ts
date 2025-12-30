import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TextBoxModule, NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { ButtonModule, CheckBoxModule, RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule, TimePickerModule, DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { SaveFormRequest, FormBuilderSectionRequest, FormQuestionRequest, QuestionType } from '@core/models/form-builder.models';

@Component({
  selector: 'app-form-renderer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TextBoxModule,
    NumericTextBoxModule,
    ButtonModule,
    CheckBoxModule,
    RadioButtonModule,
    DatePickerModule,
    TimePickerModule,
    DateTimePickerModule,
    DropDownListModule
  ],
  templateUrl: './form-renderer.component.html',
  styleUrls: ['./form-renderer.component.scss']
})
export class FormRendererComponent {
  @Input({ required: true }) formDefinition!: SaveFormRequest;

  readonly QuestionType = QuestionType;

  // For dynamic form data collection
  formData = signal<Record<string, any>>({});

  getQuestionValue(questionId: string): any {
    return this.formData()[questionId];
  }

  setQuestionValue(questionId: string, value: any): void {
    this.formData.update(data => ({
      ...data,
      [questionId]: value
    }));
  }

  onSubmit(): void {
    console.log('Form submitted with data:', this.formData());
    // Validation and submission logic would go here
  }

  getQuestionId(sectionIndex: number, questionIndex: number): string {
    return `q_${sectionIndex}_${questionIndex}`;
  }

  isQuestionRequired(question: FormQuestionRequest): boolean {
    return question.isRequired;
  }

  getDropdownFields() {
    return { text: 'optionText', value: 'optionValue' };
  }
}
