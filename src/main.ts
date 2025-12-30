import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLicense } from '@syncfusion/ej2-base';

// Register Syncfusion license
// Note: You need to replace this with your actual Syncfusion license key
// Get a free trial or community license from: https://www.syncfusion.com/account/manage-trials/downloads
registerLicense('YOUR_SYNCFUSION_LICENSE_KEY_HERE');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
