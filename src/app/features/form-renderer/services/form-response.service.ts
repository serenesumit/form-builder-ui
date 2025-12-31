import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FormResponseAnswer {
  questionId: string;
  answerValue: string | null;
  optionId?: string | null;
  repeatIndex?: number | null;
  matrixRowId?: number | null;
  matrixColId?: number | null;
}

export interface SaveResponseRequest {
  responseId?: string | null;
  patientId: string;
  versionId: string;
  assignmentId?: string | null;
  admissionId?: string | null;
  answers: FormResponseAnswer[];
}

export interface FormResponse {
  responseId: string;
  patientId: string;
  admissionId?: string | null;
  versionId: string;
  assignmentId?: string | null;
  status: string;
  percentComplete?: number | null;
  totalScore?: number | null;
  interpretation?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  completedBy?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewNotes?: string | null;
  isSigned: boolean;
  signedAt?: string | null;
  signedBy?: string | null;
  answers: ResponseAnswerDto[];
}

export interface ResponseAnswerDto {
  answerId: string;
  questionId: string;
  optionId?: string | null;
  answerValue?: string | null;
  answerText?: string | null;
  numericValue?: number | null;
  dateValue?: string | null;
  booleanValue?: boolean | null;
  repeatIndex?: number | null;
  matrixRowId?: number | null;
  matrixColId?: number | null;
  isSkipped: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FormResponseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  saveResponse(tenantId: string, request: SaveResponseRequest): Observable<{ responseId: string }> {
    return this.http.post<{ responseId: string }>(
      `${this.baseUrl}/tenants/${tenantId}/form-responses`,
      request
    );
  }

  completeResponse(tenantId: string, responseId: string, completedBy: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/tenants/${tenantId}/form-responses/${responseId}/complete`,
      { completedBy }
    );
  }

  getResponse(tenantId: string, responseId: string): Observable<FormResponse> {
    return this.http.get<FormResponse>(
      `${this.baseUrl}/tenants/${tenantId}/form-responses/${responseId}`
    );
  }
}
