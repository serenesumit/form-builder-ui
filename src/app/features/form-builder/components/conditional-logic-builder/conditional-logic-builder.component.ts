import { Component, inject, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CanvasQuestion,
  CanvasConditionalRule,
  ConditionalOperator,
  ConditionalActionType,
  ConditionalJoinType,
  generateId
} from '../../models/form-builder.types';
import { FormBuilderStoreService } from '../../services/form-builder-store.service';

@Component({
  selector: 'app-conditional-logic-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conditional-logic-builder.component.html',
  styleUrls: ['./conditional-logic-builder.component.scss']
})
export class ConditionalLogicBuilderComponent {
  readonly store = inject(FormBuilderStoreService);

  // Inputs
  readonly question = input.required<CanvasQuestion>();
  readonly sectionIndex = input.required<number>();
  readonly questionIndex = input.required<number>();

  // Outputs
  readonly rulesChanged = output<CanvasConditionalRule[]>();

  // Local state for join type
  joinType = signal<ConditionalJoinType>('AND');

  // Computed: Get all questions that can be used as source (questions before this one)
  readonly availableSourceQuestions = computed(() => {
    const sections = this.store.sections();
    const currentSectionIndex = this.sectionIndex();
    const currentQuestionIndex = this.questionIndex();
    const availableQuestions: { id: string; text: string; sectionName: string }[] = [];

    sections.forEach((section, sIdx) => {
      section.questions.forEach((q, qIdx) => {
        // Only include questions that come before the current question
        if (sIdx < currentSectionIndex || (sIdx === currentSectionIndex && qIdx < currentQuestionIndex)) {
          availableQuestions.push({
            id: q.id,
            text: q.questionText || `Question ${qIdx + 1}`,
            sectionName: section.name
          });
        }
      });
    });

    return availableQuestions;
  });

  // Operators for the dropdown
  readonly operators: { value: ConditionalOperator; label: string }[] = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'contains', label: 'Contains' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' }
  ];

  // Action types for the dropdown
  readonly actionTypes: { value: ConditionalActionType; label: string }[] = [
    { value: 'show', label: 'Show' },
    { value: 'hide', label: 'Hide' },
    { value: 'enable', label: 'Enable' },
    { value: 'disable', label: 'Disable' },
    { value: 'require', label: 'Require' }
  ];

  // Check if operator requires a value input
  requiresValue(operator: ConditionalOperator): boolean {
    return !['is_empty', 'is_not_empty'].includes(operator);
  }

  // Add a new rule
  addRule(): void {
    const rules = [...this.question().conditionalRules];
    const newRule: CanvasConditionalRule = {
      id: generateId(),
      sourceQuestionId: '',
      operator: 'equals',
      compareValue: '',
      actionType: 'show',
      joinType: this.joinType(),
      sortOrder: rules.length
    };
    rules.push(newRule);
    this.rulesChanged.emit(rules);
  }

  // Update an existing rule
  updateRule(index: number, field: keyof CanvasConditionalRule, value: any): void {
    const rules = [...this.question().conditionalRules];
    if (rules[index]) {
      rules[index] = { ...rules[index], [field]: value };
      this.rulesChanged.emit(rules);
    }
  }

  // Delete a rule
  deleteRule(index: number): void {
    const rules = this.question().conditionalRules.filter((_, i) => i !== index);
    // Re-sort the remaining rules
    rules.forEach((rule, i) => {
      rule.sortOrder = i;
    });
    this.rulesChanged.emit(rules);
  }

  // Update join type for all rules
  updateJoinType(type: ConditionalJoinType): void {
    this.joinType.set(type);
    const rules = this.question().conditionalRules.map(rule => ({
      ...rule,
      joinType: type
    }));
    this.rulesChanged.emit(rules);
  }

  // Get source question display text
  getSourceQuestionText(sourceQuestionId: string): string {
    const sourceQuestion = this.availableSourceQuestions().find(q => q.id === sourceQuestionId);
    return sourceQuestion ? sourceQuestion.text : 'Select question...';
  }

  // Get options for selected source question (if it's a selection type)
  getSourceQuestionOptions(sourceQuestionId: string): { text: string; value: string }[] {
    const sections = this.store.sections();
    for (const section of sections) {
      const question = section.questions.find(q => q.id === sourceQuestionId);
      if (question && question.options.length > 0) {
        return question.options.map(opt => ({
          text: opt.text,
          value: opt.value || opt.text
        }));
      }
    }
    return [];
  }

  // Check if source question has options
  hasSourceQuestionOptions(sourceQuestionId: string): boolean {
    return this.getSourceQuestionOptions(sourceQuestionId).length > 0;
  }
}

