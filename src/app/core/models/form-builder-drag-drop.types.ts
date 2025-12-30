export enum QuestionType {
  Text = 1,
  TextArea = 2,
  Number = 3,
  YesNo = 4,
  MultipleChoice = 5,
  Checkbox = 6,
  Dropdown = 7,
  RadioButton = 8,
  Date = 9,
  DateTime = 10,
  Time = 11,
  Slider = 12,
  Scale = 13,
  FileUpload = 14,
  Signature = 15,
  Matrix = 16,
  Calculated = 17,
  Display = 18,
  Hidden = 19,
  RichTextBlock = 20,
  Table = 21
}

export interface QuestionOption {
  optionId: string;
  questionId: string;
  optionText: string;
  optionValue: string;
  sortOrder: number;
  isOther?: boolean;
}

export interface ConditionalRule {
  ruleId: string;
  questionId: string;
  targetQuestionId: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'is_empty' | 'is_not_empty';
  value: string;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
}

export interface QuestionMatrixRow {
  rowId: string;
  rowText: string;
  sortOrder: number;
}

export interface QuestionMatrixCol {
  colId: string;
  colText: string;
  sortOrder: number;
  inputType: 'radio' | 'checkbox' | 'text' | 'number' | 'dropdown';
}

export interface Question {
  questionId: string;
  sectionId: string;
  questionText: string;
  questionTypeId: QuestionType;
  sortOrder: number;
  isRequired: boolean;
  options?: QuestionOption[];
  helpText?: string;
  conditionalLogic?: ConditionalRule[];
  rows?: QuestionMatrixRow[];
  cols?: QuestionMatrixCol[];

  // Validation
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternErrorMessage?: string;

  // Styling
  backgroundColor?: string;
  borderColor?: string;
  padding?: string;

  // Medical coding
  isPHI?: boolean;
  cptCode?: string;
  loincCode?: string;
  snomedCode?: string;
  calculationExpression?: string;
}

export interface Section {
  sectionId: string;
  sectionName: string;
  sectionDescription?: string;
  sortOrder: number;
  questions?: Question[];
}

export interface FormDefinition {
  tenantId: string;
  definitionId?: string;
  code?: string;
  name: string;
  description?: string;
  sections: Section[];
  questions: Question[];
  isActive?: boolean;
  version?: number;
  status?: 'Draft' | 'Published' | 'Retired';
}

export interface DragItem {
  type: 'new-component' | 'existing-question';
  questionType?: QuestionType;
  questionId?: string;
  data?: any;
}

export interface QuestionTypeInfo {
  type: QuestionType;
  name: string;
  icon: string;
  category: string;
}
