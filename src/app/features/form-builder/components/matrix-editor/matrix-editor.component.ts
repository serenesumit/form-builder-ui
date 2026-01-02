import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasQuestion, CanvasTableRow, CanvasTableCol, CanvasQuestionOption } from '../../models/form-builder.types';

type MatrixEditorTab = 'rows' | 'columns' | 'preview';

@Component({
  selector: 'app-matrix-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matrix-editor.component.html',
  styleUrls: ['./matrix-editor.component.scss']
})
export class MatrixEditorComponent {
  @Input() question!: CanvasQuestion;
  @Output() questionChange = new EventEmitter<Partial<CanvasQuestion>>();

  activeTab: MatrixEditorTab = 'rows';
  matrixInputType: 'radio' | 'checkbox' | 'text' | 'number' | 'dropdown' = 'radio';

  get rows(): CanvasTableRow[] {
    return (this.question as any).rows || [];
  }

  get columns(): CanvasTableCol[] {
    return (this.question as any).cols || [];
  }

  setActiveTab(tab: MatrixEditorTab): void {
    this.activeTab = tab;
  }

  setMatrixInputType(type: 'radio' | 'checkbox' | 'text' | 'number' | 'dropdown'): void {
    this.matrixInputType = type;
    // Update all columns to use this input type
    const updatedCols = this.columns.map(col => ({
      ...col,
      inputType: type
    }));
    this.questionChange.emit({ cols: updatedCols } as any);
  }

  // Row Management
  addRow(): void {
    const newRow: CanvasTableRow = {
      rowId: `row-${Math.random().toString(36).substr(2, 9)}`,
      rowCode: `ROW_${this.rows.length + 1}`,
      rowLabel: `Row ${this.rows.length + 1}`,
      sortOrder: this.rows.length
    };
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
      inputType: this.matrixInputType,
      options: []
    };
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

  // Column Options Management (for dropdown type)
  addColumnOption(colIndex: number): void {
    const updatedCols = [...this.columns];
    const col = updatedCols[colIndex];
    const options = col.options || [];

    const newOption: CanvasQuestionOption = {
      id: crypto.randomUUID(),
      text: `Option ${options.length + 1}`,
      value: `${options.length + 1}`,
      displayOrder: options.length
    };

    updatedCols[colIndex] = {
      ...col,
      options: [...options, newOption]
    };

    this.questionChange.emit({ cols: updatedCols } as any);
  }

  updateColumnOption(colIndex: number, optionIndex: number, field: 'text' | 'value', value: string): void {
    const updatedCols = [...this.columns];
    const col = updatedCols[colIndex];
    const options = [...(col.options || [])];

    options[optionIndex] = {
      ...options[optionIndex],
      [field]: value
    };

    updatedCols[colIndex] = {
      ...col,
      options
    };

    this.questionChange.emit({ cols: updatedCols } as any);
  }

  deleteColumnOption(colIndex: number, optionIndex: number): void {
    const updatedCols = [...this.columns];
    const col = updatedCols[colIndex];
    const options = (col.options || []).filter((_, i) => i !== optionIndex);

    // Reorder
    options.forEach((opt, i) => opt.displayOrder = i);

    updatedCols[colIndex] = {
      ...col,
      options
    };

    this.questionChange.emit({ cols: updatedCols } as any);
  }

  getCellCount(): number {
    return this.rows.length * this.columns.length;
  }

  needsOptions(col: CanvasTableCol): boolean {
    return col.inputType === 'dropdown';
  }
}
