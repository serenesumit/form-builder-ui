import { Component, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FormVersionDto, VersionStatus } from '@core/models/form-builder.models';

@Component({
  selector: 'app-version-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropDownListModule,
    ButtonModule
  ],
  templateUrl: './version-selector.component.html',
  styleUrls: ['./version-selector.component.scss']
})
export class VersionSelectorComponent {
  @Input() set versions(value: FormVersionDto[]) {
    this._versions.set(value || []);
  }
  
  @Input() set currentVersionId(value: string | null) {
    this._currentVersionId.set(value);
  }
  
  @Input() isLoading = false;
  
  @Output() versionChange = new EventEmitter<string>();

  readonly _versions = signal<FormVersionDto[]>([]);
  readonly _currentVersionId = signal<string | null>(null);

  // Computed values
  readonly sortedVersions = computed(() => {
    return [...this._versions()].sort((a, b) => b.versionNumber - a.versionNumber);
  });

  readonly currentVersion = computed(() => {
    const versionId = this._currentVersionId();
    return this._versions().find(v => v.versionId === versionId) || null;
  });

  readonly dropdownData = computed(() => {
    return this.sortedVersions().map(v => ({
      text: `Version ${v.versionNumber} - ${v.status}${v.changeNotes ? ` (${v.changeNotes.substring(0, 30)}...)` : ''}`,
      value: v.versionId,
      versionNumber: v.versionNumber,
      status: v.status
    }));
  });

  readonly fields = { text: 'text', value: 'value' };

  getStatusClass(status: VersionStatus): string {
    switch (status) {
      case VersionStatus.Draft:
        return 'status-draft';
      case VersionStatus.Published:
        return 'status-published';
      case VersionStatus.Retired:
        return 'status-retired';
      default:
        return 'status-archived';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  onVersionSelect(event: any): void {
    if (event.itemData?.value) {
      this.versionChange.emit(event.itemData.value);
    }
  }
}

