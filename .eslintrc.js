module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "tsconfig.json",
		tsconfigRootDir: __dirname,
		sourceType: "module",
	},
	plugins: [
		"@typescript-eslint/eslint-plugin",
		"prettier",
		"simple-import-sort",
		"import",
		"sonarjs",
		"unicorn",
	],
	extends: [
		"plugin:@typescript-eslint/recommended",
		"plugin:prettier/recommended",
		"eslint:recommended",
		"plugin:import/typescript",
		"plugin:prettier/recommended", // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
		"plugin:sonarjs/recommended",
		"plugin:unicorn/all",
	],
	root: true,
	env: {
		node: true,
	},
	ignorePatterns: [".eslintrc.js"],
	rules: {
		"max-len": [
			"error",
			{
				code: 120,
				tabWidth: 2,
				ignoreUrls: true,
				ignoreRegExpLiterals: true,
				ignoreStrings: true,
			},
		],
		semi: [2, "always"],
		"no-console": "error",
		"no-duplicate-imports": "error",
		"linebreak-style": ["error", "unix"],
		"@typescript-eslint/promise-function-async": "error",
		"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
		"@typescript-eslint/naming-convention": [
			"error",
			{
				selector: ["function"],
				format: ["camelCase"],
			},
			{
				selector: ["class"],
				format: ["PascalCase"],
				custom: {
					regex: "[A-Za-z]",
					match: true,
				},
			},
			{
				selector: ["enum"],
				format: ["PascalCase"],
				custom: {
					regex: "[A-Za-z]Enum$",
					match: true,
				},
			},
			{
				selector: ["interface"],
				format: ["PascalCase"],
				custom: {
					regex: "^I[A-Za-z]|[A-Za-z]Dto$",
					match: true,
				},
			},
		],
		"@typescript-eslint/interface-name-prefix": "off",
		"@typescript-eslint/explicit-function-return-type": "warn",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-explicit-any": "error",
		"@typescript-eslint/no-floating-promises": "error",
		"no-nested-ternary": "off",
		"simple-import-sort/imports": "warn",
		"@typescript-eslint/member-ordering": [
			"error",
			{
				classes: [
					"public-static-field",
					"protected-static-field",
					"private-static-field",
					"public-field",
					"protected-field",
					"constructor",
					"public-static-method",
					"protected-static-method",
					"private-static-method",
					"public-method",
					"protected-method",
					"private-method",
				],
			},
		],
		"no-else-return": "error",
		"import/no-absolute-path": "error",
		"import/no-useless-path-segments": "error",
		"import/newline-after-import": "error",
		"import/no-unresolved": "warn",
		"unicorn/no-array-reduce": "off",
		"unicorn/no-keyword-prefix": "off",
		"unicorn/filename-case": [
			"error",
			{
				case: "camelCase",
			},
		],
	},
};
