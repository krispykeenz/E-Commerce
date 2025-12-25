export const environment = {
  production: true,
  demoMode: true,
  // In demo mode, requests are intercepted client-side (no backend required).
  apiUrl: '/api',
  // Stripe is simulated in demo mode; key is unused.
  stripePublishableKey: 'demo'
};
