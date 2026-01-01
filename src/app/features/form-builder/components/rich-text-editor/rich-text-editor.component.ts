import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  RichTextEditorModule, 
  RichTextEditorComponent as SyncfusionRTE,
  ToolbarService, 
  LinkService, 
  ImageService, 
  HtmlEditorService,
  QuickToolbarService,
  TableService,
  CountService,
  ToolbarSettingsModel,
  QuickToolbarSettingsModel
} from '@syncfusion/ej2-angular-richtexteditor';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorModule],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, QuickToolbarService, TableService, CountService],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss']
})
export class RichTextEditorComponent implements OnInit {
  @ViewChild('rte') rteObj!: SyncfusionRTE;
  
  @Input() value = '';
  @Input() placeholder = 'Enter rich text content here...';
  @Input() height = 300;
  
  @Output() valueChange = new EventEmitter<string>();

  toolbarSettings: ToolbarSettingsModel = {
    items: [
      'Bold', 'Italic', 'Underline', 'StrikeThrough', '|',
      'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
      'Formats', 'Alignments', '|',
      'OrderedList', 'UnorderedList', 'Outdent', 'Indent', '|',
      'CreateLink', 'CreateTable', '|',
      'ClearFormat', 'SourceCode', '|',
      'Undo', 'Redo'
    ]
  };

  quickToolbarSettings: QuickToolbarSettingsModel = {
    table: ['TableHeader', 'TableRows', 'TableColumns', 'TableCell', '-', 'BackgroundColor', 'TableRemove', 'TableCellVerticalAlign', 'Styles'],
    link: ['Open', 'Edit', 'UnLink']
  };

  ngOnInit(): void {
    // Component initialization
  }

  onValueChange(): void {
    if (this.rteObj) {
      const content = this.rteObj.value;
      this.valueChange.emit(content);
    }
  }

  onCreated(): void {
    // RTE is ready
  }
}

