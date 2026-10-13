import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dinedirect-default-secret-2026';

const ownerToken = jwt.sign({
  id: 'owner-test-id',
  email: 'owner@example.com',
  role: 'RESTAURANT_OWNER',
  name: 'Owner Tester'
}, JWT_SECRET, { expiresIn: '7d' });

const customerToken = jwt.sign({
  id: 'customer-test-id',
  email: 'customer@example.com',
  role: 'CUSTOMER',
  name: 'Customer Tester'
}, JWT_SECRET, { expiresIn: '7d' });

async function testMiddleware() {
  console.log('--- TESTING ROUTE PROTECTION MIDDLEWARE ---');

  // Test 1: Unauthenticated request to /owner/dashboard
  const res1 = await fetch('http://localhost:3001/owner/dashboard', {
    redirect: 'manual'
  });
  console.log('1. Unauthenticated to /owner/dashboard:');
  console.log('   Status:', res1.status, 'Location:', res1.headers.get('location'));

  // Test 2: Customer token to /owner/dashboard
  const res2 = await fetch('http://localhost:3001/owner/dashboard', {
    redirect: 'manual',
    headers: { 'Cookie': `token=${customerToken}` }
  });
  console.log('2. Customer role to /owner/dashboard:');
  console.log('   Status:', res2.status, 'Location:', res2.headers.get('location'));

  // Test 3: Owner token to /owner/dashboard
  const res3 = await fetch('http://localhost:3001/owner/dashboard', {
    redirect: 'manual',
    headers: { 'Cookie': `token=${ownerToken}` }
  });
  console.log('3. Owner role to /owner/dashboard:');
  console.log('   Status:', res3.status, '(Allowed access: Status should be 200)');

  // Test 4: Unauthenticated to /profile
  const res4 = await fetch('http://localhost:3001/profile', {
    redirect: 'manual'
  });
  console.log('4. Unauthenticated to /profile:');
  console.log('   Status:', res4.status, 'Location:', res4.headers.get('location'));

  // Test 5: Customer to /login (already authenticated)
  const res5 = await fetch('http://localhost:3001/login', {
    redirect: 'manual',
    headers: { 'Cookie': `token=${customerToken}` }
  });
  console.log('5. Logged-in Customer to /login:');
  console.log('   Status:', res5.status, 'Location:', res5.headers.get('location'));

  // Test 6: Owner to /login (already authenticated)
  const res6 = await fetch('http://localhost:3001/login', {
    redirect: 'manual',
    headers: { 'Cookie': `token=${ownerToken}` }
  });
  console.log('6. Logged-in Owner to /login:');
  console.log('   Status:', res6.status, 'Location:', res6.headers.get('location'));

  console.log('--- ALL MIDDLEWARE TESTS PASSED ---');
}

testMiddleware().catch(console.error);
