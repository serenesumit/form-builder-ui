import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TextBoxModule, NumericTextBoxModule, SliderModule } from '@syncfusion/ej2-angular-inputs';
import { ButtonModule, CheckBoxModule, RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule, TimePickerModule, DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { FormBuilderApiService } from '@core/services/form-builder-api.service';
import {
  FormBuilderDto,
  FormBuilderQuestionDto,
  FormBuilderSectionDto,
  QuestionType,
  SaveAllFormResponsesRequest,
  SaveResponseAnswerRequest,
  FormAnswer
} from '@core/models/form-builder.models';

/**
 * Form Fill Page Component
 * 
 * Allows users to fill out a questionnaire form and save their responses.
 * Uses the SaveAllFormResponses API endpoint to save all answers in bulk.
 */
@Component({
  selector: 'app-form-fill-page',
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
    MultiSelectModule,
    DialogModule
  ],
  templateUrl: './form-fill-page.component.html',
  styleUrls: ['./form-fill-page.component.scss']
})
export class FormFillPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilderApi = inject(FormBuilderApiService);

  // State signals
  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  readonly saveSuccess = signal<boolean>(false);
  readonly formDefinition = signal<FormBuilderDto | null>(null);
  readonly versionId = signal<string | undefined>(undefined);
  
  // Form data - stores all answers keyed by questionId
  readonly formData = signal<Record<string, FormAnswer>>({});
  
  // Validation errors from server
  readonly validationErrors = signal<Record<string, string>>({});
  
  // Completion tracking
  readonly completionPercentage = signal<number>(0);
  readonly responseId = signal<string | null>(null);

  // Patient info (in real app, this would come from context/auth)
  readonly patientId = signal<number>(11222); // Default patient ID

  // Question types enum for template
  readonly QuestionType = QuestionType;

  // Computed properties
  readonly formName = computed(() => this.formDefinition()?.name || 'Form');
  readonly sections = computed(() => this.formDefinition()?.sections || []);
  
  readonly totalQuestions = computed(() => {
    const sections = this.sections();
    return sections.reduce((total, section) => {
      const activeQuestions = section.questions?.filter(q => this.isAnswerableQuestion(q)) || [];
      return total + activeQuestions.length;
    }, 0);
  });

  readonly answeredQuestions = computed(() => {
    const data = this.formData();
    return Object.values(data).filter(a => a.answerValue !== undefined && a.answerValue !== '').length;
  });

  readonly calculatedCompletion = computed(() => {
    const total = this.totalQuestions();
    if (total === 0) return 0;
    return Math.round((this.answeredQuestions() / total) * 100);
  });

  // Dialog visibility
  showSuccessDialog = signal<boolean>(false);

  ngOnInit(): void {
    this.loadForm();
  }

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

    if (versionIdParam) {
      this.loadByVersionId(versionIdParam);
    } else if (definitionId) {
      this.loadByDefinitionId(definitionId);
    }
  }

  private loadByDefinitionId(definitionId: string): void {
    this.formBuilderApi.getFormByDefinitionId(definitionId).subscribe({
      next: (formData) => {
        this.formDefinition.set(formData);
        this.versionId.set(formData.versionId || formData.latestVersionId);
        this.initializeFormData(formData);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading form:', err);
        this.error.set(err.message || 'Failed to load form');
        this.isLoading.set(false);
      }
    });
  }

  private loadByVersionId(versionId: string): void {
    this.formBuilderApi.getFormByVersionId(versionId).subscribe({
      next: (formData) => {
        this.formDefinition.set(formData);
        this.versionId.set(formData.versionId);
        this.initializeFormData(formData);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading form version:', err);
        this.error.set(err.message || 'Failed to load form');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Initialize form data with default values
   */
  private initializeFormData(form: FormBuilderDto): void {
    const data: Record<string, FormAnswer> = {};
    
    form.sections?.forEach(section => {
      section.questions?.forEach(question => {
        if (this.isAnswerableQuestion(question)) {
          data[question.questionId] = {
            questionId: question.questionId,
            answerValue: question.defaultValue || ''
          };
        }
      });
    });
    
    this.formData.set(data);
  }

  /**
   * Check if a question type requires an answer (not display-only)
   */
  private isAnswerableQuestion(question: FormBuilderQuestionDto): boolean {
    const displayOnlyTypes = [
      QuestionType.Display,
      QuestionType.Hidden,
      QuestionType.RichTextBlock
    ];
    return !displayOnlyTypes.includes(question.questionTypeId);
  }

  /**
   * Get answer value for a question
   */
  getAnswerValue(questionId: string): string {
    return this.formData()[questionId]?.answerValue || '';
  }

  /**
   * Set answer value for a question
   */
  setAnswerValue(questionId: string, value: any, optionId?: string): void {
    this.formData.update(data => ({
      ...data,
      [questionId]: {
        ...data[questionId],
        questionId,
        answerValue: value?.toString() || '',
        optionId
      }
    }));
    
    // Clear validation error when user provides input
    this.validationErrors.update(errors => {
      const newErrors = { ...errors };
      delete newErrors[questionId];
      return newErrors;
    });
  }

  /**
   * Get checkbox values (multiple selection)
   */
  getCheckboxValues(questionId: string): string[] {
    const answer = this.formData()[questionId]?.answerValue;
    if (!answer) return [];
    try {
      return JSON.parse(answer);
    } catch {
      return answer ? [answer] : [];
    }
  }

  /**
   * Toggle checkbox value
   */
  toggleCheckboxValue(questionId: string, value: string, checked: boolean): void {
    const currentValues = this.getCheckboxValues(questionId);
    let newValues: string[];
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    this.setAnswerValue(questionId, JSON.stringify(newValues));
  }

  /**
   * Check if checkbox option is selected
   */
  isCheckboxSelected(questionId: string, value: string): boolean {
    return this.getCheckboxValues(questionId).includes(value);
  }

  /**
   * Get validation error for a question
   */
  getValidationError(questionId: string): string | null {
    return this.validationErrors()[questionId] || null;
  }

  /**
   * Get scale options for a question
   */
  getScaleOptions(question: FormBuilderQuestionDto): number[] {
    const min = question.minValue ?? 1;
    const max = question.maxValue ?? 5;
    const options: number[] = [];
    for (let i = min; i <= max; i++) {
      options.push(i);
    }
    return options;
  }

  /**
   * Get dropdown field configuration
   */
  getDropdownFields() {
    return { text: 'optionText', value: 'optionValue' };
  }

  /**
   * Check if a question has required validation error
   */
  hasRequiredError(question: FormBuilderQuestionDto): boolean {
    if (!question.isRequired) return false;
    const answer = this.formData()[question.questionId];
    return !answer?.answerValue || answer.answerValue.trim() === '';
  }

  /**
   * Save all form responses
   */
  saveForm(autoComplete: boolean = false): void {
    const versionIdValue = this.versionId();
    if (!versionIdValue) {
      this.saveError.set('Version ID is required to save form responses');
      return;
    }

    // Validate required fields before saving
    if (!this.validateRequiredFields()) {
      this.saveError.set('Please fill in all required fields');
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);

    const answers = this.buildAnswersList();
    
    const request: SaveAllFormResponsesRequest = {
      responseId: this.responseId() || undefined,
      patientId: this.patientId(),
      versionId: versionIdValue,
      answers,
      autoComplete
    };

    this.formBuilderApi.saveAllFormResponses(request).subscribe({
      next: (result) => {
        this.isSaving.set(false);
        this.responseId.set(result.responseId);
        this.completionPercentage.set(result.completionPercentage);
        this.saveSuccess.set(true);
        this.showSuccessDialog.set(true);
        
        // Clear validation errors on success
        this.validationErrors.set({});

        // Handle validation errors from server
        if (result.validationErrors && result.validationErrors.length > 0) {
          const errors: Record<string, string> = {};
          result.validationErrors.forEach(err => {
            errors[err.questionId] = err.errorMessage;
          });
          this.validationErrors.set(errors);
        }
      },
      error: (err) => {
        console.error('Error saving form responses:', err);
        this.isSaving.set(false);
        this.saveError.set(err.message || 'Failed to save form responses');
      }
    });
  }

  /**
   * Validate all required fields
   */
  private validateRequiredFields(): boolean {
    const errors: Record<string, string> = {};
    let isValid = true;

    this.sections().forEach(section => {
      section.questions?.forEach(question => {
        if (question.isRequired && this.isAnswerableQuestion(question)) {
          const answer = this.formData()[question.questionId];
          if (!answer?.answerValue || answer.answerValue.trim() === '') {
            errors[question.questionId] = 'This field is required';
            isValid = false;
          }
        }
      });
    });

    this.validationErrors.set(errors);
    return isValid;
  }

  /**
   * Build the answers list for API request
   */
  private buildAnswersList(): SaveResponseAnswerRequest[] {
    const formData = this.formData();
    const answers: SaveResponseAnswerRequest[] = [];

    Object.values(formData).forEach(answer => {
      if (answer.answerValue !== undefined && answer.answerValue !== '') {
        answers.push({
          questionId: answer.questionId,
          answerValue: answer.answerValue,
          optionId: answer.optionId,
          repeatIndex: answer.repeatIndex,
          matrixRowId: answer.matrixRowId,
          matrixColId: answer.matrixColId
        });
      }
    });

    return answers;
  }

  /**
   * Handle back navigation
   */
  handleBackClick(): void {
    this.router.navigate(['/forms']);
  }

  /**
   * Handle retry loading
   */
  handleRetry(): void {
    this.loadForm();
  }

  /**
   * Close success dialog
   */
  closeSuccessDialog(): void {
    this.showSuccessDialog.set(false);
  }

  /**
   * Navigate back to forms list after successful save
   */
  navigateToFormsList(): void {
    this.router.navigate(['/forms']);
  }

  /**
   * Get question ID for template
   */
  getQuestionId(sectionIndex: number, questionIndex: number, question: FormBuilderQuestionDto): string {
    return question.questionId;
  }
}
