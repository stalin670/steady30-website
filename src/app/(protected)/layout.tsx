/**
 * Everything under (protected) is per-member and must never be prerendered or
 * shared from a cache. Without this, a build that runs without Supabase env vars
 * happily turns these into static HTML and the auth gate stops running at all.
 *
 * AGENTS.md: no page carrying member data may be prerendered or CDN-cached.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => children;

export default ProtectedLayout;
