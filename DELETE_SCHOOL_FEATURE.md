# Delete School Feature

## Overview
This feature allows administrators to delete schools from the Schools Management section of the admin panel.

## Components Added/Modified

### 1. DeleteConfirmationModal.jsx
- **Location**: `src/components/Modals/DeleteConfirmationModal.jsx`
- **Purpose**: Reusable confirmation modal for delete actions
- **Features**:
  - Warning icon and styling
  - Customizable title, message, and item name
  - Loading state support
  - Cancel and confirm actions

### 2. SchoolsTable.jsx (Modified)
- **Location**: `src/components/Schools/SchoolsTable.jsx`
- **Changes**:
  - Added `onDeleteSchool` prop
  - Added delete modal state management
  - Added `handleDeleteClick`, `handleDeleteConfirm`, and `handleDeleteCancel` functions
  - Updated delete button to trigger confirmation modal
  - Added DeleteConfirmationModal component

### 3. App.jsx (Modified)
- **Location**: `src/App.jsx`
- **Changes**:
  - Added `useFirestore` hook for assessment_reports collection
  - Added `handleDeleteSchool` function
  - Passed `onDeleteSchool` prop to SchoolsTable

## How It Works

1. **User clicks delete button**: The red trash icon in the actions column
2. **Confirmation modal appears**: Shows school name and warning message
3. **User confirms deletion**: Clicks "Delete" button in modal
4. **School is deleted**: Document is removed from Firebase Firestore
5. **Success notification**: User sees confirmation message
6. **UI updates**: School is removed from the table automatically

## Features

- ✅ **Confirmation Modal**: Prevents accidental deletions
- ✅ **Loading States**: Shows loading spinner during deletion
- ✅ **Error Handling**: Displays error messages if deletion fails
- ✅ **Success Notifications**: Confirms successful deletion
- ✅ **Real-time Updates**: Table updates automatically after deletion
- ✅ **Responsive Design**: Works on all screen sizes

## Usage

1. Navigate to the Schools Management section
2. Find the school you want to delete
3. Click the red trash icon in the Actions column
4. Confirm the deletion in the modal
5. The school will be permanently deleted

## Technical Details

- **Database**: Uses Firebase Firestore `deleteDoc` function
- **Collection**: `assessment_reports`
- **Error Handling**: Try-catch blocks with user notifications
- **State Management**: React hooks for modal and loading states
- **UI Framework**: Tailwind CSS with Framer Motion animations

## Security Considerations

- Only authenticated admin users can access this feature
- Deletion is permanent and cannot be undone
- All associated school data is removed from the database
- Confirmation modal prevents accidental deletions
