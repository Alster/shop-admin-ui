import { SeverityEnum } from '@/src/app/constants/severity.enum';

import { ORDER_STATUS } from '../../../shop-shared/constants/order';

export const STATUS_TO_SEVERITY_MAP = {
	[ORDER_STATUS.CREATED]: undefined,

	[ORDER_STATUS.PENDING]: undefined,
	[ORDER_STATUS.PAID]: SeverityEnum.info,

	[ORDER_STATUS.FAILED]: SeverityEnum.danger,
	[ORDER_STATUS.FINISHED]: SeverityEnum.success,
};
