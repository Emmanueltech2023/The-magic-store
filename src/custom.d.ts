declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';

// Allow importing JSON metadata without types
declare module '*.json';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
