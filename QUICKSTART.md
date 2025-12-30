# Quick Start Guide

## Setup Steps

### 1. Install Dependencies
```bash
cd c:\EMRProjects-GitHub\form-builder-ui
npm install
```

### 2. Configure Syncfusion License
1. Visit [Syncfusion Licensing](https://www.syncfusion.com/account/manage-trials/downloads)
2. Sign up for a free trial or community license
3. Copy your license key
4. Open `src/main.ts`
5. Replace `'YOUR_SYNCFUSION_LICENSE_KEY_HERE'` with your actual license key

### 3. Configure API Settings
1. Open `src/environments/environment.ts`
2. Update the API URL to match your backend:
   ```typescript
   apiUrl: 'https://localhost:7001/api'  // Your API URL
   ```
3. Update the tenant ID:
   ```typescript
   tenantId: 'your-actual-tenant-id'
   ```

### 4. Start Development Server
```bash
npm start
```

The application will be available at `http://localhost:4200`

## First Time Use

### Creating Your First Form

1. **Navigate to Forms**
   - The app opens at the forms list page
   - Click "Create New Form"

2. **Fill Form Details**
   - Enter Form Code (e.g., `PHQ9_V1`)
   - Enter Form Name (e.g., `Patient Health Questionnaire-9`)
   - Add Description and Category
   - Check "Standard Form Template" if applicable

3. **Add Sections**
   - Click "Add Section" button
   - Configure section properties:
     - Section Name
     - Description
     - Sort Order
     - Repeatable options

4. **Add Questions**
   - Within a section, click "Add Question"
   - Configure question:
     - Question Text
     - Question Type (Text, Number, Radio, etc.)
     - Required flag
     - Help text
   - For Radio/Checkbox/Dropdown, add options
   - Configure advanced settings if needed

5. **Preview**
   - Click "Preview" to see how the form will look
   - Test the form interaction

6. **Save**
   - Click "Save" to persist the form
   - Note the Definition ID and Version ID returned

## Question Type Examples

### Text Input
```
Type: Text (1)
Use for: Name, short answers
Validation: minLength, maxLength, regexPattern
```

### Radio Buttons
```
Type: Radio (3)
Use for: Single choice questions
Add Options: Yes, No, Maybe
Each option can have a numeric score
```

### Number Input
```
Type: Number (8)
Use for: Age, quantity
Validation: minValue, maxValue
```

### Date Picker
```
Type: Date (5)
Use for: Birth date, appointment date
```

## Validation Examples

### Email Validation
```typescript
questionTypeId: 9  // Email type
regexPattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
regexErrorMessage: "Please enter a valid email address"
```

### Age Validation
```typescript
questionTypeId: 8  // Number type
minValue: 0
maxValue: 120
isRequired: true
```

### Phone Number
```typescript
questionTypeId: 10  // Phone type
regexPattern: "^\\d{3}-\\d{3}-\\d{4}$"
regexErrorMessage: "Format: 123-456-7890"
```

## Conditional Logic (Future Feature)

The models support conditional rules:
```typescript
conditionalRules: [{
  sourceQuestionId: "question-1-id",
  operator: "equals",
  compareValue: "yes",
  actionType: "show"
}]
```

## API Integration

The app uses these endpoints:

### Create Form
```http
POST /api/tenants/{tenantId}/form-builder
Content-Type: application/json
```

### Update Form
```http
PUT /api/tenants/{tenantId}/form-builder/{definitionId}
Content-Type: application/json
```

### Get Form
```http
GET /api/tenants/{tenantId}/form-builder/{definitionId}
```

## Troubleshooting

### Syncfusion License Error
**Error**: "Syncfusion license key is required"
**Solution**: Add your license key in `src/main.ts`

### API Connection Error
**Error**: "Failed to connect to API"
**Solution**:
1. Check API URL in `environment.ts`
2. Ensure backend is running
3. Check CORS configuration on backend

### Build Errors
**Error**: "Cannot find module @core/..."
**Solution**: Check `tsconfig.json` paths configuration

## Project Structure Quick Reference

```
src/app/
├── core/
│   ├── models/
│   │   └── form-builder.models.ts    # All TypeScript interfaces
│   └── services/
│       ├── form-builder-api.service.ts  # HTTP client
│       └── form-builder.service.ts      # Business logic + signals
├── features/
│   └── form-builder/
│       └── components/
│           ├── form-list/              # List all forms
│           ├── form-editor/            # Create/edit forms
│           ├── section-editor/         # Edit sections
│           ├── question-editor/        # Edit questions
│           └── form-renderer/          # Preview/render forms
├── app.routes.ts                       # Routing configuration
├── app.config.ts                       # App configuration
└── app.component.ts                    # Root component
```

## Next Steps

1. Customize the UI theme in `styles.scss`
2. Add more validation rules as needed
3. Integrate with your authentication system
4. Add form templates
5. Implement conditional logic UI
6. Add form analytics

## Support

- Angular Documentation: https://angular.dev
- Syncfusion Documentation: https://ej2.syncfusion.com/angular/documentation
- FormBuilder API Docs: See `C:\EMRProjects-GitHub\dynamic-forms\docs`

## Common Tasks

### Change Theme Color
Edit `src/styles.scss`:
```scss
$primary-color: #2196f3;  // Change to your brand color
```

### Add New Question Type
1. Add to `QuestionType` enum in models
2. Add to `QUESTION_TYPES` array
3. Add rendering logic in `form-renderer.component.html`

### Custom Validation
Add to question configuration:
```typescript
regexPattern: "your-pattern",
regexErrorMessage: "Your error message"
```
