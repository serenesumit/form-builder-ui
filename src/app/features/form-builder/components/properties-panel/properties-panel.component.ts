import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilderStoreService } from '../../services/form-builder-store.service';
import { 
  CanvasQuestion, 
  CanvasSection,
  CanvasQuestionOption,
  CanvasConditionalRule,
  getQuestionTypeName,
  getQuestionTypeIcon,
  questionTypeSupportsOptions
} from '../../models/form-builder.types';
import { ConditionalLogicBuilderComponent } from '../conditional-logic-builder/conditional-logic-builder.component';

type PanelTab = 'general' | 'validation' | 'options' | 'logic' | 'advanced';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ConditionalLogicBuilderComponent],
  templateUrl: './properties-panel.component.html',
  styleUrls: ['./properties-panel.component.scss']
})
export class PropertiesPanelComponent {
  readonly store = inject(FormBuilderStoreService);
  
  activeTab: PanelTab = 'general';
  
  // Local form values for two-way binding
  questionText = '';
  questionCode = '';
  helpText = '';
  placeholderText = '';
  defaultValue = '';
  isRequired = false;
  isPhi = false;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  regexPattern = '';
  regexErrorMessage = '';
  
  // Section values
  sectionName = '';
  sectionDescription = '';
  isRepeatable = false;
  minRepeat = 1;
  maxRepeat?: number;
  isCollapsible = true;
  progressIndicator = true;
  
  // Options
  options: CanvasQuestionOption[] = [];

  readonly selectedQuestion = computed(() => this.store.selectedQuestion());
  readonly selectedSection = computed(() => this.store.selectedSection());
  readonly selection = computed(() => this.store.selection());
  
  readonly showQuestionProps = computed(() => {
    const sel = this.selection();
    return sel.sectionIndex !== null && sel.questionIndex !== null;
  });

  readonly showSectionProps = computed(() => {
    const sel = this.selection();
    return sel.sectionIndex !== null && sel.questionIndex === null;
  });

  readonly hasOptions = computed(() => {
    const question = this.selectedQuestion();
    return question ? questionTypeSupportsOptions(question.questionTypeId) : false;
  });

  readonly questionTypeName = computed(() => {
    const question = this.selectedQuestion();
    return question ? getQuestionTypeName(question.questionTypeId) : '';
  });

  readonly questionTypeIcon = computed(() => {
    const question = this.selectedQuestion();
    return question ? getQuestionTypeIcon(question.questionTypeId) : '';
  });

  constructor() {
    // Sync local values with store when selection changes
    effect(() => {
      const question = this.selectedQuestion();
      if (question) {
        this.questionText = question.questionText;
        this.questionCode = question.questionCode || '';
        this.helpText = question.helpText || '';
        this.placeholderText = question.placeholderText || '';
        this.defaultValue = question.defaultValue || '';
        this.isRequired = question.isRequired;
        this.isPhi = question.isPhi;
        this.minValue = question.minValue;
        this.maxValue = question.maxValue;
        this.minLength = question.minLength;
        this.maxLength = question.maxLength;
        this.regexPattern = question.regexPattern || '';
        this.regexErrorMessage = question.regexErrorMessage || '';
        this.options = [...question.options];
      }
    });

    effect(() => {
      const section = this.selectedSection();
      const showSection = this.showSectionProps();
      if (section && showSection) {
        this.sectionName = section.name;
        this.sectionDescription = section.description || '';
        this.isRepeatable = section.isRepeatable;
        this.minRepeat = section.minRepeat;
        this.maxRepeat = section.maxRepeat;
        this.isCollapsible = section.isCollapsible;
        this.progressIndicator = section.progressIndicator;
      }
    });
  }

  setTab(tab: PanelTab): void {
    this.activeTab = tab;
  }

  // Question Updates
  updateQuestionField(field: keyof CanvasQuestion, value: unknown): void {
    const sel = this.selection();
    if (sel.sectionIndex === null || sel.questionIndex === null) return;
    
    this.store.updateQuestion(sel.sectionIndex, sel.questionIndex, { [field]: value });
  }

  onQuestionTextChange(): void {
    this.updateQuestionField('questionText', this.questionText);
  }

  onQuestionCodeChange(): void {
    this.updateQuestionField('questionCode', this.questionCode);
  }

  onHelpTextChange(): void {
    this.updateQuestionField('helpText', this.helpText);
  }

  onPlaceholderTextChange(): void {
    this.updateQuestionField('placeholderText', this.placeholderText);
  }

  onDefaultValueChange(): void {
    this.updateQuestionField('defaultValue', this.defaultValue);
  }

  onRequiredChange(): void {
    this.updateQuestionField('isRequired', this.isRequired);
  }

  onPhiChange(): void {
    this.updateQuestionField('isPhi', this.isPhi);
  }

  onMinValueChange(): void {
    this.updateQuestionField('minValue', this.minValue);
  }

  onMaxValueChange(): void {
    this.updateQuestionField('maxValue', this.maxValue);
  }

  onMinLengthChange(): void {
    this.updateQuestionField('minLength', this.minLength);
  }

  onMaxLengthChange(): void {
    this.updateQuestionField('maxLength', this.maxLength);
  }

  onRegexPatternChange(): void {
    this.updateQuestionField('regexPattern', this.regexPattern);
  }

  onRegexErrorMessageChange(): void {
    this.updateQuestionField('regexErrorMessage', this.regexErrorMessage);
  }

  // Section Updates
  updateSectionField(field: keyof CanvasSection, value: unknown): void {
    const sel = this.selection();
    if (sel.sectionIndex === null) return;
    
    this.store.updateSection(sel.sectionIndex, { [field]: value });
  }

  onSectionNameChange(): void {
    this.updateSectionField('name', this.sectionName);
  }

  onSectionDescriptionChange(): void {
    this.updateSectionField('description', this.sectionDescription);
  }

  onRepeatableChange(): void {
    this.updateSectionField('isRepeatable', this.isRepeatable);
  }

  onMinRepeatChange(): void {
    this.updateSectionField('minRepeat', this.minRepeat);
  }

  onMaxRepeatChange(): void {
    this.updateSectionField('maxRepeat', this.maxRepeat);
  }

  onCollapsibleChange(): void {
    this.updateSectionField('isCollapsible', this.isCollapsible);
  }

  onProgressIndicatorChange(): void {
    this.updateSectionField('progressIndicator', this.progressIndicator);
  }

  // Option Management
  addOption(): void {
    const sel = this.selection();
    if (sel.sectionIndex === null || sel.questionIndex === null) return;
    
    this.store.addOption(sel.sectionIndex, sel.questionIndex);
    
    // Refresh local options
    const question = this.store.selectedQuestion();
    if (question) {
      this.options = [...question.options];
    }
  }

  updateOption(index: number, field: keyof CanvasQuestionOption, value: unknown): void {
    const sel = this.selection();
    if (sel.sectionIndex === null || sel.questionIndex === null) return;
    
    this.store.updateOption(sel.sectionIndex, sel.questionIndex, index, { [field]: value });
    
    // Refresh local options
    const question = this.store.selectedQuestion();
    if (question) {
      this.options = [...question.options];
    }
  }

  removeOption(index: number): void {
    const sel = this.selection();
    if (sel.sectionIndex === null || sel.questionIndex === null) return;
    
    this.store.removeOption(sel.sectionIndex, sel.questionIndex, index);
    
    // Refresh local options
    const question = this.store.selectedQuestion();
    if (question) {
      this.options = [...question.options];
    }
  }

  // Conditional Logic Updates
  onConditionalRulesChange(rules: CanvasConditionalRule[]): void {
    this.updateQuestionField('conditionalRules', rules);
  }
}

