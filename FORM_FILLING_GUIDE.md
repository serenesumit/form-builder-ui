# Form Filling Guide

## How to Fill Out a Form

There are two ways to access and fill out a form:

### Option 1: From the Form List (Recommended)

1. Navigate to the **Forms List** page (default home page)
2. Find the form you want to fill out
3. Click the **Fill Form** button (blue button with file icon) in the Actions column
4. You'll be redirected to the form filling page

### Option 2: Direct URL Navigation

Navigate directly to the form filling page using this URL pattern:

```
/forms/fill/{tenantId}/{versionId}/{patientId}
```

Or with an assignment ID:

```
/forms/fill/{tenantId}/{versionId}/{patientId}/{assignmentId}
```

**Example:**
```
http://localhost:4200/forms/fill/00000000-0000-0000-0000-000000000001/your-version-id/00000000-0000-0000-0000-000000000002
```

## Form Filling Features

### Available Question Types
- **Text Input** - Single line text
- **Text Area** - Multi-line text
- **Number** - Numeric input
- **Date** - Date picker
- **Single Choice** - Radio buttons
- **Multiple Choice** - Checkboxes
- **Dropdown** - Select dropdown
- **Matrix** - Grid/matrix questions

### Key Features
- ✅ **Progress Tracking** - Visual progress bar showing completion percentage
- ✅ **Auto-Save Draft** - Click "Save Draft" to save your progress
- ✅ **Conditional Logic** - Questions appear/hide based on your answers
- ✅ **Validation** - Required questions are marked with *
- ✅ **Repeatable Sections** - Support for repeating question groups
- ✅ **Matrix Questions** - Radio buttons in table format

### Form Actions

#### Save Draft
- Click **"Save Draft"** to save your current progress
- You can close the form and return later
- All answers are preserved

#### Submit Form
- Click **"Submit Form"** when you've completed all questions
- Required questions must be answered before submission
- Form status changes to "COMPLETED" after submission

## API Endpoints Used

The form renderer communicates with these backend endpoints:

### Save/Update Response (Draft)
```
POST /api/tenants/{tenantId}/form-responses
```

### Complete Response (Submit)
```
POST /api/tenants/{tenantId}/form-responses/{responseId}/complete
```

### Get Response
```
GET /api/tenants/{tenantId}/form-responses/{responseId}
```

## Database Schema

Form responses are stored in the existing clinical schema:

- **Table:** `clinical.patient_questionnaire_response`
  - Main response record with status, scores, completion tracking

- **Table:** `clinical.patient_question_answer`
  - Individual answer records
  - Supports multiple value types (text, numeric, date, boolean)
  - Matrix cell tracking (row/col IDs)
  - Repeatable section support (repeat index)

## Configuration

### Setting Tenant and Patient IDs

Currently, the form list uses placeholder IDs. In a production environment, update these in:

**File:** `form-list.component.ts`

```typescript
onFillForm(definitionId: string): void {
  // Replace these with actual values from your authentication/context service
  const tenantId = getCurrentTenantId(); // Your method
  const patientId = getCurrentPatientId(); // Your method

  this.router.navigate(['/forms/fill', tenantId, definitionId, patientId]);
}
```

## Troubleshooting

### Form doesn't load
- Verify the API is running (default: https://localhost:7227)
- Check browser console for errors
- Verify the version ID exists in the database

### Cannot submit form
- Ensure all required questions (marked with *) are answered
- Check browser console for validation errors
- Verify API connectivity

### Conditional logic not working
- Verify conditional rules are set up correctly in the form builder
- Check that source question IDs match the questions in the form
- Review browser console for any JavaScript errors

## Example Workflow

1. **Admin creates a form** using the Form Builder
2. **Admin assigns the form** to a patient (creates assignment record)
3. **Patient receives notification** about the assigned form
4. **Patient clicks link** to fill out the form
5. **Patient answers questions** - form validates and applies conditional logic
6. **Patient saves draft** (optional) - can return later
7. **Patient submits form** - status changes to COMPLETED
8. **Clinician reviews response** - can add review notes and scores

## Next Steps

To integrate this into a full patient portal:

1. Create a **Patient Assignment List** page showing assigned forms
2. Add **Authentication** to get current user/patient context
3. Implement **Form Resume** functionality to continue from saved draft
4. Add **Response History** view to see previously submitted forms
5. Create **Clinician Review** interface for reviewing completed forms
