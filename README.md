# Form Builder UI

An Angular 17+ application for creating and managing dynamic questionnaire forms for the FormBuilder API.

## Features

- **Form Management**: Create, edit, and manage questionnaire forms
- **Dynamic Sections**: Organize questions into collapsible, repeatable sections
- **15+ Question Types**: Support for text, number, date, radio, checkbox, dropdown, and more
- **Validation Rules**: Built-in validation with min/max values, length, regex patterns
- **Conditional Logic**: Show/hide questions based on answers
- **Clinical Codes**: Support for CPT, LOINC, and SNOMED codes
- **Live Preview**: Preview forms as you build them
- **Syncfusion UI**: Professional UI components from Syncfusion

## Tech Stack

- **Angular 17+**: Latest Angular with standalone components
- **Signals**: Modern state management with Angular signals
- **TypeScript**: Type-safe development
- **Syncfusion**: Enterprise-grade UI component library
- **SCSS**: Modular styling
- **RxJS**: Reactive programming

## Architecture

### Clean Architecture Principles
```
src/
├── app/
│   ├── core/                 # Core services and models
│   │   ├── models/           # Domain models and interfaces
│   │   └── services/         # Business logic services
│   ├── features/             # Feature modules
│   │   └── form-builder/    # Form builder feature
│   │       └── components/   # Feature components
│   └── shared/              # Shared utilities (future)
```

### State Management
- **Signals-based**: Using Angular signals for reactive state
- **Service Layer**: Centralized business logic in services
- **No NgRx**: Start simple, add NgRx only if needed

### API Integration
- **OpenAPI Generated Client**: Ready for NSwag/Kiota integration
- **Environment-based Config**: Configurable API endpoints
- **Result Pattern**: Explicit error handling

## Prerequisites

- Node.js 18+ and npm
- Angular CLI 17+
- Syncfusion license key (free trial available)

## Installation

1. **Clone the repository**
   ```bash
   cd c:\EMRProjects-GitHub\form-builder-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Syncfusion License**
   - Get a free license from [Syncfusion](https://www.syncfusion.com/account/manage-trials/downloads)
   - Update `src/main.ts` with your license key:
     ```typescript
     registerLicense('YOUR_SYNCFUSION_LICENSE_KEY_HERE');
     ```

4. **Configure API Endpoint**
   - Update `src/environments/environment.ts` with your API URL and tenant ID:
     ```typescript
     export const environment = {
       production: false,
       apiUrl: 'https://localhost:7001/api',
       tenantId: 'YOUR_TENANT_ID'
     };
     ```

## Development

**Start the development server**
```bash
npm start
```

Navigate to `http://localhost:4200/`

**Build for production**
```bash
npm run build
```

**Run tests**
```bash
npm test
```

## Project Structure

### Components

#### Form List (`form-list.component`)
- Grid view of all questionnaire forms
- Search, filter, and pagination
- Create, edit, view, delete actions

#### Form Editor (`form-editor.component`)
- Three-tab interface: Details, Sections, Preview
- Form metadata configuration
- Section and question management
- Live preview

#### Section Editor (`section-editor.component`)
- Collapsible section configuration
- Repeatable sections support
- Question list management
- Section-level settings

#### Question Editor (`question-editor.component`)
- 15+ question type support
- Answer options for radio/checkbox/dropdown
- Advanced validation rules
- Clinical codes (CPT, LOINC, SNOMED)
- Styling options

#### Form Renderer (`form-renderer.component`)
- Dynamic form rendering from JSON
- All question types supported
- Real-time validation
- Responsive layout

### Services

#### FormBuilderService
- Signal-based state management
- CRUD operations for forms, sections, questions
- Question type utilities
- Validation helpers

#### FormBuilderApiService
- HTTP client wrapper for FormBuilder API
- Result pattern for error handling
- Type-safe API calls

### Models

All TypeScript interfaces match the FormBuilder API specification:
- `SaveFormRequest`
- `FormBuilderSectionRequest`
- `FormQuestionRequest`
- `FormQuestionOptionRequest`
- `FormBuilderConditionalRuleRequest`
- `SaveFormResult`
- `FormBuilderDto`

## API Endpoints

The application integrates with the following FormBuilder API endpoints:

- `POST /api/tenants/{tenantId}/form-builder` - Create form
- `PUT /api/tenants/{tenantId}/form-builder/{definitionId}` - Update form
- `GET /api/tenants/{tenantId}/form-builder/{definitionId}` - Get form by definition ID
- `GET /api/tenants/{tenantId}/form-builder/versions/{versionId}` - Get form by version ID

## Question Types

| ID | Type | Description | Options |
|----|------|-------------|---------|
| 1 | Text | Single-line text input | No |
| 2 | TextArea | Multi-line text input | No |
| 3 | Radio | Single selection | Yes |
| 4 | Checkbox | Multiple selections | Yes |
| 5 | Date | Date picker | No |
| 6 | Time | Time picker | No |
| 7 | DateTime | Date and time picker | No |
| 8 | Number | Numeric input | No |
| 9 | Email | Email with validation | No |
| 10 | Phone | Phone number input | No |
| 11 | Dropdown | Dropdown selection | Yes |
| 12 | Slider | Numeric slider | No |
| 13 | Rating | Star/numeric rating | Yes |
| 14 | FileUpload | File upload | No |
| 15 | Signature | Digital signature | No |

## Validation Features

- **Required fields**
- **Min/Max values** (numeric)
- **Min/Max length** (text)
- **Regex patterns** with custom error messages
- **Email format** validation
- **Phone format** validation

## Conditional Logic

Supported operators:
- `equals`, `not_equals`
- `greater_than`, `less_than`
- `contains`
- `is_empty`, `is_not_empty`

Supported actions:
- `show`, `hide`
- `enable`, `disable`
- `require`

## Styling

- **SCSS modules**: Component-scoped styles
- **Syncfusion Material theme**: Professional look and feel
- **Responsive design**: Mobile-friendly
- **Custom variables**: Easy theming

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] List all forms endpoint integration
- [ ] Delete form functionality
- [ ] Conditional logic UI builder
- [ ] Form templates library
- [ ] Version history viewer
- [ ] Form analytics
- [ ] Export to PDF
- [ ] Multi-language support
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] NgRx integration (if needed)

## License

MIT

## API Documentation

For complete API documentation, refer to the FormBuilder API specification at:
`C:\EMRProjects-GitHub\dynamic-forms\docs\api-endpoints.md`
