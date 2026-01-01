import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { 
  RichTextEditorModule, 
  ToolbarService, 
  LinkService, 
  ImageService, 
  HtmlEditorService,
  QuickToolbarService,
  TableService,
  CountService,
  ToolbarSettingsModel
} from '@syncfusion/ej2-angular-richtexteditor';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorModule],
  providers: [
    ToolbarService, 
    LinkService, 
    ImageService, 
    HtmlEditorService, 
    QuickToolbarService, 
    TableService, 
    CountService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss']
})
export class RichTextEditorComponent implements ControlValueAccessor {
  @Input() placeholder = 'Enter rich text content here...';
  @Input() height = 250;
  
  @Input() 
  set value(val: string) {
    this.content = val || '';
  }
  get value(): string {
    return this.content;
  }
  
  @Output() valueChange = new EventEmitter<string>();

  content = '';

  toolbarSettings: ToolbarSettingsModel = {
    items: [
      'Bold', 'Italic', 'Underline', 'StrikeThrough', '|',
      'FontName', 'FontSize', '|',
      'FontColor', 'BackgroundColor', '|',
      'Formats', '|',
      'Alignments', '|',
      'OrderedList', 'UnorderedList', 'Outdent', 'Indent', '|',
      'CreateLink', '|',
      'ClearFormat', 'SourceCode', '|',
      'Undo', 'Redo'
    ]
  };

  // ControlValueAccessor implementation
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.content = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onEditorChange(event: any): void {
    const newValue = event.value || '';
    this.content = newValue;
    this.valueChange.emit(newValue);
    this.onChange(newValue);
    this.onTouched();
  }
}
