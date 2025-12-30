# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Visual Studio Code (recommended)
- Angular CLI 17+
- Git

### Initial Setup
```bash
# Navigate to project
cd c:\EMRProjects-GitHub\form-builder-ui

# Install dependencies
npm install

# Install Angular CLI globally (if not already installed)
npm install -g @angular/cli
```

### Running the Application
```bash
# Development server with hot reload
npm start

# Or with Angular CLI
ng serve

# Open browser
http://localhost:4200
```

### Building
```bash
# Production build
npm run build

# Development build
ng build --configuration development

# Build with watch mode
npm run watch
```

## Development Workflow

### Creating a New Component
```bash
# Using Angular CLI
ng generate component features/form-builder/components/my-component --standalone

# This creates:
# - my-component.component.ts
# - my-component.component.html
# - my-component.component.scss
# - my-component.component.spec.ts (if testing enabled)
```

### Adding a New Service
```bash
ng generate service core/services/my-service
```

### Path Aliases
Use TypeScript path aliases for cleaner imports:
```typescript
// Instead of:
import { FormBuilderService } from '../../../core/services/form-builder.service';

// Use:
import { FormBuilderService } from '@core/services/form-builder.service';
```

Available aliases:
- `@core/*` → `src/app/core/*`
- `@shared/*` → `src/app/shared/*`
- `@features/*` → `src/app/features/*`
- `@environments/*` → `src/environments/*`

## Code Style Guidelines

### TypeScript
```typescript
// Use signals for reactive state
readonly mySignal = signal<string>('initial value');

// Use computed for derived state
readonly derivedValue = computed(() => this.mySignal().toUpperCase());

// Use inject() for dependency injection
private readonly myService = inject(MyService);

// Use readonly for injected services
readonly formBuilderService = inject(FormBuilderService);

// Prefer interfaces over classes for data models
interface MyData {
  id: string;
  name: string;
}

// Use strict typing
function processData(data: MyData): Result<string> {
  // implementation
}
```

### Component Structure
```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, /* other imports */],
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.scss']
})
export class MyComponent implements OnInit {
  // 1. Injected services
  private readonly service = inject(MyService);

  // 2. Input/Output properties
  @Input() data!: MyData;
  @Output() dataChange = new EventEmitter<MyData>();

  // 3. Signals
  readonly state = signal<MyState>({ ... });

  // 4. Computed values
  readonly computedValue = computed(() => ...);

  // 5. Lifecycle hooks
  ngOnInit(): void { }

  // 6. Public methods
  onSave(): void { }

  // 7. Private methods
  private validate(): boolean { }
}
```

### Template Guidelines
```html
<!-- Use new control flow syntax -->
@if (condition) {
  <div>Content</div>
}

@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}

<!-- Use signals in templates directly -->
<p>{{ mySignal() }}</p>

<!-- Avoid calling functions in templates, use computed signals instead -->
<!-- BAD -->
<p>{{ calculateTotal() }}</p>

<!-- GOOD -->
<p>{{ total() }}</p>
```

### SCSS Guidelines
```scss
// Use BEM-like naming
.my-component {
  &__header {
    // styles
  }

  &__content {
    // styles
  }

  &--active {
    // modifier styles
  }
}

// Use CSS variables for colors
:root {
  --primary-color: #2196f3;
  --secondary-color: #ff9800;
}

.button {
  background-color: var(--primary-color);
}
```

## State Management Patterns

### Using Signals in Services
```typescript
@Injectable({
  providedIn: 'root'
})
export class MyService {
  // Private state
  private readonly state = signal<MyState>({
    data: [],
    isLoading: false,
    error: null
  });

  // Public computed values
  readonly data = computed(() => this.state().data);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);

  // State mutations
  updateData(newData: MyData[]): void {
    this.state.update(s => ({
      ...s,
      data: newData
    }));
  }
}
```

### Using Services in Components
```typescript
export class MyComponent {
  readonly service = inject(MyService);

  // Access computed signals directly
  // In template: {{ service.data() }}

  // Call methods to update state
  onUpdate(data: MyData[]): void {
    this.service.updateData(data);
  }
}
```

## Working with Syncfusion Components

### Import Required Modules
```typescript
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';

@Component({
  // ...
  imports: [GridModule, ButtonModule, TextBoxModule]
})
```

### Common Components
```html
<!-- TextBox -->
<ejs-textbox
  [(ngModel)]="value"
  placeholder="Enter text"
  floatLabelType="Never">
</ejs-textbox>

<!-- Button -->
<button ejs-button cssClass="e-primary" (click)="onClick()">
  Click Me
</button>

<!-- Grid -->
<ejs-grid
  [dataSource]="data"
  [allowPaging]="true"
  [allowSorting]="true">
  <e-columns>
    <e-column field="id" headerText="ID"></e-column>
    <e-column field="name" headerText="Name"></e-column>
  </e-columns>
</ejs-grid>
```

## API Integration

### Making API Calls
```typescript
// In service
createForm(request: SaveFormRequest): Observable<SaveFormResult> {
  return this.http.post<SaveFormResult>(
    `${this.baseUrl}/form-builder`,
    request
  ).pipe(
    catchError(this.handleError)
  );
}

// In component
onSave(): void {
  this.apiService.createForm(this.formData).subscribe({
    next: (result) => {
      console.log('Success:', result);
    },
    error: (error) => {
      console.error('Error:', error);
    }
  });
}
```

### Error Handling
```typescript
private handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'An unexpected error occurred';

  if (error.error instanceof ErrorEvent) {
    // Client-side error
    errorMessage = error.error.message;
  } else {
    // Server-side error
    const apiError = error.error as ApiError;
    errorMessage = apiError?.error || error.message;
  }

  console.error('API Error:', errorMessage);
  return throwError(() => new Error(errorMessage));
}
```

## Debugging

### Browser DevTools
```typescript
// Use debugger statement
debugger;

// Console logging with signals
console.log('Current value:', this.mySignal());

// Effect for debugging signal changes
effect(() => {
  console.log('Signal changed:', this.mySignal());
});
```

### Angular DevTools
1. Install Angular DevTools extension
2. Open DevTools → Angular tab
3. Inspect component tree
4. View component signals and properties

### VSCode Debug Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:4200",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

## Common Tasks

### Add a New Question Type
1. Add to `QuestionType` enum in models
2. Add to `QUESTION_TYPES` array
3. Add rendering case in `form-renderer.component.html`
4. Import required Syncfusion module

### Add Form Validation
```typescript
// In component
validateForm(): boolean {
  const form = this.formBuilderService.currentForm();

  if (!form) return false;
  if (!form.code || !form.name) return false;
  if (form.sections.length === 0) return false;

  return true;
}
```

### Implement Conditional Logic UI
1. Create `conditional-rule-editor.component`
2. Add to question editor
3. Bind to `conditionalRules` array
4. Implement rule builder UI

## Testing (Future)

### Unit Tests
```typescript
describe('FormBuilderService', () => {
  let service: FormBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormBuilderService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize new form', () => {
    service.initializeNewForm();
    expect(service.currentForm()).toBeTruthy();
  });
});
```

### Component Tests
```typescript
describe('FormEditorComponent', () => {
  let component: FormEditorComponent;
  let fixture: ComponentFixture<FormEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormEditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Performance Tips

### Use OnPush Change Detection
```typescript
@Component({
  // ...
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Lazy Load Routes
```typescript
{
  path: 'forms',
  loadComponent: () => import('./components/form-list.component')
    .then(m => m.FormListComponent)
}
```

### Use TrackBy in Loops
```html
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}
```

## Troubleshooting

### Common Issues

**Issue**: Syncfusion components not rendering
**Solution**: Ensure CSS imports in `angular.json` and license key in `main.ts`

**Issue**: Path aliases not working
**Solution**: Check `tsconfig.json` paths configuration

**Issue**: Signals not updating in template
**Solution**: Ensure you're calling the signal as a function: `mySignal()`

**Issue**: HttpClient not working
**Solution**: Ensure `provideHttpClient()` in `app.config.ts`

## Resources

- [Angular Documentation](https://angular.dev)
- [Syncfusion Angular Components](https://ej2.syncfusion.com/angular/documentation)
- [RxJS Documentation](https://rxjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Create pull request
```

### Commit Message Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

## Continuous Improvement

### Code Review Checklist
- [ ] TypeScript strict mode compliance
- [ ] Proper signal usage
- [ ] Component separation (HTML, SCSS, TS)
- [ ] No console.log in production code
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Responsive design tested
- [ ] Accessibility considered

### Before Committing
```bash
# Format code
npm run format  # (if configured)

# Lint code
npm run lint  # (if configured)

# Build to check for errors
npm run build
```

## Need Help?

- Check the README.md for project overview
- Check QUICKSTART.md for setup instructions
- Check PROJECT_SUMMARY.md for architecture details
- Review existing components for patterns
- Consult Angular and Syncfusion documentation
