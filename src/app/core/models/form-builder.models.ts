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

export interface SaveFormResult {
  definitionId: string;
  versionId: string;
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

// Question Types Reference
export enum QuestionType {
  Text = 1,
  TextArea = 2,
  Radio = 3,
  Checkbox = 4,
  Date = 5,
  Time = 6,
  DateTime = 7,
  Number = 8,
  Email = 9,
  Phone = 10,
  Dropdown = 11,
  Slider = 12,
  Rating = 13,
  FileUpload = 14,
  Signature = 15
}

export interface QuestionTypeInfo {
  id: number;
  name: string;
  description: string;
  supportsOptions: boolean;
}

export const QUESTION_TYPES: QuestionTypeInfo[] = [
  { id: 1, name: 'Text', description: 'Single-line text input', supportsOptions: false },
  { id: 2, name: 'TextArea', description: 'Multi-line text input', supportsOptions: false },
  { id: 3, name: 'Radio', description: 'Single selection from options', supportsOptions: true },
  { id: 4, name: 'Checkbox', description: 'Multiple selections from options', supportsOptions: true },
  { id: 5, name: 'Date', description: 'Date picker', supportsOptions: false },
  { id: 6, name: 'Time', description: 'Time picker', supportsOptions: false },
  { id: 7, name: 'DateTime', description: 'Date and time picker', supportsOptions: false },
  { id: 8, name: 'Number', description: 'Numeric input', supportsOptions: false },
  { id: 9, name: 'Email', description: 'Email input with validation', supportsOptions: false },
  { id: 10, name: 'Phone', description: 'Phone number input', supportsOptions: false },
  { id: 11, name: 'Dropdown', description: 'Dropdown selection', supportsOptions: true },
  { id: 12, name: 'Slider', description: 'Numeric slider', supportsOptions: false },
  { id: 13, name: 'Rating', description: 'Star or numeric rating', supportsOptions: true },
  { id: 14, name: 'FileUpload', description: 'File upload', supportsOptions: false },
  { id: 15, name: 'Signature', description: 'Digital signature', supportsOptions: false }
];

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
