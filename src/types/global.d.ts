// Allow importing plain CSS files in TypeScript (side-effect imports like `import './globals.css'`).
// Also covers common variants used by Next/React projects.

declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.module.css';
declare module '*.module.scss';

declare interface CSSModuleClasses {
  readonly [key: string]: string;
}
declare global {
  var otpStore: Record<string, string> | undefined;
}

export {};
