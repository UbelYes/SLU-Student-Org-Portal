# Quick Start Guide - Student Activity Tracking

## For OSA Staff

### Accessing Student Activity Monitoring

1. **Login** to the OSA portal:
   - Use your OSA credentials (e.g., `staff@slu.edu.ph` / `staff123`)

2. **Navigate to Accounts**:
   - Click "Accounts" button in the left sidebar
   - You'll see the Student Activity Monitoring dashboard

### Understanding the Dashboard

#### Recent Access Tab
Shows which students have recently logged into the portal:

- **Active (Green badge)**: Accessed within the last hour
- **Recent (Orange badge)**: Accessed within the last 24 hours  
- **Inactive (Gray badge)**: No access in over 24 hours

**Quick Actions**:
- 🔍 Search by student name, organization, or email
- 📅 Filter by time: Today, This Week, This Month
- 🔄 Click Refresh to update the list

#### Form Submissions Tab
Track all forms submitted by student organizations:

- **Pending (Yellow badge)**: Awaiting review
- **Approved (Green badge)**: Accepted
- **Rejected (Red badge)**: Declined

**Quick Actions**:
- 🔍 Search by organization or form type
- 🎯 Filter by status: Pending, Approved, Rejected
- 📅 Filter by time: Today, This Week, This Month
- 👁️ Click "View" to see submission details

### Using Document Pagination

1. **Navigate to Documents**:
   - Click "Documents" button in sidebar

2. **Navigate Pages**:
   - Use ⏮ ◀ ▶ ⏭ buttons to move between pages
   - Click page numbers directly (1, 2, 3...)
   - Current page is highlighted in blue

3. **Adjust Items per Page**:
   - Bottom right dropdown: Choose 5, 10, 20, or 50 items
   - Default is 10 items per page

4. **View Statistics**:
   - Bottom left shows: "Showing 1-10 of 35 documents"
   - Updates automatically with search/filter

## For Students

### Automatic Tracking
Your activity is automatically tracked when you:
1. ✅ Login to the student portal
2. ✅ Submit a form
3. ✅ Upload a document

**What's Tracked**:
- Login timestamp
- Organization name
- Number of sessions
- Form submissions

**Privacy Note**: 
Only OSA staff can view this activity data. It's used to monitor organization engagement and provide better support.

## Testing the Features

### Sample Data Included
Both pages come with sample data:
- 5 student access records
- 5 form submissions  
- 35 documents for pagination testing

### Test Accounts
Try logging in with different accounts to see tracking:

**Students**:
- `samcis@slu.edu.ph` / `samcis123`
- `icon@slu.edu.ph` / `icon123`
- `student@slu.edu.ph` / `student123`

**OSA Staff**:
- `staff@slu.edu.ph` / `staff123`
- `osa@slu.edu.ph` / `osa123`

### Testing Workflow

1. **Test Access Tracking**:
   - Login as a student account
   - Logout
   - Login as OSA staff
   - Go to Accounts → Recent Access tab
   - You should see the student's login recorded

2. **Test Pagination**:
   - Login as OSA staff
   - Go to Documents page
   - Try different page numbers
   - Change items per page
   - Test search while paginating

3. **Test Filters**:
   - Use search boxes to find specific entries
   - Try time filters (Today, This Week, etc.)
   - Test status filters on Form Submissions tab

## Troubleshooting

### Data Not Showing?
- Click the 🔄 Refresh button
- Check if you're logged in correctly
- Clear browser cache and reload

### Pagination Not Working?
- Make sure JavaScript is enabled
- Check browser console for errors (F12)
- Verify `osa-documents.js` is loaded

### Search Not Filtering?
- Wait a moment after typing (debounce delay: 300ms)
- Check spelling of search terms
- Try clearing the search box and re-entering

## Browser Requirements

- **Recommended**: Chrome, Edge, Firefox (latest versions)
- **JavaScript**: Must be enabled
- **LocalStorage**: Must be enabled
- **Screen Size**: Minimum 420px width for mobile

## Data Persistence

- Data is stored in browser's localStorage
- Clearing browser data will reset tracking
- Each browser/device has separate data
- For production: Connect to MySQL database

## Need Help?

Common questions:

**Q: Can students see their own tracking data?**
A: No, only OSA staff can view activity monitoring.

**Q: How long is data stored?**
A: Currently stored in browser localStorage indefinitely (until browser data is cleared).

**Q: Can I export the data?**
A: Not yet - this is a planned future enhancement.

**Q: Why don't I see real-time updates?**
A: Click the Refresh button to update the data. Real-time updates will be added in future versions.

## Next Steps

For production deployment:
1. Connect to MySQL database
2. Set up PHP backend API
3. Configure automated backups
4. Add export functionality
5. Implement real-time notifications

See `STUDENT_ACTIVITY_TRACKING.md` for complete technical documentation.
