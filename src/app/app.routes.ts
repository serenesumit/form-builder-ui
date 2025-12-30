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
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'forms'
  }
];
