import eslint from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import checkFile from 'eslint-plugin-check-file';
import importPlugin from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
	// Global ignores
	{
		ignores: [
			'node_modules/**',
			'public/mockServiceWorker.js',
			'generators/**',
			'dist/**',
			'storybook-static/**',
		],
	},

	// Base JS recommended
	eslint.configs.recommended,

	// @eslint-react recommended (ESLint v10 native flat config)
	{
		...eslintReact.configs.recommended,
		settings: {
			...eslintReact.configs.recommended.settings,
			'react-x': { version: 'detect' },
		},
	},

	// TypeScript + React files
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: { jsx: true },
			},
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2021,
				// React is available globally via JSX transform
				React: 'readonly',
				// IndexedDB types (browser globals not in globals.browser)
				IDBValidKey: 'readonly',
				// Vitest globals
				describe: 'readonly',
				it: 'readonly',
				test: 'readonly',
				expect: 'readonly',
				beforeAll: 'readonly',
				afterAll: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				vi: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': tseslint,
			'react-hooks': reactHooks,
			'jsx-a11y': jsxA11y,
			import: importPlugin,
			'check-file': checkFile,
		},
		settings: {
			'import/resolver': {
				typescript: {},
			},
		},
		rules: {
			// TypeScript
			...tseslint.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-explicit-any': 'off',

			// React Hooks
			...reactHooks.configs.recommended.rules,
			// New react-hooks v7 rules — downgrade to warn for pre-existing issues
			'react-hooks/set-state-in-effect': 'warn',
			'react-hooks/purity': 'warn',
			'react-hooks/static-components': 'warn',
			'react-hooks/use-memo': 'warn',
			'react-hooks/preserve-manual-memoization': 'warn',
			'react-hooks/immutability': 'warn',
			'react-hooks/globals': 'warn',
			'react-hooks/refs': 'warn',
			'react-hooks/error-boundaries': 'warn',
			'react-hooks/set-state-in-render': 'warn',
			'react-hooks/gating': 'warn',

			// @eslint-react — turn off opinionated/React-19-suggestion rules
			// that weren't in the original config
			'@eslint-react/no-use-context': 'off',
			'@eslint-react/no-context-provider': 'off',
			'@eslint-react/no-forward-ref': 'off',
			'@eslint-react/use-state': 'off',
			'@eslint-react/no-array-index-key': 'warn',
			'@eslint-react/dom-no-dangerously-set-innerhtml': 'warn',
			'@eslint-react/purity': 'warn',
			'@eslint-react/set-state-in-effect': 'warn',
			'@eslint-react/no-nested-component-definitions': 'warn',

			// JSX A11y
			...jsxA11y.configs.recommended.rules,
			'jsx-a11y/anchor-is-valid': 'off',

			// Import
			'import/no-cycle': 'error',
			'import/default': 'off',
			'import/no-named-as-default-member': 'off',
			'import/no-named-as-default': 'off',
			'import/no-restricted-paths': [
				'error',
				{
					zones: [
						{
							target: './src/features/auth',
							from: './src/features',
							except: ['./auth'],
						},
						{
							target: './src/features/comments',
							from: './src/features',
							except: ['./comments'],
						},
						{
							target: './src/features/discussions',
							from: './src/features',
							except: ['./discussions'],
						},
						{
							target: './src/features/teams',
							from: './src/features',
							except: ['./teams'],
						},
						{
							target: './src/features/users',
							from: './src/features',
							except: ['./users'],
						},
						{
							target: './src/features',
							from: './src/app',
						},
						{
							target: [
								'./src/components',
								'./src/hooks',
								'./src/lib',
								'./src/types',
								'./src/utils',
							],
							from: ['./src/features', './src/app'],
						},
					],
				},
			],
			'import/order': [
				'error',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
						'object',
					],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true },
				},
			],

			// Misc
			'linebreak-style': ['error', 'unix'],

			// Check file naming
			'check-file/filename-naming-convention': [
				'error',
				{ '**/*.{ts,tsx}': 'KEBAB_CASE' },
				{ ignoreMiddleExtensions: true },
			],
		},
	},

	// Folder naming convention (non-test files)
	{
		files: ['src/**/*.{ts,tsx}'],
		ignores: ['src/**/__tests__/**'],
		plugins: { 'check-file': checkFile },
		rules: {
			'check-file/folder-naming-convention': [
				'error',
				{ '**/*': 'KEBAB_CASE' },
			],
		},
	},

	// Storybook story files — relax rules that don't apply to stories
	{
		files: ['**/*.stories.{ts,tsx}'],
		rules: {
			'react-hooks/rules-of-hooks': 'off',
			'@eslint-react/rules-of-hooks': 'off',
			'@eslint-react/no-nested-component-definitions': 'off',
			'@eslint-react/purity': 'off',
			'@eslint-react/set-state-in-effect': 'off',
			'react-hooks/set-state-in-effect': 'off',
			'react-hooks/purity': 'off',
		},
	},

	// Prettier (must be last)
	prettier,
];
