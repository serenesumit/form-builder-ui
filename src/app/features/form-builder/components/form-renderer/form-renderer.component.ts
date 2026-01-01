import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TextBoxModule, NumericTextBoxModule, SliderModule } from '@syncfusion/ej2-angular-inputs';
import { ButtonModule, CheckBoxModule, RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule, TimePickerModule, DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
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

  getScaleOptions(question: FormQuestionRequest): number[] {
    const min = question.minValue ?? 1;
    const max = question.maxValue ?? 5;
    const options: number[] = [];
    for (let i = min; i <= max; i++) {
      options.push(i);
    }
    return options;
  }
}
