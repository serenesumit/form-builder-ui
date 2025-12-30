import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { FormBuilderStoreService } from '../../services/form-builder-store.service';
import { SortableQuestionComponent } from '../sortable-question/sortable-question.component';
import { CanvasSection, CanvasQuestion, PaletteItem } from '../../models/form-builder.types';

@Component({
  selector: 'app-form-canvas',
  standalone: true,
  imports: [CommonModule, DragDropModule, SortableQuestionComponent],
  templateUrl: './form-canvas.component.html',
  styleUrls: ['./form-canvas.component.scss']
})
export class FormCanvasComponent {
  readonly store = inject(FormBuilderStoreService);

  getDropListIds(): string[] {
    return this.store.sections().map((_, i) => `section-${i}`);
  }

  getAllDropListIds(): string[] {
    return ['palette-list', ...this.getDropListIds()];
  }

  onSectionDrop(event: CdkDragDrop<CanvasSection[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      this.store.moveSection(event.previousIndex, event.currentIndex);
    }
  }

  onQuestionDrop(event: CdkDragDrop<CanvasQuestion[]>, sectionIndex: number): void {
    const dragState = this.store.dragState();
    
    // Check if this is a drop from the palette
    if (event.previousContainer.id === 'palette-list') {
      const paletteItem = event.item.data as PaletteItem;
      if (paletteItem && paletteItem.questionTypeId) {
        this.store.addQuestionAtIndex(sectionIndex, event.currentIndex, paletteItem);
      }
      return;
    }
    
    // Moving within or between sections
    const previousSectionIndex = parseInt(event.previousContainer.id.replace('section-', ''), 10);
    
    if (event.previousContainer === event.container) {
      // Moving within the same section
      if (event.previousIndex !== event.currentIndex) {
        this.store.moveQuestion(
          sectionIndex,
          event.previousIndex,
          sectionIndex,
          event.currentIndex
        );
      }
    } else {
      // Moving between sections
      this.store.moveQuestion(
        previousSectionIndex,
        event.previousIndex,
        sectionIndex,
        event.currentIndex
      );
    }
  }

  onSelectQuestion(event: { sectionIndex: number; questionIndex: number }): void {
    this.store.selectQuestion(event.sectionIndex, event.questionIndex);
  }

  onDeleteQuestion(event: { sectionIndex: number; questionIndex: number }): void {
    if (confirm('Are you sure you want to delete this question?')) {
      this.store.removeQuestion(event.sectionIndex, event.questionIndex);
    }
  }

  onDuplicateQuestion(event: { sectionIndex: number; questionIndex: number }): void {
    this.store.duplicateQuestion(event.sectionIndex, event.questionIndex);
  }

  onSelectSection(sectionIndex: number, event: MouseEvent): void {
    event.stopPropagation();
    this.store.selectSection(sectionIndex);
  }

  onToggleSectionCollapse(sectionIndex: number, event: MouseEvent): void {
    event.stopPropagation();
    this.store.toggleSectionCollapse(sectionIndex);
  }

  onDeleteSection(sectionIndex: number, event: MouseEvent): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this section and all its questions?')) {
      this.store.removeSection(sectionIndex);
    }
  }

  onAddSection(): void {
    this.store.addSection();
  }

  onClearCanvas(): void {
    this.store.clearSelection();
  }

  isQuestionSelected(sectionIndex: number, questionIndex: number): boolean {
    const selection = this.store.selection();
    return selection.sectionIndex === sectionIndex && selection.questionIndex === questionIndex;
  }

  isSectionSelected(sectionIndex: number): boolean {
    const selection = this.store.selection();
    return selection.sectionIndex === sectionIndex && selection.questionIndex === null;
  }
}

