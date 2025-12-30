import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import {
  SaveFormRequest,
  SaveFormResult,
  FormBuilderDto,
  ApiError
} from '../models/form-builder.models';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tenants/${environment.tenantId}/form-builder`;

  /**
   * Creates a new questionnaire form
   */
  createForm(request: SaveFormRequest): Observable<SaveFormResult> {
    return this.http.post<SaveFormResult>(this.baseUrl, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Updates an existing form by creating a new version
   */
  updateForm(definitionId: string, request: SaveFormRequest): Observable<SaveFormResult> {
    return this.http.put<SaveFormResult>(`${this.baseUrl}/${definitionId}`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Retrieves the latest version of a form by its definition ID
   */
  getFormByDefinitionId(definitionId: string): Observable<FormBuilderDto> {
    return this.http.get<FormBuilderDto>(`${this.baseUrl}/${definitionId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Retrieves a specific version of a form
   */
  getFormByVersionId(versionId: string): Observable<FormBuilderDto> {
    return this.http.get<FormBuilderDto>(`${this.baseUrl}/versions/${versionId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      const apiError = error.error as ApiError;
      errorMessage = apiError?.error || `Server error: ${error.status} - ${error.message}`;
    }

    console.error('FormBuilder API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
