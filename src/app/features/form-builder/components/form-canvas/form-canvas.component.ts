import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { FormBuilderStoreService } from '../../services/form-builder-store.service';
import { SortableQuestionComponent } from '../sortable-question/sortable-question.component';
import { CanvasSection, CanvasQuestion, PaletteItem } from '../../models/form-builder.types';

type ViewMode = 'list' | 'tabs';

@Component({
  selector: 'app-form-canvas',
  standalone: true,
  imports: [CommonModule, DragDropModule, SortableQuestionComponent],
  templateUrl: './form-canvas.component.html',
  styleUrls: ['./form-canvas.component.scss']
})
export class FormCanvasComponent {
  readonly store = inject(FormBuilderStoreService);

  // View mode: list (collapsible sections) or tabs
  readonly viewMode = signal<ViewMode>('list');
  readonly activeTabIndex = signal<number>(0);

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

  // View mode toggle
  toggleViewMode(): void {
    const current = this.viewMode();
    this.viewMode.set(current === 'list' ? 'tabs' : 'list');

    // If switching to tabs and no sections, stay on index 0
    // Otherwise, switch to the first section
    if (this.viewMode() === 'tabs' && this.store.sections().length > 0) {
      this.activeTabIndex.set(0);
    }
  }

  // Tab navigation
  selectTab(index: number): void {
    if (index >= 0 && index < this.store.sections().length) {
      this.activeTabIndex.set(index);
      // Auto-select the section when clicking its tab
      this.store.selectSection(index);
    }
  }

  getActiveSection(): CanvasSection | null {
    const sections = this.store.sections();
    const index = this.activeTabIndex();
    return index >= 0 && index < sections.length ? sections[index] : null;
  }
}

