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
import { TableEditorComponent } from '../table-editor/table-editor.component';
import { RichTextEditorComponent } from '../rich-text-editor/rich-text-editor.component';
import { QuestionType } from '@core/models/form-builder.models';

type PanelTab = 'general' | 'validation' | 'options' | 'logic' | 'advanced';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ConditionalLogicBuilderComponent, TableEditorComponent, RichTextEditorComponent],
  templateUrl: './properties-panel.component.html',
  styleUrls: ['./properties-panel.component.scss']
})
export class PropertiesPanelComponent {
  readonly store = inject(FormBuilderStoreService);
  
  // Expose QuestionType enum to template
  readonly QuestionType = QuestionType;
  
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
  
  // Control-specific values
  rows = 4;
  step = 1;
  showLabels = true;
  minDate = '';
  maxDate = '';
  dateFormat = 'yyyy-MM-dd';
  timeFormat = 'HH:mm';
  minTime = '';
  maxTime = '';
  allowedFileTypes = 'pdf,doc,docx,jpg,png';
  maxFileSize = 10;
  allowMultipleFiles = false;
  signatureType = 'drawn';
  attestationText = '';
  calculationFormula = '';
  dependentQuestions = '';
  
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

  // Control-type specific computed properties
  readonly isTextType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.Text;
  });

  readonly isTextAreaType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.TextArea;
  });

  readonly isNumberType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.Number;
  });

  readonly isSliderType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.Slider;
  });

  readonly isScaleType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.Scale;
  });

  readonly isYesNoType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.YesNo;
  });

  readonly isDateType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.Date || question?.questionTypeId === QuestionType.DateTime;
  });

  readonly isTimeType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.Time;
  });

  readonly isFileUploadType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.FileUpload;
  });

  readonly isSignatureType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.Signature;
  });

  readonly isCalculatedType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.Calculated;
  });

  readonly isHiddenType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.Hidden;
  });

  readonly isDisplayType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.Display;
  });

  readonly isRichTextBlockType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.RichTextBlock;
  });

  readonly isMatrixType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.Matrix;
  });

  readonly isTableType = computed(() => {
    const question = this.selectedQuestion();
    return question?.questionTypeId === QuestionType.Table;
  });

  readonly needsPlaceholder = computed(() => {
    const question = this.selectedQuestion();
    if (!question) return false;
    return [QuestionType.Text, QuestionType.TextArea, QuestionType.Number, QuestionType.Dropdown].includes(question.questionTypeId);
  });

  readonly needsMinMaxValues = computed(() => {
    const question = this.selectedQuestion();
    if (!question) return false;
    return [QuestionType.Number, QuestionType.Slider, QuestionType.Scale].includes(question.questionTypeId);
  });

  readonly isDisplayOnlyType = computed(() => {
    const question = this.selectedQuestion();
    if (!question) return false;
    return [QuestionType.Display, QuestionType.RichTextBlock, QuestionType.Hidden].includes(question.questionTypeId);
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
        
        // Control-specific values
        const q = question as any;
        this.rows = q.rows ?? 4;
        this.step = q.step ?? 1;
        this.showLabels = q.showLabels !== false;
        this.minDate = q.minDate || '';
        this.maxDate = q.maxDate || '';
        this.dateFormat = q.dateFormat || 'yyyy-MM-dd';
        this.timeFormat = q.timeFormat || 'HH:mm';
        this.minTime = q.minTime || '';
        this.maxTime = q.maxTime || '';
        this.allowedFileTypes = q.allowedFileTypes || 'pdf,doc,docx,jpg,png';
        this.maxFileSize = q.maxFileSize ?? 10;
        this.allowMultipleFiles = q.allowMultipleFiles || false;
        this.signatureType = q.signatureType || 'drawn';
        this.attestationText = q.attestationText || '';
        this.calculationFormula = q.calculationFormula || '';
        this.dependentQuestions = q.dependentQuestions || '';
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

  // Control-specific change handlers
  onRowsChange(): void {
    this.updateQuestionField('rows' as any, this.rows);
  }

  onStepChange(): void {
    this.updateQuestionField('step' as any, this.step);
  }

  onShowLabelsChange(): void {
    this.updateQuestionField('showLabels' as any, this.showLabels);
  }

  onMinDateChange(): void {
    this.updateQuestionField('minDate' as any, this.minDate);
  }

  onMaxDateChange(): void {
    this.updateQuestionField('maxDate' as any, this.maxDate);
  }

  onDateFormatChange(): void {
    this.updateQuestionField('dateFormat' as any, this.dateFormat);
  }

  onTimeFormatChange(): void {
    this.updateQuestionField('timeFormat' as any, this.timeFormat);
  }

  onMinTimeChange(): void {
    this.updateQuestionField('minTime' as any, this.minTime);
  }

  onMaxTimeChange(): void {
    this.updateQuestionField('maxTime' as any, this.maxTime);
  }

  onAllowedFileTypesChange(): void {
    this.updateQuestionField('allowedFileTypes' as any, this.allowedFileTypes);
  }

  onMaxFileSizeChange(): void {
    this.updateQuestionField('maxFileSize' as any, this.maxFileSize);
  }

  onAllowMultipleFilesChange(): void {
    this.updateQuestionField('allowMultipleFiles' as any, this.allowMultipleFiles);
  }

  onSignatureTypeChange(): void {
    this.updateQuestionField('signatureType' as any, this.signatureType);
  }

  onAttestationTextChange(): void {
    this.updateQuestionField('attestationText' as any, this.attestationText);
  }

  onCalculationFormulaChange(): void {
    this.updateQuestionField('calculationFormula', this.calculationFormula);
  }

  onDependentQuestionsChange(): void {
    this.updateQuestionField('dependentQuestions' as any, this.dependentQuestions);
  }

  // Table Editor Update
  onTableConfigChange(updates: Partial<CanvasQuestion>): void {
    const sel = this.selection();
    if (sel.sectionIndex === null || sel.questionIndex === null) return;
    
    this.store.updateQuestion(sel.sectionIndex, sel.questionIndex, updates);
  }

  // Rich Text Editor Update
  onRichTextChange(content: string): void {
    this.questionText = content;
    this.updateQuestionField('questionText', content);
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

