import { applyEnvironment } from "./src/applyEnvironment";
import { IEnvironment } from "./src/iEnvironment";

const environment: IEnvironment = {
	production: true,

	NEXT_PUBLIC_ADMIN_API_URL: `http://localhost:4300`,
	NEXT_PUBLIC_IMAGES_DOMAIN: `https://unicorn-bleak.s3.eu-central-1.amazonaws.com`,
};

applyEnvironment(environment);
