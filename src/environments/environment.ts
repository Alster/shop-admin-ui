// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.production.ts`.
// The list of file replacements can be found in `angular.json`.

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import "zone.js/plugins/zone-error";

import { applyEnvironment } from "./src/applyEnvironment"; // Included with Angular CLI.
import { IEnvironment } from "./src/iEnvironment";

const environment: IEnvironment = {
	production: false,

	NEXT_PUBLIC_ADMIN_API_URL: `http://localhost:4300`,
	NEXT_PUBLIC_IMAGES_DOMAIN: `https://unicorn-bleak.s3.eu-central-1.amazonaws.com`,
};

applyEnvironment(environment);
