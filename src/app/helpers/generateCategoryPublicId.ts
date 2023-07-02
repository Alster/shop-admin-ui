import { CategoriesNodeDto } from '../../shop-shared/dto/category/categories-tree.dto';

/**
 * Generates public id for category
 * It gets title in "en" language and replace all spaces with "-"
 * All other symbols are removed
 */
export function generateCategoryPublicId(category: CategoriesNodeDto): string {
  return category.title['en']
    .replace(/\s/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();
}
