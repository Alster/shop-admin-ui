export interface IEnvironment {
	readonly production: boolean;

	readonly NEXT_PUBLIC_ADMIN_API_URL: string;
	readonly NEXT_PUBLIC_IMAGES_DOMAIN: string;
}
