import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'forms',
    pathMatch: 'full'
  },
  {
    path: 'forms',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/form-builder/components/form-list/form-list.component').then(
            m => m.FormListComponent
          )
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/form-builder/components/form-builder/form-builder.component').then(
            m => m.FormBuilderComponent
          )
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./features/form-builder/components/form-builder/form-builder.component').then(
            m => m.FormBuilderComponent
          )
      },
      {
        path: 'builder/new',
        loadComponent: () =>
          import('./features/form-builder/components/form-builder/form-builder.component').then(
            m => m.FormBuilderComponent
          )
      },
      {
        path: 'builder/:id',
        loadComponent: () =>
          import('./features/form-builder/components/form-builder/form-builder.component').then(
            m => m.FormBuilderComponent
          )
      },
      {
        path: 'legacy/new',
        loadComponent: () =>
          import('./features/form-builder/components/form-editor/form-editor.component').then(
            m => m.FormEditorComponent
          )
      },
      {
        path: 'legacy/edit/:id',
        loadComponent: () =>
          import('./features/form-builder/components/form-editor/form-editor.component').then(
            m => m.FormEditorComponent
          )
      },
      {
        path: 'preview/:id',
        loadComponent: () =>
          import('./features/form-builder/pages/form-preview-page/form-preview-page.component').then(
            m => m.FormPreviewPageComponent
          )
      },
      {
        path: 'preview/version/:versionId',
        loadComponent: () =>
          import('./features/form-builder/pages/form-preview-page/form-preview-page.component').then(
            m => m.FormPreviewPageComponent
          )
      },
      {
        path: 'fill/:tenantId/:versionId/:patientId',
        loadComponent: () =>
          import('./features/form-renderer/components/form-renderer.component').then(
            m => m.FormRendererComponent
          )
      },
      {
        path: 'fill/:tenantId/:versionId/:patientId/:assignmentId',
        loadComponent: () =>
          import('./features/form-renderer/components/form-renderer.component').then(
            m => m.FormRendererComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'forms'
  }
];
