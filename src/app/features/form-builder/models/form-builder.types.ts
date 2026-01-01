// Enhanced Form Builder Types and Interfaces

import { QuestionType } from '@core/models/form-builder.models';

// ============================================
// Drag and Drop Types
// ============================================

export type DragItemType = 'PALETTE_ITEM' | 'CANVAS_QUESTION' | 'SECTION';

export interface DragItem {
  type: DragItemType;
  questionTypeId?: number;
  sectionIndex?: number;
  questionIndex?: number;
  data?: PaletteItem | CanvasQuestion;
}

export interface DropResult {
  targetSectionIndex: number;
  targetQuestionIndex?: number;
}

// ============================================
// Palette Types
// ============================================

export interface PaletteCategory {
  id: string;
  name: string;
  icon: string;
  items: PaletteItem[];
  expanded: boolean;
}

export interface PaletteItem {
  id: string;
  questionTypeId: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  defaultConfig: Partial<CanvasQuestion>;
}

// ============================================
// Canvas Types
// ============================================

export interface CanvasSection {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isCollapsed: boolean;
  isRepeatable: boolean;
  minRepeat: number;
  maxRepeat?: number;
  progressIndicator: boolean;
  isCollapsible: boolean;
  questions: CanvasQuestion[];
}

export interface CanvasQuestion {
  id: string;
  questionTypeId: number;
  questionText: string;
  questionCode?: string;
  helpText?: string;
  placeholderText?: string;
  isRequired: boolean;
  displayOrder: number;
  isActive: boolean;
  isPhi: boolean;
  
  // Validation
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  regexPattern?: string;
  regexErrorMessage?: string;
  
  // Options (for select/radio/checkbox types)
  options: CanvasQuestionOption[];
  
  // Conditional Rules
  conditionalRules: CanvasConditionalRule[];
  
  // Styling
  backgroundColor?: string;
  borderColor?: string;
  
  // Medical Codes
  cptCode?: string;
  loincCode?: string;
  snomedCode?: string;
  
  // Calculated
  isCalculated: boolean;
  calculationFormula?: string;
  defaultValue?: string;
  
  // Table/Matrix configuration (matches API structure)
  rows?: CanvasTableRow[];
  cols?: CanvasTableCol[];
}

export interface CanvasQuestionOption {
  id: string;
  text: string;
  value?: string;
  numericScore?: number;
  displayOrder: number;
}

export interface CanvasConditionalRule {
  id: string;
  ruleGroupId?: string;
  sourceQuestionId?: string;
  operator: ConditionalOperator;
  compareValue?: string;
  compareToQuestionId?: string;
  actionType: ConditionalActionType;
  joinType?: ConditionalJoinType;
  sortOrder: number;
}

// Table Row/Column Types
export interface CanvasTableRow {
  rowId: string;
  rowCode: string;
  rowLabel: string;
  sortOrder: number;
}

export interface CanvasTableCol {
  colId: string;
  colCode: string;
  colLabel: string;
  sortOrder: number;
  inputType: 'text' | 'number' | 'radio' | 'checkbox' | 'dropdown';
  options?: CanvasQuestionOption[];
}

export type ConditionalOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'is_empty'
  | 'is_not_empty';

export type ConditionalActionType =
  | 'show'
  | 'hide'
  | 'enable'
  | 'disable'
  | 'require';

export type ConditionalJoinType = 'AND' | 'OR';

// ============================================
// Form Builder State
// ============================================

export interface FormBuilderSelection {
  sectionIndex: number | null;
  questionIndex: number | null;
}

export interface FormBuilderDragState {
  isDragging: boolean;
  draggedItem: DragItem | null;
  dragOverSectionIndex: number | null;
  dragOverQuestionIndex: number | null;
}

export interface FormMetadata {
  code: string;
  name: string;
  description?: string;
  category?: string;
  isStandard: boolean;
  allowVersioning: boolean;
}

export interface FormBuilderStoreState {
  // Form Data
  metadata: FormMetadata;
  sections: CanvasSection[];
  
  // UI State
  selection: FormBuilderSelection;
  dragState: FormBuilderDragState;
  
  // Status
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  isDirty: boolean;
  lastSaved?: Date;
}

// ============================================
// Palette Configuration
// ============================================

export const PALETTE_CATEGORIES: PaletteCategory[] = [
  {
    id: 'basic',
    name: 'Basic Fields',
    icon: 'edit',
    expanded: true,
    items: [
      {
        id: 'text',
        questionTypeId: QuestionType.Text,
        name: 'Text Input',
        description: 'Single line text',
        icon: 'text_fields',
        category: 'basic',
        defaultConfig: { questionText: 'Text Question', placeholderText: 'Enter text...' }
      },
      {
        id: 'textarea',
        questionTypeId: QuestionType.TextArea,
        name: 'Text Area',
        description: 'Multi-line text',
        icon: 'notes',
        category: 'basic',
        defaultConfig: { questionText: 'Text Area Question', placeholderText: 'Enter detailed response...' }
      },
      {
        id: 'number',
        questionTypeId: QuestionType.Number,
        name: 'Number',
        description: 'Numeric input',
        icon: 'pin',
        category: 'basic',
        defaultConfig: { questionText: 'Number Question', placeholderText: '0' }
      }
    ]
  },
  {
    id: 'selection',
    name: 'Selection Fields',
    icon: 'list',
    expanded: true,
    items: [
      {
        id: 'yesno',
        questionTypeId: QuestionType.YesNo,
        name: 'Yes/No',
        description: 'Yes/No toggle',
        icon: 'toggle_on',
        category: 'selection',
        defaultConfig: { questionText: 'Yes/No Question' }
      },
      {
        id: 'radio',
        questionTypeId: QuestionType.RadioButton,
        name: 'Radio Buttons',
        description: 'Single selection',
        icon: 'radio_button_checked',
        category: 'selection',
        defaultConfig: {
          questionText: 'Radio Question',
          options: [
            { id: crypto.randomUUID(), text: 'Option 1', value: '1', displayOrder: 0 },
            { id: crypto.randomUUID(), text: 'Option 2', value: '2', displayOrder: 1 },
            { id: crypto.randomUUID(), text: 'Option 3', value: '3', displayOrder: 2 }
          ]
        }
      },
      {
        id: 'multiplechoice',
        questionTypeId: QuestionType.MultipleChoice,
        name: 'Multiple Choice',
        description: 'Single selection from list',
        icon: 'check_circle',
        category: 'selection',
        defaultConfig: {
          questionText: 'Multiple Choice Question',
          options: [
            { id: crypto.randomUUID(), text: 'Option A', value: 'a', displayOrder: 0 },
            { id: crypto.randomUUID(), text: 'Option B', value: 'b', displayOrder: 1 },
            { id: crypto.randomUUID(), text: 'Option C', value: 'c', displayOrder: 2 }
          ]
        }
      },
      {
        id: 'checkbox',
        questionTypeId: QuestionType.Checkbox,
        name: 'Checkboxes',
        description: 'Multiple selection',
        icon: 'check_box',
        category: 'selection',
        defaultConfig: {
          questionText: 'Checkbox Question',
          options: [
            { id: crypto.randomUUID(), text: 'Option A', value: 'a', displayOrder: 0 },
            { id: crypto.randomUUID(), text: 'Option B', value: 'b', displayOrder: 1 },
            { id: crypto.randomUUID(), text: 'Option C', value: 'c', displayOrder: 2 }
          ]
        }
      },
      {
        id: 'dropdown',
        questionTypeId: QuestionType.Dropdown,
        name: 'Dropdown',
        description: 'Dropdown selection',
        icon: 'arrow_drop_down_circle',
        category: 'selection',
        defaultConfig: {
          questionText: 'Dropdown Question',
          placeholderText: 'Select an option...',
          options: [
            { id: crypto.randomUUID(), text: 'Choice 1', value: '1', displayOrder: 0 },
            { id: crypto.randomUUID(), text: 'Choice 2', value: '2', displayOrder: 1 },
            { id: crypto.randomUUID(), text: 'Choice 3', value: '3', displayOrder: 2 }
          ]
        }
      }
    ]
  },
  {
    id: 'datetime',
    name: 'Date & Time',
    icon: 'event',
    expanded: false,
    items: [
      {
        id: 'date',
        questionTypeId: QuestionType.Date,
        name: 'Date Picker',
        description: 'Select date',
        icon: 'calendar_today',
        category: 'datetime',
        defaultConfig: { questionText: 'Date Question' }
      },
      {
        id: 'time',
        questionTypeId: QuestionType.Time,
        name: 'Time Picker',
        description: 'Select time',
        icon: 'schedule',
        category: 'datetime',
        defaultConfig: { questionText: 'Time Question' }
      },
      {
        id: 'datetime',
        questionTypeId: QuestionType.DateTime,
        name: 'Date & Time',
        description: 'Select date and time',
        icon: 'event',
        category: 'datetime',
        defaultConfig: { questionText: 'Date & Time Question' }
      }
    ]
  },
  {
    id: 'scale',
    name: 'Scale & Rating',
    icon: 'star',
    expanded: false,
    items: [
      {
        id: 'slider',
        questionTypeId: QuestionType.Slider,
        name: 'Slider',
        description: 'Numeric slider',
        icon: 'tune',
        category: 'scale',
        defaultConfig: { questionText: 'Slider Question', minValue: 0, maxValue: 100 }
      },
      {
        id: 'scale',
        questionTypeId: QuestionType.Scale,
        name: 'Rating Scale',
        description: 'Rating scale (1-5, 1-10)',
        icon: 'star_rate',
        category: 'scale',
        defaultConfig: { questionText: 'Rating Question', minValue: 1, maxValue: 5 }
      }
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced Fields',
    icon: 'widgets',
    expanded: false,
    items: [
      {
        id: 'matrix',
        questionTypeId: QuestionType.Matrix,
        name: 'Matrix',
        description: 'Grid with rows and columns',
        icon: 'grid_on',
        category: 'advanced',
        defaultConfig: { questionText: 'Matrix Question' }
      },
      {
        id: 'table',
        questionTypeId: QuestionType.Table,
        name: 'Table',
        description: 'Data table with configurable cells',
        icon: 'table_chart',
        category: 'advanced',
        defaultConfig: { questionText: 'Table Question' }
      },
      {
        id: 'calculated',
        questionTypeId: QuestionType.Calculated,
        name: 'Calculated',
        description: 'Formula-based calculation',
        icon: 'calculate',
        category: 'advanced',
        defaultConfig: { questionText: 'Calculated Field', isCalculated: true }
      },
      {
        id: 'file',
        questionTypeId: QuestionType.FileUpload,
        name: 'File Upload',
        description: 'Upload files',
        icon: 'upload_file',
        category: 'advanced',
        defaultConfig: { questionText: 'File Upload' }
      },
      {
        id: 'signature',
        questionTypeId: QuestionType.Signature,
        name: 'Signature',
        description: 'Digital signature',
        icon: 'draw',
        category: 'advanced',
        defaultConfig: { questionText: 'Signature' }
      }
    ]
  },
  {
    id: 'display',
    name: 'Display Fields',
    icon: 'info',
    expanded: false,
    items: [
      {
        id: 'richtext',
        questionTypeId: QuestionType.RichTextBlock,
        name: 'Rich Text Block',
        description: 'Formatted text content',
        icon: 'article',
        category: 'display',
        defaultConfig: { questionText: '<p>Enter rich text content here...</p>' }
      },
      {
        id: 'display',
        questionTypeId: QuestionType.Display,
        name: 'Display Text',
        description: 'Info text or header',
        icon: 'info',
        category: 'display',
        defaultConfig: { questionText: 'Display information text' }
      },
      {
        id: 'hidden',
        questionTypeId: QuestionType.Hidden,
        name: 'Hidden Field',
        description: 'Hidden data field',
        icon: 'visibility_off',
        category: 'display',
        defaultConfig: { questionText: 'Hidden Field' }
      }
    ]
  }
];

// ============================================
// Utility Functions
// ============================================

export function generateId(): string {
  return crypto.randomUUID();
}

export function createDefaultSection(sortOrder: number = 0): CanvasSection {
  return {
    id: generateId(),
    name: 'New Section',
    description: '',
    sortOrder,
    isCollapsed: false,
    isRepeatable: false,
    minRepeat: 1,
    maxRepeat: undefined,
    progressIndicator: true,
    isCollapsible: true,
    questions: []
  };
}

export function createDefaultQuestion(
  questionTypeId: number,
  displayOrder: number = 0,
  defaults?: Partial<CanvasQuestion>
): CanvasQuestion {
  return {
    id: generateId(),
    questionTypeId,
    questionText: defaults?.questionText || 'New Question',
    questionCode: defaults?.questionCode || '',
    helpText: defaults?.helpText || '',
    placeholderText: defaults?.placeholderText || '',
    isRequired: defaults?.isRequired ?? false,
    displayOrder,
    isActive: true,
    isPhi: false,
    minValue: defaults?.minValue,
    maxValue: defaults?.maxValue,
    minLength: defaults?.minLength,
    maxLength: defaults?.maxLength,
    regexPattern: defaults?.regexPattern || '',
    regexErrorMessage: defaults?.regexErrorMessage || '',
    options: defaults?.options?.map(opt => ({ ...opt, id: generateId() })) || [],
    conditionalRules: [],
    backgroundColor: defaults?.backgroundColor || '',
    borderColor: defaults?.borderColor || '',
    cptCode: defaults?.cptCode || '',
    loincCode: defaults?.loincCode || '',
    snomedCode: defaults?.snomedCode || '',
    isCalculated: defaults?.isCalculated ?? false,
    calculationFormula: defaults?.calculationFormula || '',
    defaultValue: defaults?.defaultValue || '',
    // Table/Matrix configuration
    rows: defaults?.rows || [],
    cols: defaults?.cols || []
  };
}

export function getQuestionTypeIcon(questionTypeId: number): string {
  const iconMap: Record<number, string> = {
    [QuestionType.Text]: 'text_fields',
    [QuestionType.TextArea]: 'notes',
    [QuestionType.Number]: 'pin',
    [QuestionType.YesNo]: 'toggle_on',
    [QuestionType.MultipleChoice]: 'check_circle',
    [QuestionType.Checkbox]: 'check_box',
    [QuestionType.Dropdown]: 'arrow_drop_down_circle',
    [QuestionType.RadioButton]: 'radio_button_checked',
    [QuestionType.Date]: 'calendar_today',
    [QuestionType.DateTime]: 'event',
    [QuestionType.Time]: 'schedule',
    [QuestionType.Slider]: 'tune',
    [QuestionType.Scale]: 'star_rate',
    [QuestionType.FileUpload]: 'upload_file',
    [QuestionType.Signature]: 'draw',
    [QuestionType.Matrix]: 'grid_on',
    [QuestionType.Calculated]: 'calculate',
    [QuestionType.Display]: 'info',
    [QuestionType.Hidden]: 'visibility_off',
    [QuestionType.RichTextBlock]: 'article',
    [QuestionType.Table]: 'table_chart'
  };
  return iconMap[questionTypeId] || 'help_outline';
}

export function getQuestionTypeName(questionTypeId: number): string {
  const nameMap: Record<number, string> = {
    [QuestionType.Text]: 'Text Input',
    [QuestionType.TextArea]: 'Text Area',
    [QuestionType.Number]: 'Number',
    [QuestionType.YesNo]: 'Yes/No',
    [QuestionType.MultipleChoice]: 'Multiple Choice',
    [QuestionType.Checkbox]: 'Checkboxes',
    [QuestionType.Dropdown]: 'Dropdown',
    [QuestionType.RadioButton]: 'Radio Buttons',
    [QuestionType.Date]: 'Date Picker',
    [QuestionType.DateTime]: 'Date & Time',
    [QuestionType.Time]: 'Time Picker',
    [QuestionType.Slider]: 'Slider',
    [QuestionType.Scale]: 'Rating Scale',
    [QuestionType.FileUpload]: 'File Upload',
    [QuestionType.Signature]: 'Signature',
    [QuestionType.Matrix]: 'Matrix',
    [QuestionType.Calculated]: 'Calculated',
    [QuestionType.Display]: 'Display Text',
    [QuestionType.Hidden]: 'Hidden Field',
    [QuestionType.RichTextBlock]: 'Rich Text Block',
    [QuestionType.Table]: 'Table'
  };
  return nameMap[questionTypeId] || 'Unknown';
}

export function questionTypeSupportsOptions(questionTypeId: number): boolean {
  return [
    QuestionType.MultipleChoice,
    QuestionType.Checkbox,
    QuestionType.Dropdown,
    QuestionType.RadioButton,
    QuestionType.Scale
  ].includes(questionTypeId);
}

