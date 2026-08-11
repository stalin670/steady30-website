import { redirect } from 'next/navigation';

/**
 * The app routes /maintenance at the completion screen (it re-exports
 * CompletionScreen), so the two are one page. Keep the URL working, keep one
 * implementation.
 */
const Maintenance = () => redirect('/completion');

export default Maintenance;
