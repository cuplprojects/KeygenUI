npm install jquery datatables.net-bs4 react-csv

 // for incripting params
 npm install crypto-js

## Instructions For role and permission
1. Change the src\components\AppContent.js for routing
2. Change the src\components\AppBreadcrumb.js
3. Make a file src\context\PermissionChecker.jsx to check the permission and show element as per.
4. Make a File src\context\PermissionDecorator.jsx for rendaring only permission page
5. Make a View src\views\pages\page403\AccessDeniedPage.jsx to show Permission denied page
6. Add permission denied route in src\App.js
7. delete src\routes.js as now we will manage all routes in src\components\AppContent.js
8. change all user component to use src\context\PermissionChecker.jsx to show required elements only.

program modal.jsx
subjectmodal.jsx
