# Creating a Composite Index for Firestore

To create the required composite index for the query, follow these steps:

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project "finance-to-dos"
3. Go to Firestore Database
4. Click on the "Indexes" tab
5. Click "Add Index"
6. Fill in the following details:
   - Collection ID: todos
   - Fields to index:
     - userId (Ascending)
     - completed (Ascending)
     - dueDate (Ascending)
   - Query scope: Collection
7. Click "Create index"

Alternatively, you can click on this direct link to create the index:
https://console.firebase.google.com/v1/r/project/finance-to-dos/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9maW5hbmNlLXRvLWRvcy9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvdG9kb3MvaW5kZXhlcy9fEAEaDQoJY29tcGxldGVkEAEaCgoGdXNlcklkEAEaCwoHZHVlRGF0ZRABGgwKCF9fbmFtZV9fEAE

The index will take a few minutes to build. Once it's ready, the notification function will work correctly.