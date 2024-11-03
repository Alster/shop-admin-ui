import { IEnvironment } from "./iEnvironment";

export function applyEnvironment(environment: IEnvironment) {
	const process = { env: environment };
	const context = globalThis as unknown as { process: { env: IEnvironment } };
	context.process ??= process;
	context.process.env = context.process.env
		? { ...context.process.env, ...environment }
		: environment;
}
