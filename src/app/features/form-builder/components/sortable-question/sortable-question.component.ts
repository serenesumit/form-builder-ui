import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilderStoreService } from '../../services/form-builder-store.service';
import { CanvasQuestion, getQuestionTypeIcon, getQuestionTypeName, questionTypeSupportsOptions } from '../../models/form-builder.types';
import { QuestionType } from '../../../../core/models/form-builder.models';

@Component({
  selector: 'app-sortable-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sortable-question.component.html',
  styleUrls: ['./sortable-question.component.scss']
})
export class SortableQuestionComponent {
  readonly store = inject(FormBuilderStoreService);

  // Inputs
  readonly question = input.required<CanvasQuestion>();
  readonly sectionIndex = input.required<number>();
  readonly questionIndex = input.required<number>();
  readonly isSelected = input<boolean>(false);
  readonly isDragging = input<boolean>(false);

  // Outputs
  readonly selectQuestion = output<{ sectionIndex: number; questionIndex: number }>();
  readonly deleteQuestion = output<{ sectionIndex: number; questionIndex: number }>();
  readonly duplicateQuestion = output<{ sectionIndex: number; questionIndex: number }>();

  get typeIcon(): string {
    return getQuestionTypeIcon(this.question().questionTypeId);
  }

  get typeName(): string {
    return getQuestionTypeName(this.question().questionTypeId);
  }

  get hasOptions(): boolean {
    return questionTypeSupportsOptions(this.question().questionTypeId);
  }

  get optionCount(): number {
    return this.question().options?.length || 0;
  }

  get isRichTextBlock(): boolean {
    return this.question().questionTypeId === QuestionType.RichTextBlock;
  }

  get isDisplayType(): boolean {
    return this.question().questionTypeId === QuestionType.Display;
  }

  get isHtmlContent(): boolean {
    return this.isRichTextBlock || this.isDisplayType;
  }

  onSelect(event: MouseEvent): void {
    event.stopPropagation();
    this.selectQuestion.emit({
      sectionIndex: this.sectionIndex(),
      questionIndex: this.questionIndex()
    });
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteQuestion.emit({
      sectionIndex: this.sectionIndex(),
      questionIndex: this.questionIndex()
    });
  }

  onDuplicate(event: MouseEvent): void {
    event.stopPropagation();
    this.duplicateQuestion.emit({
      sectionIndex: this.sectionIndex(),
      questionIndex: this.questionIndex()
    });
  }
}

