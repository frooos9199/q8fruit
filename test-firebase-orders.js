// Test script to check Firebase orders
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBW2-EDd8K8Nq5Uj5fJFaeAzQnchjcdbJU",
  authDomain: "fruitq8-ba5ef.firebaseapp.com",
  projectId: "fruitq8-ba5ef",
  storageBucket: "fruitq8-ba5ef.firebasestorage.app",
  messagingSenderId: "496410641214",
  appId: "1:496410641214:web:bc829a07ac23b9ba0ae26f"
};

async function testFirebaseOrders() {
  try {
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized');

    console.log('\n📦 Fetching orders from Firestore...');
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    
    console.log(`✅ Found ${snapshot.docs.length} orders in Firebase`);
    
    snapshot.docs.forEach((doc, index) => {
      console.log(`\n📝 Order ${index + 1}:`);
      console.log('  ID:', doc.id);
      const data = doc.data();
      console.log('  Order Number:', data.orderNumber);
      console.log('  Customer:', data.customer?.name || data.customer);
      console.log('  Status:', data.status);
      console.log('  Total:', data.pricing?.total || data.total);
      console.log('  Created:', data.createdAt?.toDate?.() || data.timestamp);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testFirebaseOrders();
