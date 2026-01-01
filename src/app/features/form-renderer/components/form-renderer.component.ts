import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormResponseService, FormResponseAnswer, SaveResponseRequest } from '../services/form-response.service';
import { FormBuilderApiService } from '@core/services/form-builder-api.service';
import { QuestionType, TableConfig, TableRowConfig, TableColumnConfig } from '@core/models/form-builder.models';

interface Question {
  id: string;
  questionText: string;
  questionTypeId: number;
  questionType: string;
  isRequired: boolean;
  helpText?: string;
  options?: QuestionOption[];
  matrixRows?: MatrixRow[];
  matrixCols?: MatrixCol[];
  conditionalRules?: ConditionalRule[];
  // Additional properties for new question types
  tableConfig?: TableConfig;
  minValue?: number;
  maxValue?: number;
  calculationExpression?: string;
  defaultValue?: string;
}

interface QuestionOption {
  id: string;
  optionText: string;
  optionValue: string;
}

interface MatrixRow {
  id: number;
  rowText: string;
}

interface MatrixCol {
  id: number;
  colText: string;
}

interface ConditionalRule {
  sourceQuestionId: string;
  operator: string;
  value: string;
  actionType: string;
}

interface Section {
  id: string;
  sectionTitle: string;
  description?: string;
  questions: Question[];
}

@Component({
  selector: 'app-form-renderer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-renderer.component.html',
  styleUrls: ['./form-renderer.component.scss']
})
export class FormRendererComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formResponseService = inject(FormResponseService);
  private readonly formBuilderApiService = inject(FormBuilderApiService);

  // Expose QuestionType enum to template
  readonly QuestionType = QuestionType;

  readonly tenantId = signal<string>('');
  readonly versionId = signal<string>('');
  readonly patientId = signal<string>('');
  readonly assignmentId = signal<string | null>(null);
  readonly responseId = signal<string | null>(null);

  readonly formData = signal<any>(null);
  readonly sections = signal<Section[]>([]);
  readonly answers = signal<Map<string, FormResponseAnswer>>(new Map());
  readonly loading = signal<boolean>(true);
  readonly saving = signal<boolean>(false);
  readonly viewMode = signal<'single' | 'tabs'>('single'); // View mode: single page or tabs
  readonly currentTabIndex = signal<number>(0); // Current active tab index

  readonly progress = computed(() => {
    const allQuestions = this.sections().flatMap(s => s.questions);
    const answeredCount = Array.from(this.answers().values()).length;
    const total = allQuestions.length;
    return total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  });

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tenantId.set(params['tenantId']);
      this.versionId.set(params['versionId']);
      this.patientId.set(params['patientId']);
      this.assignmentId.set(params['assignmentId'] || null);

      this.loadForm();
    });
  }

  private loadForm(): void {
    this.loading.set(true);
    this.formBuilderApiService.getFormByVersionId(this.versionId()).subscribe({
      next: (response: any) => {
        this.formData.set(response);
        this.sections.set(this.convertSections(response.sections || []));
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading form:', error);
        this.loading.set(false);
      }
    });
  }

  private convertSections(sections: any[]): Section[] {
    return sections.map(section => ({
      id: section.sectionId,
      sectionTitle: section.sectionName,
      description: section.sectionDescription,
      questions: (section.questions || []).map((q: any) => {
        // Detect if question type is wrong based on having options
        let questionType = q.questionType || this.mapQuestionTypeIdToName(q.questionTypeId);
        const hasOptions = q.options && q.options.length > 0;

        // If question has options but type is not a choice type, auto-correct it
        if (hasOptions && !['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN', 'YESNO', 'RADIOBUTTON'].includes(questionType)) {
          // Default to SINGLE_CHOICE for questions with options
          questionType = 'SINGLE_CHOICE';
          console.warn(`Question "${q.questionText}" has type ${q.questionType} but has options. Auto-correcting to SINGLE_CHOICE.`);
        }

        return {
          id: q.questionId,
          questionText: q.questionText,
          questionTypeId: q.questionTypeId,
          questionType: questionType,
          isRequired: q.isRequired,
          helpText: q.helpText,
          options: (q.options || []).map((opt: any) => ({
            id: opt.optionId,
            optionText: opt.optionText,
            optionValue: opt.optionValue
          })),
          matrixRows: q.matrixRows || q.rows,
          matrixCols: q.matrixCols || q.cols,
          conditionalRules: q.conditionalRules,
          tableConfig: q.tableConfig,
          minValue: q.minValue,
          maxValue: q.maxValue,
          calculationExpression: q.calculationExpression,
          defaultValue: q.defaultValue
        };
      })
    }));
  }

  /**
   * Map question type ID to string name for template switch
   */
  private mapQuestionTypeIdToName(typeId: number): string {
    const typeMap: Record<number, string> = {
      [QuestionType.Text]: 'TEXT',
      [QuestionType.TextArea]: 'TEXTAREA',
      [QuestionType.Number]: 'NUMBER',
      [QuestionType.YesNo]: 'YESNO',
      [QuestionType.MultipleChoice]: 'SINGLE_CHOICE',
      [QuestionType.Checkbox]: 'MULTIPLE_CHOICE',
      [QuestionType.Dropdown]: 'DROPDOWN',
      [QuestionType.RadioButton]: 'RADIOBUTTON',
      [QuestionType.Date]: 'DATE',
      [QuestionType.DateTime]: 'DATETIME',
      [QuestionType.Time]: 'TIME',
      [QuestionType.Slider]: 'SLIDER',
      [QuestionType.Scale]: 'SCALE',
      [QuestionType.FileUpload]: 'FILE_UPLOAD',
      [QuestionType.Signature]: 'SIGNATURE',
      [QuestionType.Matrix]: 'MATRIX',
      [QuestionType.Calculated]: 'CALCULATED',
      [QuestionType.Display]: 'DISPLAY',
      [QuestionType.Hidden]: 'HIDDEN',
      [QuestionType.RichTextBlock]: 'RICHTEXT',
      [QuestionType.Table]: 'TABLE'
    };
    return typeMap[typeId] || 'TEXT';
  }

  /**
   * Get scale options for Scale/Rating question type
   */
  getScaleOptions(question: Question): number[] {
    const min = question.minValue ?? 1;
    const max = question.maxValue ?? 5;
    const options: number[] = [];
    for (let i = min; i <= max; i++) {
      options.push(i);
    }
    return options;
  }

  /**
   * Check if question is a display-only type
   */
  isDisplayOnlyType(question: Question): boolean {
    return [QuestionType.RichTextBlock, QuestionType.Display, QuestionType.Hidden].includes(question.questionTypeId);
  }

  updateAnswer(questionId: string, value: any, optionId?: string): void {
    const currentAnswers = new Map(this.answers());
    currentAnswers.set(questionId, {
      questionId,
      answerValue: value?.toString() || null,
      optionId: optionId || null,
      repeatIndex: null,
      matrixRowId: null,
      matrixColId: null
    });
    this.answers.set(currentAnswers);
  }

  updateMatrixAnswer(questionId: string, rowId: number, colId: number, value: string): void {
    const key = `${questionId}_${rowId}_${colId}`;
    const currentAnswers = new Map(this.answers());
    currentAnswers.set(key, {
      questionId,
      answerValue: value,
      optionId: null,
      repeatIndex: null,
      matrixRowId: rowId,
      matrixColId: colId
    });
    this.answers.set(currentAnswers);
  }

  getAnswer(questionId: string): string | null {
    return this.answers().get(questionId)?.answerValue || null;
  }

  getMatrixAnswer(questionId: string, rowId: number, colId: number): string | null {
    const key = `${questionId}_${rowId}_${colId}`;
    return this.answers().get(key)?.answerValue || null;
  }

  isQuestionVisible(question: Question): boolean {
    if (!question.conditionalRules || question.conditionalRules.length === 0) {
      return true;
    }

    return question.conditionalRules.every(rule => {
      const sourceAnswer = this.answers().get(rule.sourceQuestionId);
      if (!sourceAnswer) return false;

      const answerValue = sourceAnswer.answerValue;
      const ruleValue = rule.value;

      switch (rule.operator) {
        case 'EQUALS':
          return answerValue === ruleValue;
        case 'NOT_EQUALS':
          return answerValue !== ruleValue;
        case 'GREATER_THAN':
          return Number(answerValue) > Number(ruleValue);
        case 'LESS_THAN':
          return Number(answerValue) < Number(ruleValue);
        case 'CONTAINS':
          return answerValue?.includes(ruleValue) || false;
        default:
          return true;
      }
    });
  }

  toggleViewMode(): void {
    const newMode = this.viewMode() === 'single' ? 'tabs' : 'single';
    this.viewMode.set(newMode);
    if (newMode === 'tabs') {
      this.currentTabIndex.set(0);
    }
  }

  goToTab(index: number): void {
    this.currentTabIndex.set(index);
  }

  nextTab(): void {
    const nextIndex = this.currentTabIndex() + 1;
    if (nextIndex < this.sections().length) {
      this.currentTabIndex.set(nextIndex);
    }
  }

  previousTab(): void {
    const prevIndex = this.currentTabIndex() - 1;
    if (prevIndex >= 0) {
      this.currentTabIndex.set(prevIndex);
    }
  }

  saveDraft(): void {
    this.saveResponse(false);
  }

  submitForm(): void {
    if (!this.validateForm()) {
      alert('Please answer all required questions before submitting.');
      return;
    }
    this.saveResponse(true);
  }

  private validateForm(): boolean {
    const allQuestions = this.sections().flatMap(s => s.questions);
    const requiredQuestions = allQuestions.filter(q => q.isRequired && this.isQuestionVisible(q));

    return requiredQuestions.every(q => {
      const answer = this.answers().get(q.id);
      return answer && answer.answerValue !== null && answer.answerValue !== '';
    });
  }

  private saveResponse(complete: boolean): void {
    this.saving.set(true);

    const request: SaveResponseRequest = {
      responseId: this.responseId(),
      patientId: this.patientId(),
      versionId: this.versionId(),
      assignmentId: this.assignmentId(),
      admissionId: null,
      answers: Array.from(this.answers().values())
    };

    this.formResponseService.saveResponse(this.tenantId(), request).subscribe({
      next: (response) => {
        this.responseId.set(response.responseId);

        if (complete) {
          this.formResponseService.completeResponse(
            this.tenantId(),
            response.responseId,
            this.patientId() // In real app, use current user ID
          ).subscribe({
            next: () => {
              this.saving.set(false);
              alert('Form submitted successfully!');
              this.router.navigate(['/forms/success']);
            },
            error: (error) => {
              console.error('Error completing form:', error);
              this.saving.set(false);
            }
          });
        } else {
          this.saving.set(false);
          alert('Draft saved successfully!');
        }
      },
      error: (error) => {
        console.error('Error saving response:', error);
        this.saving.set(false);
      }
    });
  }
}
