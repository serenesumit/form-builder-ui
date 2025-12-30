import { Injectable, signal, computed } from '@angular/core';
import {
  FormBuilderStoreState,
  FormMetadata,
  CanvasSection,
  CanvasQuestion,
  CanvasQuestionOption,
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
  FormQuestionOptionRequest
} from '@core/models/form-builder.models';

const initialState: FormBuilderStoreState = {
  metadata: {
    code: '',
    name: '',
    description: '',
    category: '',
    isStandard: false
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
      sections: state.sections.map((section, index) => this.convertSection(section, index))
    };
  }

  private convertSection(section: CanvasSection, index: number): FormBuilderSectionRequest {
    return {
      sectionId: section.id.includes('-') ? null : section.id,
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
      questionId: question.id.includes('-') ? null : question.id,
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
      conditionalRules: []
    };
  }

  private convertOption(option: CanvasQuestionOption, index: number): FormQuestionOptionRequest {
    return {
      optionId: option.id.includes('-') ? null : option.id,
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

