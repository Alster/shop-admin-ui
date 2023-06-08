import { ORDER_STATUS } from '../../shop-shared/constants/order';

export const STATUS_TO_SEVERITY_MAP = {
  [ORDER_STATUS.CREATED]: 'primary',
  [ORDER_STATUS.FAILED]: 'danger',
  [ORDER_STATUS.FINISHED]: 'success',
};
