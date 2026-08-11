import { redirect } from 'next/navigation';

/**
 * Asking for support and managing who can be asked are the same surface on the
 * web — splitting them would mean two pages that each show half the picture.
 * The app's separate /trusted-support route keeps working.
 */
const TrustedSupport = () => redirect('/trusted-contacts');

export default TrustedSupport;
