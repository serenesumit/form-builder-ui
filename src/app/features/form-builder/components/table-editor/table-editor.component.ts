import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasQuestion, CanvasTableRow, CanvasTableCol } from '../../models/form-builder.types';

type TableEditorTab = 'rows' | 'columns' | 'preview';

@Component({
  selector: 'app-table-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-editor.component.html',
  styleUrls: ['./table-editor.component.scss']
})
export class TableEditorComponent {
  @Input() question!: CanvasQuestion;
  @Output() questionChange = new EventEmitter<Partial<CanvasQuestion>>();

  activeTab: TableEditorTab = 'rows';
  defaultInputType: 'text' | 'number' | 'radio' | 'checkbox' | 'dropdown' = 'text';

  get rows(): CanvasTableRow[] {
    // API uses 'rows' property
    return (this.question as any).rows || [];
  }

  get columns(): CanvasTableCol[] {
    // API uses 'cols' property
    return (this.question as any).cols || [];
  }

  setActiveTab(tab: TableEditorTab): void {
    this.activeTab = tab;
  }

  setDefaultInputType(type: 'text' | 'number' | 'radio' | 'checkbox' | 'dropdown'): void {
    this.defaultInputType = type;
    this.questionChange.emit({ defaultInputType: type } as any);
  }

  // Row Management
  addRow(): void {
    const newRow: CanvasTableRow = {
      rowId: `row-${Math.random().toString(36).substr(2, 9)}`,
      rowCode: `ROW_${this.rows.length + 1}`,
      rowLabel: `Row ${this.rows.length + 1}`,
      sortOrder: this.rows.length
    };
    // Emit using 'rows' to match API structure
    this.questionChange.emit({ rows: [...this.rows, newRow] } as any);
  }

  updateRow(index: number, field: keyof CanvasTableRow, value: string | number): void {
    const updatedRows = [...this.rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    updatedRows.forEach((row, i) => row.sortOrder = i);
    this.questionChange.emit({ rows: updatedRows } as any);
  }

  deleteRow(index: number): void {
    const updatedRows = this.rows.filter((_, i) => i !== index);
    updatedRows.forEach((row, i) => row.sortOrder = i);
    this.questionChange.emit({ rows: updatedRows } as any);
  }

  moveRow(index: number, direction: 'up' | 'down'): void {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.rows.length) return;
    
    const updatedRows = [...this.rows];
    [updatedRows[index], updatedRows[newIndex]] = [updatedRows[newIndex], updatedRows[index]];
    updatedRows.forEach((row, i) => row.sortOrder = i);
    this.questionChange.emit({ rows: updatedRows } as any);
  }

  // Column Management
  addColumn(): void {
    const newCol: CanvasTableCol = {
      colId: `col-${Math.random().toString(36).substr(2, 9)}`,
      colCode: `COL_${this.columns.length + 1}`,
      colLabel: `Column ${this.columns.length + 1}`,
      sortOrder: this.columns.length,
      inputType: this.defaultInputType
    };
    // Emit using 'cols' to match API structure
    this.questionChange.emit({ cols: [...this.columns, newCol] } as any);
  }

  updateColumn(index: number, field: keyof CanvasTableCol, value: string | number): void {
    const updatedCols = [...this.columns];
    updatedCols[index] = { ...updatedCols[index], [field]: value };
    updatedCols.forEach((col, i) => col.sortOrder = i);
    this.questionChange.emit({ cols: updatedCols } as any);
  }

  deleteColumn(index: number): void {
    const updatedCols = this.columns.filter((_, i) => i !== index);
    updatedCols.forEach((col, i) => col.sortOrder = i);
    this.questionChange.emit({ cols: updatedCols } as any);
  }

  moveColumn(index: number, direction: 'up' | 'down'): void {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.columns.length) return;
    
    const updatedCols = [...this.columns];
    [updatedCols[index], updatedCols[newIndex]] = [updatedCols[newIndex], updatedCols[index]];
    updatedCols.forEach((col, i) => col.sortOrder = i);
    this.questionChange.emit({ cols: updatedCols } as any);
  }

  getCellCount(): number {
    return this.rows.length * this.columns.length;
  }
}

