# Firestore Indexes Required for Point Events

The Point Events audit system requires specific Firestore composite indexes to function optimally. These indexes enable efficient querying of point events by student, house, and timestamp.

## Required Indexes

### 1. Student Point Events Index
- **Collection**: `pointsEvents`
- **Fields**: 
  - `studentId` (Ascending)
  - `timestamp` (Descending)
- **Purpose**: Enables querying point events for a specific student, ordered by most recent first

### 2. House Point Events Index  
- **Collection**: `pointsEvents`
- **Fields**:
  - `house` (Ascending) 
  - `timestamp` (Descending)
- **Purpose**: Enables querying point events for a specific house, ordered by most recent first

### 3. Global Point Events Index
- **Collection**: `pointsEvents`
- **Fields**:
  - `timestamp` (Descending)
- **Purpose**: Enables querying all point events, ordered by most recent first
- **Note**: This is automatically created by Firestore as a single-field index

## How to Create Indexes

### Option 1: Automatic Index Creation
When you first run queries that require these indexes, Firebase will provide error messages with direct links to create the indexes. Simply follow these links in the Firebase Console.

### Option 2: Firebase CLI
Deploy the indexes using Firebase CLI:

```bash
firebase deploy --only firestore:indexes
```

### Option 3: Manual Creation in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to your project
3. Go to Firestore Database → Indexes tab
4. Click "Create Index" and configure each index as specified above

## Index Configuration File

The indexes are defined in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "pointsEvents",
      "queryScope": "COLLECTION", 
      "fields": [
        {"fieldPath": "studentId", "order": "ASCENDING"},
        {"fieldPath": "timestamp", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "pointsEvents",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "house", "order": "ASCENDING"},
        {"fieldPath": "timestamp", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "pointsEvents", 
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "timestamp", "order": "DESCENDING"}
      ]
    }
  ]
}
```

## Fallback Behavior

If indexes are missing, the query functions will:
1. Log a warning message
2. Perform a fallback query without ordering
3. Sort results client-side (less efficient but functional)
4. Apply any specified limits

This ensures the application continues to work even without indexes, though performance will be reduced.

## Performance Impact

- **With Indexes**: Optimal query performance, server-side sorting
- **Without Indexes**: Functional but slower, client-side sorting, more bandwidth usage

## Index Status Monitoring

You can monitor index build status in the Firebase Console under Firestore → Indexes. New indexes typically take a few minutes to build for existing data.