import { IEnvironment } from "../environments/src/iEnvironment";

declare global {
	namespace NodeJS {
		interface ProcessEnvironment extends IEnvironment {}
	}
}

export {};
