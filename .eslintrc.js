// eslint-disable-next-line unicorn/prefer-module
module.exports = {
	root: true,
	overrides: [
		{
			files: ["*.ts"],
			parserOptions: {
				ecmaVersion: "latest",
				project: "tsconfig.json",
				// eslint-disable-next-line unicorn/prefer-module
				tsconfigRootDir: __dirname,
				sourceType: "module",
				parser: "@typescript-eslint/parser",
			},
			plugins: ["@typescript-eslint", "@typescript-eslint/eslint-plugin"],
			env: {
				es2021: true,
				node: true,
				jest: true,
			},
			extends: [
				"./src/shop-shared/.eslintrc.base.js",
				"plugin:@angular-eslint/recommended",
				"plugin:@angular-eslint/template/process-inline-templates",
			],
			rules: {
				"@angular-eslint/directive-selector": [
					"error",
					{
						type: "attribute",
						prefix: "app",
						style: "camelCase",
					},
				],
				"@angular-eslint/component-selector": [
					"error",
					{
						type: "element",
						prefix: "app",
						style: "kebab-case",
					},
				],
			},
		},
		{
			files: ["*.html"],
			extends: [
				"plugin:@angular-eslint/template/recommended",
				"plugin:@angular-eslint/template/accessibility",
			],
			rules: {},
		},
	],
};
