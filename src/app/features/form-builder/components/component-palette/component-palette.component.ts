import { Component, inject, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { FormBuilderStoreService } from '../../services/form-builder-store.service';
import { PaletteItem } from '../../models/form-builder.types';

@Component({
  selector: 'app-component-palette',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './component-palette.component.html',
  styleUrls: ['./component-palette.component.scss']
})
export class ComponentPaletteComponent {
  readonly store = inject(FormBuilderStoreService);

  readonly itemDragStart = output<PaletteItem>();
  readonly itemDragEnd = output<void>();

  // Get connected drop list IDs for the canvas sections
  getConnectedDropLists(): string[] {
    return this.store.sections().map((_, i) => `section-${i}`);
  }

  // Prevent items from being dropped back into the palette
  noReturnPredicate(): boolean {
    return false;
  }

  onDragStarted(item: PaletteItem): void {
    this.store.setDragStart({
      type: 'PALETTE_ITEM',
      questionTypeId: item.questionTypeId,
      data: item
    });
    this.itemDragStart.emit(item);
  }

  onDragEnded(): void {
    this.store.setDragEnd();
    this.itemDragEnd.emit();
  }

  toggleCategory(categoryId: string): void {
    this.store.togglePaletteCategory(categoryId);
  }
}

