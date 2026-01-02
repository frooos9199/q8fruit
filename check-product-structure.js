const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

(async () => {
  const snapshot = await db.collection('products').limit(3).get();
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log('\n📦 Product:', data.nameAr || data.name);
    console.log('   🔑 Keys:', Object.keys(data).join(', '));
    console.log('   📸 image:', data.image);
    console.log('   🖼️ imageUrl:', data.imageUrl);
  });
  process.exit(0);
})();
