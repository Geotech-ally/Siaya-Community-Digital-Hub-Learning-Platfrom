// Shared public nav links. Kept in a plain (non-'use client') module so it can be
// imported by both the client navbar and the server-rendered footer — exporting a
// value from a 'use client' module turns it into a client reference on the server.
export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Departments', href: '/departments' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Enroll Now', href: '/register', cta: true },
];
