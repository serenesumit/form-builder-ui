import { Injectable, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, switchMap, tap, of, EMPTY } from 'rxjs';
import { FormBuilderApiService } from './form-builder-api.service';
import {
  SaveFormRequest,
  SaveFormResult,
  FormBuilderDto,
  FormBuilderSectionRequest,
  FormQuestionRequest,
  QUESTION_TYPES,
  QuestionTypeInfo
} from '../models/form-builder.models';

export interface FormBuilderState {
  currentForm: SaveFormRequest | null;
  isLoading: boolean;
  error: string | null;
  savedResult: SaveFormResult | null;
}

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {
  private readonly apiService = inject(FormBuilderApiService);

  // State signals
  private readonly state = signal<FormBuilderState>({
    currentForm: null,
    isLoading: false,
    error: null,
    savedResult: null
  });

  // Computed signals
  readonly currentForm = computed(() => this.state().currentForm);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);
  readonly savedResult = computed(() => this.state().savedResult);
  readonly hasUnsavedChanges = computed(() => this.state().currentForm !== null);

  // Question types reference
  readonly questionTypes = signal<QuestionTypeInfo[]>(QUESTION_TYPES);

  /**
   * Initialize a new empty form
   */
  initializeNewForm(): void {
    const newForm: SaveFormRequest = {
      code: '',
      name: '',
      description: '',
      category: '',
      isStandard: false,
      isActive: true,
      allowVersioning: true,
      changeNotes: '',
      sections: []
    };

    this.state.update(state => ({
      ...state,
      currentForm: newForm,
      error: null,
      savedResult: null
    }));
  }

  /**
   * Load an existing form by definition ID
   */
  loadForm(definitionId: string): void {
    this.state.update(state => ({ ...state, isLoading: true, error: null }));

    this.apiService.getFormByDefinitionId(definitionId).subscribe({
      next: (dto: FormBuilderDto) => {
        const form = this.convertDtoToRequest(dto);
        this.state.update(state => ({
          ...state,
          currentForm: form,
          isLoading: false
        }));
      },
      error: (error: Error) => {
        this.state.update(state => ({
          ...state,
          isLoading: false,
          error: error.message
        }));
      }
    });
  }

  /**
   * Save the current form (create or update)
   */
  saveForm(definitionId?: string): void {
    const form = this.currentForm();
    if (!form) {
      this.state.update(state => ({
        ...state,
        error: 'No form to save'
      }));
      return;
    }

    this.state.update(state => ({ ...state, isLoading: true, error: null }));

    const saveObservable = definitionId
      ? this.apiService.updateForm(definitionId, form)
      : this.apiService.createForm(form);

    saveObservable.subscribe({
      next: (result: SaveFormResult) => {
        this.state.update(state => ({
          ...state,
          isLoading: false,
          savedResult: result
        }));
      },
      error: (error: Error) => {
        this.state.update(state => ({
          ...state,
          isLoading: false,
          error: error.message
        }));
      }
    });
  }

  /**
   * Update form metadata
   */
  updateFormMetadata(updates: Partial<SaveFormRequest>): void {
    this.state.update(state => ({
      ...state,
      currentForm: state.currentForm
        ? { ...state.currentForm, ...updates }
        : null
    }));
  }

  /**
   * Add a new section to the form
   */
  addSection(section?: Partial<FormBuilderSectionRequest>): void {
    const form = this.currentForm();
    if (!form) return;

    const newSection: FormBuilderSectionRequest = {
      sectionId: null,
      sectionName: section?.sectionName || 'New Section',
      sectionDescription: section?.sectionDescription || '',
      sortOrder: section?.sortOrder ?? form.sections.length * 10,
      isRepeatable: section?.isRepeatable ?? false,
      minRepeat: section?.minRepeat ?? 1,
      maxRepeat: section?.maxRepeat ?? null,
      progressIndicator: section?.progressIndicator ?? true,
      isCollapsible: section?.isCollapsible ?? false,
      questions: section?.questions || []
    };

    this.state.update(state => ({
      ...state,
      currentForm: {
        ...form,
        sections: [...form.sections, newSection]
      }
    }));
  }

  /**
   * Update a section
   */
  updateSection(index: number, updates: Partial<FormBuilderSectionRequest>): void {
    const form = this.currentForm();
    if (!form || index < 0 || index >= form.sections.length) return;

    const updatedSections = [...form.sections];
    updatedSections[index] = { ...updatedSections[index], ...updates };

    this.state.update(state => ({
      ...state,
      currentForm: {
        ...form,
        sections: updatedSections
      }
    }));
  }

  /**
   * Remove a section
   */
  removeSection(index: number): void {
    const form = this.currentForm();
    if (!form || index < 0 || index >= form.sections.length) return;

    this.state.update(state => ({
      ...state,
      currentForm: {
        ...form,
        sections: form.sections.filter((_, i) => i !== index)
      }
    }));
  }

  /**
   * Add a question to a section
   */
  addQuestion(sectionIndex: number, question?: Partial<FormQuestionRequest>): void {
    const form = this.currentForm();
    if (!form || sectionIndex < 0 || sectionIndex >= form.sections.length) return;

    const section = form.sections[sectionIndex];
    const newQuestion: FormQuestionRequest = {
      questionId: null,
      questionCode: question?.questionCode || '',
      questionText: question?.questionText || 'New Question',
      questionTypeId: question?.questionTypeId ?? 1,
      helpText: question?.helpText || '',
      isRequired: question?.isRequired ?? false,
      displayOrder: question?.displayOrder ?? section.questions.length * 10,
      isActive: question?.isActive ?? true,
      backgroundColor: question?.backgroundColor || '',
      borderColor: question?.borderColor || '',
      height: question?.height ?? null,
      placeholderText: question?.placeholderText || '',
      defaultValue: question?.defaultValue || '',
      isPhi: question?.isPhi ?? false,
      cptCode: question?.cptCode || '',
      loincCode: question?.loincCode || '',
      snomedCode: question?.snomedCode || '',
      isCalculated: question?.isCalculated ?? false,
      calculationFormula: question?.calculationFormula || '',
      minValue: question?.minValue ?? null,
      maxValue: question?.maxValue ?? null,
      minLength: question?.minLength ?? null,
      maxLength: question?.maxLength ?? null,
      regexPattern: question?.regexPattern || '',
      regexErrorMessage: question?.regexErrorMessage || '',
      options: question?.options || [],
      conditionalRules: question?.conditionalRules || []
    };

    const updatedSections = [...form.sections];
    updatedSections[sectionIndex] = {
      ...section,
      questions: [...section.questions, newQuestion]
    };

    this.state.update(state => ({
      ...state,
      currentForm: {
        ...form,
        sections: updatedSections
      }
    }));
  }

  /**
   * Update a question in a section
   */
  updateQuestion(
    sectionIndex: number,
    questionIndex: number,
    updates: Partial<FormQuestionRequest>
  ): void {
    const form = this.currentForm();
    if (!form || sectionIndex < 0 || sectionIndex >= form.sections.length) return;

    const section = form.sections[sectionIndex];
    if (questionIndex < 0 || questionIndex >= section.questions.length) return;

    const updatedQuestions = [...section.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      ...updates
    };

    const updatedSections = [...form.sections];
    updatedSections[sectionIndex] = {
      ...section,
      questions: updatedQuestions
    };

    this.state.update(state => ({
      ...state,
      currentForm: {
        ...form,
        sections: updatedSections
      }
    }));
  }

  /**
   * Remove a question from a section
   */
  removeQuestion(sectionIndex: number, questionIndex: number): void {
    const form = this.currentForm();
    if (!form || sectionIndex < 0 || sectionIndex >= form.sections.length) return;

    const section = form.sections[sectionIndex];
    if (questionIndex < 0 || questionIndex >= section.questions.length) return;

    const updatedSections = [...form.sections];
    updatedSections[sectionIndex] = {
      ...section,
      questions: section.questions.filter((_, i) => i !== questionIndex)
    };

    this.state.update(state => ({
      ...state,
      currentForm: {
        ...form,
        sections: updatedSections
      }
    }));
  }

  /**
   * Clear the current form and reset state
   */
  clearForm(): void {
    this.state.set({
      currentForm: null,
      isLoading: false,
      error: null,
      savedResult: null
    });
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.state.update(state => ({ ...state, error: null }));
  }

  /**
   * Get question type info by ID
   */
  getQuestionTypeById(id: number): QuestionTypeInfo | undefined {
    return this.questionTypes().find(qt => qt.id === id);
  }

  /**
   * Check if question type supports options
   */
  questionTypeSupportsOptions(questionTypeId: number): boolean {
    const questionType = this.getQuestionTypeById(questionTypeId);
    return questionType?.supportsOptions ?? false;
  }

  /**
   * Convert DTO to Request format (for editing loaded forms)
   */
  private convertDtoToRequest(dto: FormBuilderDto): SaveFormRequest {
    // Helper function to convert a single question
    const convertQuestion = (q: any, qIndex: number): FormQuestionRequest => ({
      questionId: q.questionId,
      questionCode: q.questionCode,
      questionText: q.questionText,
      questionTypeId: q.questionTypeId,
      helpText: q.helpText,
      isRequired: q.isRequired ?? false,
      // Handle both sortOrder and displayOrder field names
      displayOrder: q.sortOrder ?? q.displayOrder ?? qIndex,
      isActive: true,
      backgroundColor: q.backgroundColor,
      borderColor: q.borderColor,
      height: q.height ?? null,
      placeholderText: q.placeholderText,
      defaultValue: q.defaultValue,
      isPhi: q.isPHI ?? false,
      cptCode: q.cptCode,
      loincCode: q.loincCode,
      snomedCode: q.snomedCode,
      isCalculated: q.isCalculated ?? false,
      calculationFormula: q.calculationExpression,
      minValue: q.minValue ?? null,
      maxValue: q.maxValue ?? null,
      minLength: q.minLength ?? null,
      maxLength: q.maxLength ?? null,
      regexPattern: q.regexPattern,
      regexErrorMessage: q.regexErrorMessage,
      options: q.options?.map((opt: any, optIndex: number) => ({
        optionId: opt.optionId,
        optionText: opt.optionText,
        optionValue: opt.optionValue ?? opt.optionText,
        // Handle both numericScore and score field names
        numericScore: opt.numericScore ?? opt.score ?? null,
        // Handle both sortOrder and displayOrder field names
        displayOrder: opt.sortOrder ?? opt.displayOrder ?? optIndex
      })) ?? [],
      conditionalRules: q.conditionalRules?.map((rule: any) => ({
        ruleId: rule.ruleId,
        ruleGroupId: null,
        sourceQuestionId: rule.sourceQuestionId ?? null,
        operator: rule.operator as any,
        compareValue: rule.compareValue,
        compareToQuestionId: rule.compareToQuestionId ?? null,
        actionType: rule.actionType as any,
        joinType: undefined,
        sortOrder: rule.sortOrder
      })) ?? []
    });

    // Determine sections - handle both sectioned and flat question formats
    let sections: FormBuilderSectionRequest[];

    if (dto.sections && dto.sections.length > 0) {
      // Standard format: questions are nested inside sections
      sections = dto.sections.map((section, sIndex) => ({
        sectionId: section.sectionId,
        sectionName: section.sectionName,
        sectionDescription: section.sectionDescription,
        sortOrder: section.sortOrder ?? sIndex,
        isRepeatable: section.isRepeatable ?? false,
        minRepeat: section.minRepeat ?? 1,
        maxRepeat: section.maxRepeat ?? null,
        progressIndicator: section.progressIndicator ?? true,
        isCollapsible: section.isCollapsible ?? false,
        questions: section.questions?.map((q, qIndex) => convertQuestion(q, qIndex)) ?? []
      }));
    } else if (dto.questions && dto.questions.length > 0) {
      // Legacy format: questions are at root level without sections
      // Create a default section and put all questions in it
      sections = [{
        sectionId: null,
        sectionName: 'Default Section',
        sectionDescription: '',
        sortOrder: 0,
        isRepeatable: false,
        minRepeat: 1,
        maxRepeat: null,
        progressIndicator: true,
        isCollapsible: false,
        questions: dto.questions.map((q, qIndex) => convertQuestion(q, qIndex))
      }];
    } else {
      // No questions or sections
      sections = [];
    }

    return {
      definitionId: dto.definitionId,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      category: dto.category,
      isStandard: dto.isStandard ?? false,
      isActive: true,
      allowVersioning: true,
      changeNotes: '',
      sections
    };
  }
}
