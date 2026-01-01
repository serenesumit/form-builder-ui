// Core Models for Form Builder API

export interface SaveFormRequest {
  definitionId?: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  isStandard: boolean;
  isActive?: boolean;
  allowVersioning?: boolean;
  changeNotes?: string;
  sections: FormBuilderSectionRequest[];
}

export interface FormBuilderSectionRequest {
  sectionId?: string | null;
  sectionName: string;
  sectionDescription?: string;
  sortOrder: number;
  isRepeatable: boolean;
  minRepeat: number;
  maxRepeat?: number | null;
  progressIndicator: boolean;
  isCollapsible: boolean;
  questions: FormQuestionRequest[];
}

export interface FormQuestionRequest {
  questionId?: string | null;
  questionCode?: string;
  questionText: string;
  questionTypeId: number;
  helpText?: string;
  isRequired: boolean;
  displayOrder: number;
  isActive: boolean;
  backgroundColor?: string;
  borderColor?: string;
  height?: number | null;
  placeholderText?: string;
  defaultValue?: string;
  isPhi: boolean;
  cptCode?: string;
  loincCode?: string;
  snomedCode?: string;
  isCalculated: boolean;
  calculationFormula?: string;
  minValue?: number | null;
  maxValue?: number | null;
  minLength?: number | null;
  maxLength?: number | null;
  regexPattern?: string;
  regexErrorMessage?: string;
  options: FormQuestionOptionRequest[];
  conditionalRules: FormBuilderConditionalRuleRequest[];
  validationRules?: FormBuilderValidationRuleRequest[];
  rows?: FormBuilderMatrixRowRequest[];
  cols?: FormBuilderMatrixColRequest[];
}

export interface FormQuestionOptionRequest {
  optionId?: string | null;
  optionText: string;
  optionValue?: string;
  numericScore?: number | null;
  displayOrder: number;
}

export interface FormBuilderConditionalRuleRequest {
  ruleId?: string | null;
  ruleGroupId?: string | null;
  sourceQuestionId?: string | null;
  operator: ConditionalOperator;
  compareValue?: string;
  compareToQuestionId?: string | null;
  actionType: ConditionalActionType;
  joinType?: ConditionalJoinType;
  sortOrder: number;
}

export interface FormBuilderValidationRuleRequest {
  validationId?: string | null;
  ruleName: string;
  expression: string;
  errorMessage: string;
  isActive: boolean;
}

export interface FormBuilderMatrixRowRequest {
  rowId?: string | null;
  rowCode?: string;
  rowLabel: string;
  sortOrder: number;
}

export interface FormBuilderMatrixColRequest {
  colId?: string | null;
  colCode: string;
  colLabel: string;
  sortOrder: number;
  inputType?: string;
  optionsJson?: string;
}

export interface SaveFormResult {
  definitionId: string;
  versionId: string;
}

// Version-related interfaces
export enum VersionStatus {
  Draft = 'Draft',
  Published = 'Published',
  Retired = 'Retired',
  Archived = 'Archived'
}

export interface FormVersionDto {
  versionId: string;
  definitionId: string;
  versionNumber: number;
  versionLabel?: string;
  name?: string;
  description?: string;
  status: VersionStatus;
  createdDate: string;
  publishedDate?: string;
  retiredDate?: string;
  createdBy?: string;
  changeNotes?: string;
}

export interface FormListItemDto {
  definitionId: string;
  currentVersionId?: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  isStandard: boolean;
  createdDate: string;
  modifiedDate: string;
  versionCount: number;
}

// API Response DTOs (matching backend FormDefinitionResponse)
export interface FormBuilderDto {
  tenantId?: string;
  definitionId: string;
  latestVersionId?: string;
  versionId?: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  isStandard?: boolean;
  sections?: FormBuilderSectionDto[];
  // Legacy format: questions at root level without sections
  questions?: FormBuilderQuestionDto[];
}

export interface FormBuilderSectionDto {
  sectionId: string;
  sectionName: string;
  sectionDescription?: string;
  sortOrder: number;
  isRepeatable: boolean;
  minRepeat: number;
  maxRepeat?: number | null;
  progressIndicator: boolean;
  isCollapsible?: boolean;
  questions: FormBuilderQuestionDto[];
}

export interface FormBuilderQuestionDto {
  questionId: string;
  sectionId?: string;
  questionCode?: string;
  questionText: string;
  questionTypeId: number;
  questionTypeName?: string;
  helpText?: string;
  isRequired: boolean;
  sortOrder?: number;
  displayOrder?: number; // Alternative field name used by some API responses
  backgroundColor?: string;
  borderColor?: string;
  height?: number | null;
  isStandardForm?: boolean;
  displayOnEncounter?: boolean;
  minValue?: number | null;
  maxValue?: number | null;
  stepValue?: number | null;
  minLength?: number | null;
  maxLength?: number | null;
  regexPattern?: string;
  regexErrorMessage?: string;
  placeholderText?: string;
  defaultValue?: string;
  isPHI?: boolean;
  cptCode?: string;
  loincCode?: string;
  snomedCode?: string;
  isCalculated?: boolean;
  calculationExpression?: string;
  options: FormBuilderOptionDto[];
  conditionalRules?: FormBuilderConditionalRuleDto[];
  validationRules?: FormBuilderValidationRuleDto[];

  // Matrix configuration (legacy)
  rows?: FormBuilderMatrixRowRequest[];
  cols?: FormBuilderMatrixColRequest[];

  // Table configuration (new)
  tableConfig?: TableConfig;
}

export interface FormBuilderOptionDto {
  optionId: string;
  optionText: string;
  optionValue?: string;
  numericScore?: number | null;
  score?: number | null; // Alternative field name used by some API responses
  sortOrder?: number;
  displayOrder?: number; // Alternative field name used by some API responses
}

export interface FormBuilderConditionalRuleDto {
  ruleId: string;
  sourceQuestionId?: string;
  operator: string;
  compareValue?: string;
  compareToQuestionId?: string;
  actionType: string;
  sortOrder: number;
}

export interface FormBuilderValidationRuleDto {
  validationId: string;
  ruleName: string;
  expression: string;
  errorMessage: string;
  isActive: boolean;
}

// Enums
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

// Question Types Reference (matching database IDs 1-21)
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

// Legacy mappings for backward compatibility
export const LegacyQuestionType = {
  Radio: QuestionType.RadioButton,
  Email: QuestionType.Text,  // Use text with validation
  Phone: QuestionType.Text,  // Use text with validation
  Rating: QuestionType.Scale
};

export type QuestionTypeCategory = 'Input' | 'Selection' | 'DateTime' | 'Scale' | 'Advanced' | 'Display';

export interface QuestionTypeInfo {
  id: number;
  name: string;
  description: string;
  category: QuestionTypeCategory;
  supportsOptions: boolean;
  icon?: string;
}

export const QUESTION_TYPES: QuestionTypeInfo[] = [
  // Input Types
  { id: 1, name: 'Text', description: 'Single-line text input', category: 'Input', supportsOptions: false, icon: 'text' },
  { id: 2, name: 'TextArea', description: 'Multi-line text input', category: 'Input', supportsOptions: false, icon: 'textarea' },
  { id: 3, name: 'Number', description: 'Numeric input', category: 'Input', supportsOptions: false, icon: 'number' },

  // Selection Types
  { id: 4, name: 'YesNo', description: 'Yes/No toggle', category: 'Selection', supportsOptions: false, icon: 'toggle' },
  { id: 5, name: 'MultipleChoice', description: 'Single selection from options', category: 'Selection', supportsOptions: true, icon: 'list' },
  { id: 6, name: 'Checkbox', description: 'Multiple selections from options', category: 'Selection', supportsOptions: true, icon: 'checkbox' },
  { id: 7, name: 'Dropdown', description: 'Dropdown selection', category: 'Selection', supportsOptions: true, icon: 'dropdown' },
  { id: 8, name: 'RadioButton', description: 'Radio button selection', category: 'Selection', supportsOptions: true, icon: 'radio' },

  // DateTime Types
  { id: 9, name: 'Date', description: 'Date picker', category: 'DateTime', supportsOptions: false, icon: 'calendar' },
  { id: 10, name: 'DateTime', description: 'Date and time picker', category: 'DateTime', supportsOptions: false, icon: 'datetime' },
  { id: 11, name: 'Time', description: 'Time picker', category: 'DateTime', supportsOptions: false, icon: 'clock' },

  // Scale Types
  { id: 12, name: 'Slider', description: 'Numeric slider', category: 'Scale', supportsOptions: false, icon: 'slider' },
  { id: 13, name: 'Scale', description: 'Rating scale (1-5, 1-10, etc.)', category: 'Scale', supportsOptions: false, icon: 'star' },

  // Advanced Types
  { id: 14, name: 'FileUpload', description: 'File upload', category: 'Advanced', supportsOptions: false, icon: 'upload' },
  { id: 15, name: 'Signature', description: 'Digital signature', category: 'Advanced', supportsOptions: false, icon: 'pen' },
  { id: 16, name: 'Matrix', description: 'Matrix/Grid with rows and columns', category: 'Advanced', supportsOptions: false, icon: 'grid' },
  { id: 17, name: 'Calculated', description: 'Calculated field (formula-based)', category: 'Advanced', supportsOptions: false, icon: 'calculator' },
  { id: 21, name: 'Table', description: 'Data table with configurable cells', category: 'Advanced', supportsOptions: false, icon: 'table' },

  // Display Types
  { id: 18, name: 'Display', description: 'Display-only text/HTML content', category: 'Display', supportsOptions: false, icon: 'info' },
  { id: 19, name: 'Hidden', description: 'Hidden field', category: 'Display', supportsOptions: false, icon: 'hidden' },
  { id: 20, name: 'RichTextBlock', description: 'Rich text content block', category: 'Display', supportsOptions: false, icon: 'richtext' }
];

// Table Configuration Interfaces
export interface TableRowConfig {
  rowId?: string;
  rowLabel: string;
  sortOrder: number;
}

export interface TableColumnConfig {
  columnId?: string;
  columnLabel: string;
  sortOrder: number;
  inputType: 'text' | 'number' | 'radio' | 'checkbox' | 'dropdown';
  options?: FormBuilderOptionDto[]; // For dropdown column types
}

export interface TableConfig {
  rows: TableRowConfig[];
  columns: TableColumnConfig[];
}

// API Error Response
export interface ApiError {
  error: string;
}

// Result wrapper
export interface Result<T> {
  isSuccess: boolean;
  value?: T;
  error?: string;
}
