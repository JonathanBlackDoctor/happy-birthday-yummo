/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PANTRY_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
