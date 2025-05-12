export const generateSlug = (name: string) => (name ? name.toLowerCase().replace(/\s+/g, '-') : '');
