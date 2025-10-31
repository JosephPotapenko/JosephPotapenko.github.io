# 🎮 Enhanced Survey Change Management System

This system provides a comprehensive solution for managing survey changes with image previews, approval/denial functionality, and automatic code updates.

## 🌟 Features

### Enhanced Email Reports
- **Visual Email Reports**: Each email includes actual images of the survey items
- **Interactive Buttons**: Approve or deny buttons for each change directly in the email
- **Rich HTML Format**: Professional email layout with proper styling
- **Text Fallback**: Plain text version for compatibility

### Smart Change Management
- **Approval System**: Click "Approve" to automatically update the survey.html file
- **Denial System**: Click "Deny" to permanently reject changes (never asked again)
- **Auto-Population Integration**: Only changed auto-populated content is included
- **Change Tracking**: Tracks what was modified vs. what was originally auto-populated

### Web Management Interface
- **Change Management Dashboard**: View all pending and denied changes
- **Visual Interface**: See images alongside proposed changes
- **Statistics**: Track approval/denial rates and activity
- **Real-time Updates**: Refresh data to see latest changes

## 📁 System Files

```
/pages/survey.html        - Main survey page with enhanced functionality
/api/survey-api.php       - Backend API for processing changes
/change-management.html   - Web interface for managing changes (optional, not included here)
/api/pending_changes.json - Stores pending changes awaiting approval
/api/denied_changes.json  - Stores permanently denied changes
```

## 🔧 How It Works

### 1. Survey Submission Process
1. User fills out survey with ratings and name/description changes
2. System detects what was modified from auto-populated content
3. Changes are submitted to the API and stored in `pending_changes.json`
4. Enhanced HTML email is generated with images and action buttons

### 2. Email Review Process
1. You receive an HTML email with visual previews of each changed item
2. Each item shows the image, proposed changes, and action buttons
3. Click "✅ Approve & Apply Changes" to update the survey code
4. Click "❌ Deny (Never Ask Again)" to permanently reject

### 3. Automatic Code Updates
When you approve a change:
1. The system automatically updates `pages/survey.html`
2. New descriptions are added to the `descriptionsDatabase`
3. Future survey users will see the updated auto-populated content
4. The change is removed from pending list

### 4. Denial System
When you deny a change:
1. The change is moved to the denied list
2. Future identical submissions are automatically blocked
3. Users won't be able to submit the same change again

## 🚀 Quick Start

### Setup Requirements
1. **Web Server**: Requires PHP for the API functionality (e.g., `php -S 0.0.0.0:8080`)
2. **File Permissions**: API needs write access to survey.html and JSON files
3. **Email Client**: HTML email support recommended for best experience

### Initial Setup
1. Upload all files to your web server
2. Ensure PHP is enabled and files have proper permissions
3. Test by submitting a survey change
4. Check the change management interface at `/change-management.html`

### Using the System
1. **Survey Users**: Fill out the survey normally - system handles the rest
2. **Administrators**: Monitor changes via email or web interface
3. **Quick Approval**: Use email buttons for fast approval/denial
4. **Bulk Management**: Use web interface for detailed review

## 📊 Management Interface

Access the change management system at (if implemented):
```
https://yoursite.com/change-management.html
```

### Dashboard Features
- **Pending Changes Tab**: Review and process new submissions
- **Denied Changes Tab**: View permanently rejected changes  
- **Statistics Tab**: Monitor system usage and activity
- **Refresh Button**: Update data in real-time

### Processing Changes
1. **View Details**: See image, current description, and proposed changes
2. **Approve**: Instantly updates the survey code and database
3. **Deny**: Permanently blocks similar future submissions
4. **Track Results**: Monitor approval/denial statistics

## 🔒 Security Features

### Change Validation
- **Duplicate Prevention**: Identical changes are blocked if previously denied
- **Input Sanitization**: All user input is properly escaped
- **File Integrity**: Backup system prevents corruption

### Access Control
- **Email-based Review**: Changes must be approved via email or web interface
- **No Direct Database**: Users cannot directly modify the survey database
- **Audit Trail**: All changes are logged with timestamps

## 🛠️ Troubleshooting

### Common Issues

**Email buttons not working:**
- Ensure `/api/survey-api.php` is accessible
- Check PHP error logs
- Verify file permissions

**Changes not applying:**
- Check write permissions on `pages/survey.html`
- Verify JSON files are writable
- Review PHP error logs

**Images not showing:**
- Confirm image paths in email are correct
- Check that images are accessible via web
- Verify base URL in email generation

### File Permissions
```bash
chmod 644 pages/survey.html
chmod 644 api/*.json
chmod 755 api/survey-api.php
```

## 🎯 Advanced Configuration

### Email Customization
Edit the `createEnhancedEmailHTML()` function in survey.html to customize:
- Email styling and layout
- Button text and colors
- Image sizes and presentation
- Additional metadata

### API Endpoints
The `/api/survey-api.php` supports these actions:
- `submit_changes`: Process new survey submissions
- `approve_change`: Apply approved changes to survey
- `deny_change`: Permanently reject changes

### Database Structure
Changes are stored in JSON format with these fields:
```json
{
  "changeId": {
    "filename": "image_name",
    "newName": "Proposed name",
    "newDescription": "Proposed description", 
    "submittedAt": "2025-01-15 10:30:00",
    "imagePath": "path/to/image.png"
  }
}
```

This system provides a complete workflow for managing survey changes while maintaining quality control and preventing spam submissions.
