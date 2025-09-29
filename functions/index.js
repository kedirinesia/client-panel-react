const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Cloud Function to get total user count from Firebase Auth
exports.getUserCount = functions.https.onCall(async (data, context) => {
  try {
    // Get all users from Firebase Auth
    const listUsersResult = await admin.auth().listUsers();
    const totalUsers = listUsersResult.users.length;
    
    // Update the count in Firestore
    await admin.firestore().collection('stats').doc('userCount').set({
      count: totalUsers,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      source: 'firebase_auth',
      autoSync: true
    }, { merge: true });
    
    console.log(`User count synced: ${totalUsers} users`);
    return { success: true, count: totalUsers };
  } catch (error) {
    console.error('Error getting user count:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get user count');
  }
});

// Cloud Function to sync user count when auth state changes
exports.syncUserCountOnCreate = functions.auth.user().onCreate(async (user) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const totalUsers = listUsersResult.users.length;
    
    await admin.firestore().collection('stats').doc('userCount').set({
      count: totalUsers,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      source: 'firebase_auth',
      autoSync: true,
      trigger: 'user_created'
    }, { merge: true });
    
    console.log(`User created - count updated to: ${totalUsers}`);
  } catch (error) {
    console.error('Error syncing user count on create:', error);
  }
});

// Cloud Function to sync user count when user is deleted
exports.syncUserCountOnDelete = functions.auth.user().onDelete(async (user) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const totalUsers = listUsersResult.users.length;
    
    await admin.firestore().collection('stats').doc('userCount').set({
      count: totalUsers,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      source: 'firebase_auth',
      autoSync: true,
      trigger: 'user_deleted'
    }, { merge: true });
    
    console.log(`User deleted - count updated to: ${totalUsers}`);
  } catch (error) {
    console.error('Error syncing user count on delete:', error);
  }
});

// Scheduled function to sync user count every hour (backup)
exports.scheduledUserCountSync = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const totalUsers = listUsersResult.users.length;
    
    await admin.firestore().collection('stats').doc('userCount').set({
      count: totalUsers,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      source: 'firebase_auth',
      autoSync: true,
      trigger: 'scheduled_sync'
    }, { merge: true });
    
    console.log(`Scheduled sync - user count: ${totalUsers}`);
  } catch (error) {
    console.error('Error in scheduled user count sync:', error);
  }
});
