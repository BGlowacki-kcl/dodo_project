import admin from "firebase-admin";

// Initialize Firebase Admin as usual
admin.initializeApp({
    credential: admin.credential.cert("./backend/config/dodo-project-42d5c-firebase-adminsdk-fbsvc-14414f6ab9.json"),
});


//Script to wipe firebase authentication record, use carefully, not reversible
const deleteUsersInBatch = async (uids) => {
    try {
        const result = await admin.auth().deleteUsers(uids);
        console.log(`${result.successCount} users deleted, ${result.failureCount} failed`);
        if (result.failureCount > 0) {
            console.log(result.errors);
        }
    } catch (error) {
        console.error("Batch deletion error:", error);
    }
};


const deleteAllFirebaseUsers = async () => {
    try {
        let nextPageToken;
        do {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
            const uids = listUsersResult.users.map(user => user.uid);
            if (uids.length > 0) {
                await deleteUsersInBatch(uids);
                // Wait 60 seconds before deleting the next batch
                await new Promise(resolve => setTimeout(resolve, 60000));
            }
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);
        console.log("All users processed.");
    } catch (error) {
        console.error("Error deleting Firebase users:", error);
    }
};

deleteAllFirebaseUsers();
