import { Injectable, signal, computed } from '@angular/core';
import {
  FormBuilderStoreState,
  FormMetadata,
  CanvasSection,
  CanvasQuestion,
  CanvasQuestionOption,
  CanvasConditionalRule,
  FormBuilderSelection,
  FormBuilderDragState,
  DragItem,
  PaletteItem,
  PALETTE_CATEGORIES,
  createDefaultSection,
  createDefaultQuestion,
  generateId
} from '../models/form-builder.types';
import {
  SaveFormRequest,
  FormBuilderSectionRequest,
  FormQuestionRequest,
  FormQuestionOptionRequest,
  FormBuilderConditionalRuleRequest,
  FormBuilderDto,
  FormBuilderSectionDto,
  FormBuilderQuestionDto
} from '@core/models/form-builder.models';

const initialState: FormBuilderStoreState = {
  metadata: {
    code: '',
    name: '',
    description: '',
    category: '',
    isStandard: false,
    allowVersioning: false
  },
  sections: [],
  selection: {
    sectionIndex: null,
    questionIndex: null
  },
  dragState: {
    isDragging: false,
    draggedItem: null,
    dragOverSectionIndex: null,
    dragOverQuestionIndex: null
  },
  isLoading: false,
  isSaving: false,
  error: null,
  isDirty: false
};

@Injectable({
  providedIn: 'root'
})
export class FormBuilderStoreService {
  // State signal
  private readonly state = signal<FormBuilderStoreState>({ ...initialState });

  // Computed selectors
  readonly metadata = computed(() => this.state().metadata);
  readonly sections = computed(() => this.state().sections);
  readonly selection = computed(() => this.state().selection);
  readonly dragState = computed(() => this.state().dragState);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly isSaving = computed(() => this.state().isSaving);
  readonly error = computed(() => this.state().error);
  readonly isDirty = computed(() => this.state().isDirty);

  // Palette categories
  readonly paletteCategories = signal(PALETTE_CATEGORIES);

  // Selected question computed
  readonly selectedQuestion = computed(() => {
    const { sectionIndex, questionIndex } = this.selection();
    if (sectionIndex === null || questionIndex === null) return null;
    
    const sections = this.sections();
    if (sectionIndex >= sections.length) return null;
    
    const section = sections[sectionIndex];
    if (questionIndex >= section.questions.length) return null;
    
    return section.questions[questionIndex];
  });

  // Selected section computed
  readonly selectedSection = computed(() => {
    const { sectionIndex } = this.selection();
    if (sectionIndex === null) return null;
    
    const sections = this.sections();
    if (sectionIndex >= sections.length) return null;
    
    return sections[sectionIndex];
  });

  // Total questions count
  readonly totalQuestions = computed(() => {
    return this.sections().reduce((total, section) => total + section.questions.length, 0);
  });

  // ============================================
  // Initialization
  // ============================================

  initializeNewForm(): void {
    this.state.set({
      ...initialState,
      sections: [createDefaultSection(0)]
    });
  }

  loadFormFromApi(formData: FormBuilderDto): void {
    let sections: CanvasSection[];

    if (formData.sections && formData.sections.length > 0) {
      // Standard format: questions are nested inside sections
      sections = formData.sections.map((section, sectionIndex) => 
        this.convertApiSectionToCanvas(section, sectionIndex)
      );
    } else if (formData.questions && formData.questions.length > 0) {
      // Legacy format: questions are at root level without sections
      // Create a default section and put all questions in it
      const defaultSection = createDefaultSection(0);
      defaultSection.questions = formData.questions.map((q, qIndex) => 
        this.convertApiQuestionToCanvas(q, qIndex)
      );
      sections = [defaultSection];
    } else {
      // No questions or sections, create empty default section
      sections = [createDefaultSection(0)];
    }

    this.state.set({
      ...initialState,
      metadata: {
        code: formData.code,
        name: formData.name,
        description: formData.description || '',
        category: formData.category || '',
        isStandard: formData.isStandard || false,
        allowVersioning: false // Default to false for existing forms (update mode)
      },
      sections,
      isDirty: false
    });
  }

  private convertApiSectionToCanvas(apiSection: FormBuilderSectionDto, index: number): CanvasSection {
    return {
      id: apiSection.sectionId || generateId(),
      name: apiSection.sectionName,
      description: apiSection.sectionDescription || '',
      sortOrder: apiSection.sortOrder ?? index,
      isRepeatable: apiSection.isRepeatable || false,
      minRepeat: apiSection.minRepeat || 1,
      maxRepeat: apiSection.maxRepeat ?? undefined,
      progressIndicator: apiSection.progressIndicator || false,
      isCollapsible: apiSection.isCollapsible || false,
      isCollapsed: false,
      questions: apiSection.questions?.map((q, qIndex) => this.convertApiQuestionToCanvas(q, qIndex)) || []
    };
  }

  private convertApiQuestionToCanvas(apiQuestion: FormBuilderQuestionDto, index: number): CanvasQuestion {
    return {
      id: apiQuestion.questionId || generateId(),
      questionCode: apiQuestion.questionCode || '',
      questionText: apiQuestion.questionText,
      questionTypeId: apiQuestion.questionTypeId,
      helpText: apiQuestion.helpText || '',
      isRequired: apiQuestion.isRequired,
      // Handle both sortOrder and displayOrder field names
      displayOrder: apiQuestion.sortOrder ?? apiQuestion.displayOrder ?? index,
      isActive: true,
      backgroundColor: apiQuestion.backgroundColor,
      borderColor: apiQuestion.borderColor,
      placeholderText: apiQuestion.placeholderText || '',
      defaultValue: apiQuestion.defaultValue || '',
      isPhi: apiQuestion.isPHI || false,
      cptCode: apiQuestion.cptCode,
      loincCode: apiQuestion.loincCode,
      snomedCode: apiQuestion.snomedCode,
      isCalculated: apiQuestion.isCalculated || false,
      calculationFormula: apiQuestion.calculationExpression,
      minValue: apiQuestion.minValue ?? undefined,
      maxValue: apiQuestion.maxValue ?? undefined,
      minLength: apiQuestion.minLength ?? undefined,
      maxLength: apiQuestion.maxLength ?? undefined,
      regexPattern: apiQuestion.regexPattern,
      regexErrorMessage: apiQuestion.regexErrorMessage,
      options: apiQuestion.options?.map((opt, optIndex) => ({
        id: opt.optionId || generateId(),
        text: opt.optionText,
        value: opt.optionValue || opt.optionText,
        // Handle both sortOrder and displayOrder field names
        displayOrder: opt.sortOrder ?? opt.displayOrder ?? optIndex,
        // Handle both numericScore and score field names
        numericScore: opt.numericScore ?? opt.score ?? undefined
      })) || [],
      conditionalRules: apiQuestion.conditionalRules?.map(rule => ({
        id: rule.ruleId || generateId(),
        sourceQuestionId: rule.sourceQuestionId,
        operator: rule.operator as any,
        compareValue: rule.compareValue,
        compareToQuestionId: rule.compareToQuestionId,
        actionType: rule.actionType as any,
        sortOrder: rule.sortOrder
      })) || []
    };
  }

  resetState(): void {
    this.state.set({ ...initialState });
  }

  // ============================================
  // Metadata Actions
  // ============================================

  updateMetadata(updates: Partial<FormMetadata>): void {
    this.state.update(state => ({
      ...state,
      metadata: { ...state.metadata, ...updates },
      isDirty: true
    }));
  }

  // ============================================
  // Section Actions
  // ============================================

  addSection(): void {
    const sections = this.sections();
    const newSection = createDefaultSection(sections.length);
    
    this.state.update(state => ({
      ...state,
      sections: [...state.sections, newSection],
      selection: { sectionIndex: state.sections.length, questionIndex: null },
      isDirty: true
    }));
  }

  updateSection(sectionIndex: number, updates: Partial<CanvasSection>): void {
    this.state.update(state => {
      const sections = [...state.sections];
      if (sectionIndex >= 0 && sectionIndex < sections.length) {
        sections[sectionIndex] = { ...sections[sectionIndex], ...updates };
      }
      return { ...state, sections, isDirty: true };
    });
  }

  removeSection(sectionIndex: number): void {
    this.state.update(state => {
      const sections = state.sections.filter((_, i) => i !== sectionIndex);
      const selection = { ...state.selection };
      
      if (selection.sectionIndex === sectionIndex) {
        selection.sectionIndex = null;
        selection.questionIndex = null;
      } else if (selection.sectionIndex !== null && selection.sectionIndex > sectionIndex) {
        selection.sectionIndex--;
      }
      
      return { ...state, sections, selection, isDirty: true };
    });
  }

  moveSection(fromIndex: number, toIndex: number): void {
    this.state.update(state => {
      const sections = [...state.sections];
      const [removed] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, removed);
      
      // Update sort orders
      sections.forEach((section, index) => {
        section.sortOrder = index;
      });
      
      return { ...state, sections, isDirty: true };
    });
  }

  toggleSectionCollapse(sectionIndex: number): void {
    this.updateSection(sectionIndex, { 
      isCollapsed: !this.sections()[sectionIndex].isCollapsed 
    });
  }

  // ============================================
  // Question Actions
  // ============================================

  addQuestion(sectionIndex: number, paletteItem: PaletteItem): void {
    const sections = this.sections();
    if (sectionIndex < 0 || sectionIndex >= sections.length) return;

    const section = sections[sectionIndex];
    const newQuestion = createDefaultQuestion(
      paletteItem.questionTypeId,
      section.questions.length,
      paletteItem.defaultConfig
    );

    this.state.update(state => {
      const updatedSections = [...state.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        questions: [...updatedSections[sectionIndex].questions, newQuestion]
      };
      
      return {
        ...state,
        sections: updatedSections,
        selection: {
          sectionIndex,
          questionIndex: updatedSections[sectionIndex].questions.length - 1
        },
        isDirty: true
      };
    });
  }

  addQuestionAtIndex(sectionIndex: number, questionIndex: number, paletteItem: PaletteItem): void {
    const sections = this.sections();
    if (sectionIndex < 0 || sectionIndex >= sections.length) return;

    const newQuestion = createDefaultQuestion(
      paletteItem.questionTypeId,
      questionIndex,
      paletteItem.defaultConfig
    );

    this.state.update(state => {
      const updatedSections = [...state.sections];
      const questions = [...updatedSections[sectionIndex].questions];
      questions.splice(questionIndex, 0, newQuestion);
      
      // Update display orders
      questions.forEach((q, i) => {
        q.displayOrder = i;
      });
      
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        questions
      };
      
      return {
        ...state,
        sections: updatedSections,
        selection: { sectionIndex, questionIndex },
        isDirty: true
      };
    });
  }

  updateQuestion(sectionIndex: number, questionIndex: number, updates: Partial<CanvasQuestion>): void {
    this.state.update(state => {
      const sections = [...state.sections];
      if (sectionIndex < 0 || sectionIndex >= sections.length) return state;
      
      const questions = [...sections[sectionIndex].questions];
      if (questionIndex < 0 || questionIndex >= questions.length) return state;
      
      questions[questionIndex] = { ...questions[questionIndex], ...updates };
      sections[sectionIndex] = { ...sections[sectionIndex], questions };
      
      return { ...state, sections, isDirty: true };
    });
  }

  removeQuestion(sectionIndex: number, questionIndex: number): void {
    this.state.update(state => {
      const sections = [...state.sections];
      if (sectionIndex < 0 || sectionIndex >= sections.length) return state;
      
      const questions = sections[sectionIndex].questions.filter((_, i) => i !== questionIndex);
      
      // Update display orders
      questions.forEach((q, i) => {
        q.displayOrder = i;
      });
      
      sections[sectionIndex] = { ...sections[sectionIndex], questions };
      
      const selection = { ...state.selection };
      if (selection.sectionIndex === sectionIndex && selection.questionIndex === questionIndex) {
        selection.questionIndex = null;
      } else if (
        selection.sectionIndex === sectionIndex &&
        selection.questionIndex !== null &&
        selection.questionIndex > questionIndex
      ) {
        selection.questionIndex--;
      }
      
      return { ...state, sections, selection, isDirty: true };
    });
  }

  duplicateQuestion(sectionIndex: number, questionIndex: number): void {
    const sections = this.sections();
    if (sectionIndex < 0 || sectionIndex >= sections.length) return;
    
    const questions = sections[sectionIndex].questions;
    if (questionIndex < 0 || questionIndex >= questions.length) return;

    const original = questions[questionIndex];
    const duplicate: CanvasQuestion = {
      ...original,
      id: generateId(),
      questionText: `${original.questionText} (Copy)`,
      displayOrder: questions.length,
      options: original.options.map(opt => ({ ...opt, id: generateId() })),
      conditionalRules: []
    };

    this.state.update(state => {
      const updatedSections = [...state.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        questions: [...updatedSections[sectionIndex].questions, duplicate]
      };
      
      return {
        ...state,
        sections: updatedSections,
        selection: {
          sectionIndex,
          questionIndex: updatedSections[sectionIndex].questions.length - 1
        },
        isDirty: true
      };
    });
  }

  moveQuestion(
    fromSectionIndex: number,
    fromQuestionIndex: number,
    toSectionIndex: number,
    toQuestionIndex: number
  ): void {
    this.state.update(state => {
      const sections = [...state.sections];
      
      // Get the question to move
      const fromSection = sections[fromSectionIndex];
      const questions = [...fromSection.questions];
      const [question] = questions.splice(fromQuestionIndex, 1);
      
      if (fromSectionIndex === toSectionIndex) {
        // Moving within the same section
        const adjustedIndex = toQuestionIndex > fromQuestionIndex 
          ? toQuestionIndex - 1 
          : toQuestionIndex;
        questions.splice(adjustedIndex, 0, question);
        
        // Update display orders
        questions.forEach((q, i) => {
          q.displayOrder = i;
        });
        
        sections[fromSectionIndex] = { ...fromSection, questions };
      } else {
        // Moving to a different section
        questions.forEach((q, i) => {
          q.displayOrder = i;
        });
        sections[fromSectionIndex] = { ...fromSection, questions };
        
        const toSection = sections[toSectionIndex];
        const toQuestions = [...toSection.questions];
        toQuestions.splice(toQuestionIndex, 0, question);
        
        toQuestions.forEach((q, i) => {
          q.displayOrder = i;
        });
        
        sections[toSectionIndex] = { ...toSection, questions: toQuestions };
      }
      
      return {
        ...state,
        sections,
        selection: { sectionIndex: toSectionIndex, questionIndex: toQuestionIndex },
        isDirty: true
      };
    });
  }

  // ============================================
  // Option Actions
  // ============================================

  addOption(sectionIndex: number, questionIndex: number): void {
    const question = this.getQuestion(sectionIndex, questionIndex);
    if (!question) return;

    const newOption: CanvasQuestionOption = {
      id: generateId(),
      text: `Option ${question.options.length + 1}`,
      value: `${question.options.length + 1}`,
      displayOrder: question.options.length
    };

    this.updateQuestion(sectionIndex, questionIndex, {
      options: [...question.options, newOption]
    });
  }

  updateOption(
    sectionIndex: number,
    questionIndex: number,
    optionIndex: number,
    updates: Partial<CanvasQuestionOption>
  ): void {
    const question = this.getQuestion(sectionIndex, questionIndex);
    if (!question || optionIndex < 0 || optionIndex >= question.options.length) return;

    const options = [...question.options];
    options[optionIndex] = { ...options[optionIndex], ...updates };

    this.updateQuestion(sectionIndex, questionIndex, { options });
  }

  removeOption(sectionIndex: number, questionIndex: number, optionIndex: number): void {
    const question = this.getQuestion(sectionIndex, questionIndex);
    if (!question) return;

    const options = question.options.filter((_, i) => i !== optionIndex);
    options.forEach((opt, i) => {
      opt.displayOrder = i;
    });

    this.updateQuestion(sectionIndex, questionIndex, { options });
  }

  // ============================================
  // Selection Actions
  // ============================================

  selectQuestion(sectionIndex: number | null, questionIndex: number | null): void {
    this.state.update(state => ({
      ...state,
      selection: { sectionIndex, questionIndex }
    }));
  }

  selectSection(sectionIndex: number | null): void {
    this.state.update(state => ({
      ...state,
      selection: { sectionIndex, questionIndex: null }
    }));
  }

  clearSelection(): void {
    this.state.update(state => ({
      ...state,
      selection: { sectionIndex: null, questionIndex: null }
    }));
  }

  // ============================================
  // Drag State Actions
  // ============================================

  setDragStart(item: DragItem): void {
    this.state.update(state => ({
      ...state,
      dragState: {
        isDragging: true,
        draggedItem: item,
        dragOverSectionIndex: null,
        dragOverQuestionIndex: null
      }
    }));
  }

  setDragOver(sectionIndex: number | null, questionIndex: number | null): void {
    this.state.update(state => ({
      ...state,
      dragState: {
        ...state.dragState,
        dragOverSectionIndex: sectionIndex,
        dragOverQuestionIndex: questionIndex
      }
    }));
  }

  setDragEnd(): void {
    this.state.update(state => ({
      ...state,
      dragState: {
        isDragging: false,
        draggedItem: null,
        dragOverSectionIndex: null,
        dragOverQuestionIndex: null
      }
    }));
  }

  // ============================================
  // Palette Actions
  // ============================================

  togglePaletteCategory(categoryId: string): void {
    this.paletteCategories.update(categories =>
      categories.map(cat =>
        cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  }

  // ============================================
  // Status Actions
  // ============================================

  setLoading(isLoading: boolean): void {
    this.state.update(state => ({ ...state, isLoading }));
  }

  setSaving(isSaving: boolean): void {
    this.state.update(state => ({ ...state, isSaving }));
  }

  setError(error: string | null): void {
    this.state.update(state => ({ ...state, error }));
  }

  markAsSaved(): void {
    this.state.update(state => ({
      ...state,
      isDirty: false,
      lastSaved: new Date()
    }));
  }

  // ============================================
  // Conversion Methods
  // ============================================

  toSaveFormRequest(): SaveFormRequest {
    const state = this.state();
    
    return {
      code: state.metadata.code,
      name: state.metadata.name,
      description: state.metadata.description,
      category: state.metadata.category,
      isStandard: state.metadata.isStandard,
      allowVersioning: state.metadata.allowVersioning,
      sections: state.sections.map((section, index) => this.convertSection(section, index))
    };
  }

  private convertSection(section: CanvasSection, index: number): FormBuilderSectionRequest {
    return {
      sectionId: section.id,  // Send as-is - backend matches existing or creates new
      sectionName: section.name,
      sectionDescription: section.description,
      sortOrder: index,
      isRepeatable: section.isRepeatable,
      minRepeat: section.minRepeat,
      maxRepeat: section.maxRepeat ?? null,
      progressIndicator: section.progressIndicator,
      isCollapsible: section.isCollapsible,
      questions: section.questions.map((q, i) => this.convertQuestion(q, i))
    };
  }

  private convertQuestion(question: CanvasQuestion, index: number): FormQuestionRequest {
    return {
      questionId: question.id,  // Send as-is - backend matches existing or creates new
      questionCode: question.questionCode,
      questionText: question.questionText,
      questionTypeId: question.questionTypeId,
      helpText: question.helpText,
      isRequired: question.isRequired,
      displayOrder: index,
      isActive: question.isActive,
      backgroundColor: question.backgroundColor,
      borderColor: question.borderColor,
      height: null,
      placeholderText: question.placeholderText,
      defaultValue: question.defaultValue,
      isPhi: question.isPhi,
      cptCode: question.cptCode,
      loincCode: question.loincCode,
      snomedCode: question.snomedCode,
      isCalculated: question.isCalculated,
      calculationFormula: question.calculationFormula,
      minValue: question.minValue ?? null,
      maxValue: question.maxValue ?? null,
      minLength: question.minLength ?? null,
      maxLength: question.maxLength ?? null,
      regexPattern: question.regexPattern,
      regexErrorMessage: question.regexErrorMessage,
      options: question.options.map((opt, i) => this.convertOption(opt, i)),
      conditionalRules: question.conditionalRules.map((rule, i) => this.convertConditionalRule(rule, i)),
      validationRules: [], // TODO: Implement when validation rules UI is added
      rows: [], // TODO: Implement when matrix question UI is added
      cols: []  // TODO: Implement when matrix question UI is added
    };
  }

  private convertConditionalRule(rule: CanvasConditionalRule, index: number): FormBuilderConditionalRuleRequest {
    return {
      ruleId: rule.id,  // Send the ID as-is - backend will handle new vs existing
      ruleGroupId: rule.ruleGroupId ?? null,
      sourceQuestionId: rule.sourceQuestionId || null,
      operator: rule.operator,
      compareValue: rule.compareValue,
      compareToQuestionId: rule.compareToQuestionId || null,
      actionType: rule.actionType,
      joinType: rule.joinType,
      sortOrder: index
    };
  }

  private convertOption(option: CanvasQuestionOption, index: number): FormQuestionOptionRequest {
    return {
      optionId: option.id,  // Send as-is - backend matches existing or creates new
      optionText: option.text,
      optionValue: option.value,
      numericScore: option.numericScore ?? null,
      displayOrder: index
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private getQuestion(sectionIndex: number, questionIndex: number): CanvasQuestion | null {
    const sections = this.sections();
    if (sectionIndex < 0 || sectionIndex >= sections.length) return null;
    
    const questions = sections[sectionIndex].questions;
    if (questionIndex < 0 || questionIndex >= questions.length) return null;
    
    return questions[questionIndex];
  }
}

