import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormResponseService, FormResponseAnswer, SaveResponseRequest } from '../services/form-response.service';
import { FormBuilderApiService } from '@core/services/form-builder-api.service';

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
      id: section.id,
      sectionTitle: section.sectionTitle,
      description: section.description,
      questions: (section.questions || []).map((q: any) => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        isRequired: q.isRequired,
        helpText: q.helpText,
        options: q.options,
        matrixRows: q.matrixRows,
        matrixCols: q.matrixCols,
        conditionalRules: q.conditionalRules
      }))
    }));
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
