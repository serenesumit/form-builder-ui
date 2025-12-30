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
      },
      {
        id: 'email',
        questionTypeId: QuestionType.Email,
        name: 'Email',
        description: 'Email address',
        icon: 'email',
        category: 'basic',
        defaultConfig: { questionText: 'Email Address', placeholderText: 'email@example.com' }
      },
      {
        id: 'phone',
        questionTypeId: QuestionType.Phone,
        name: 'Phone',
        description: 'Phone number',
        icon: 'phone',
        category: 'basic',
        defaultConfig: { questionText: 'Phone Number', placeholderText: '(555) 123-4567' }
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
        id: 'radio',
        questionTypeId: QuestionType.Radio,
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
    id: 'advanced',
    name: 'Advanced Fields',
    icon: 'star',
    expanded: false,
    items: [
      {
        id: 'slider',
        questionTypeId: QuestionType.Slider,
        name: 'Slider',
        description: 'Numeric slider',
        icon: 'tune',
        category: 'advanced',
        defaultConfig: { questionText: 'Slider Question', minValue: 0, maxValue: 100 }
      },
      {
        id: 'rating',
        questionTypeId: QuestionType.Rating,
        name: 'Rating',
        description: 'Star rating',
        icon: 'star_rate',
        category: 'advanced',
        defaultConfig: {
          questionText: 'Rating Question',
          options: [
            { id: crypto.randomUUID(), text: '1', value: '1', numericScore: 1, displayOrder: 0 },
            { id: crypto.randomUUID(), text: '2', value: '2', numericScore: 2, displayOrder: 1 },
            { id: crypto.randomUUID(), text: '3', value: '3', numericScore: 3, displayOrder: 2 },
            { id: crypto.randomUUID(), text: '4', value: '4', numericScore: 4, displayOrder: 3 },
            { id: crypto.randomUUID(), text: '5', value: '5', numericScore: 5, displayOrder: 4 }
          ]
        }
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
    defaultValue: defaults?.defaultValue || ''
  };
}

export function getQuestionTypeIcon(questionTypeId: number): string {
  const iconMap: Record<number, string> = {
    [QuestionType.Text]: 'text_fields',
    [QuestionType.TextArea]: 'notes',
    [QuestionType.Radio]: 'radio_button_checked',
    [QuestionType.Checkbox]: 'check_box',
    [QuestionType.Date]: 'calendar_today',
    [QuestionType.Time]: 'schedule',
    [QuestionType.DateTime]: 'event',
    [QuestionType.Number]: 'pin',
    [QuestionType.Email]: 'email',
    [QuestionType.Phone]: 'phone',
    [QuestionType.Dropdown]: 'arrow_drop_down_circle',
    [QuestionType.Slider]: 'tune',
    [QuestionType.Rating]: 'star_rate',
    [QuestionType.FileUpload]: 'upload_file',
    [QuestionType.Signature]: 'draw'
  };
  return iconMap[questionTypeId] || 'help_outline';
}

export function getQuestionTypeName(questionTypeId: number): string {
  const nameMap: Record<number, string> = {
    [QuestionType.Text]: 'Text Input',
    [QuestionType.TextArea]: 'Text Area',
    [QuestionType.Radio]: 'Radio Buttons',
    [QuestionType.Checkbox]: 'Checkboxes',
    [QuestionType.Date]: 'Date Picker',
    [QuestionType.Time]: 'Time Picker',
    [QuestionType.DateTime]: 'Date & Time',
    [QuestionType.Number]: 'Number',
    [QuestionType.Email]: 'Email',
    [QuestionType.Phone]: 'Phone',
    [QuestionType.Dropdown]: 'Dropdown',
    [QuestionType.Slider]: 'Slider',
    [QuestionType.Rating]: 'Rating',
    [QuestionType.FileUpload]: 'File Upload',
    [QuestionType.Signature]: 'Signature'
  };
  return nameMap[questionTypeId] || 'Unknown';
}

export function questionTypeSupportsOptions(questionTypeId: number): boolean {
  return [
    QuestionType.Radio,
    QuestionType.Checkbox,
    QuestionType.Dropdown,
    QuestionType.Rating
  ].includes(questionTypeId);
}

