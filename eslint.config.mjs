import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Prettier owns formatting; disable any ESLint rule that would fight it.
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Local additions:
    'coverage/**',
    '.husky/**',
    'public/**',
    // Local Tiptap source/docs references used for implementation guidance:
    '.reference/**',
    // Prisma-generated client:
    'src/generated/**',
    // Tiptap CLI source is vendored as editable template code. Its upstream
    // React patterns intentionally predate this app's stricter React lint rules.
    'src/components/tiptap-*/**',
    'src/hooks/use-*.ts',
    'src/lib/tiptap-utils.ts',
    'src/scss.d.ts',
  ]),
]);

export default eslintConfig;
