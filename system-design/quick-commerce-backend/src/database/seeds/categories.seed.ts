import { DataSource } from 'typeorm';
import { Category } from '../../entities/category.entity';

export async function seedCategories(
  dataSource: DataSource,
): Promise<{ [key: string]: Category }> {
  const categoryRepository = dataSource.getRepository(Category);

  const categories = [
    {
      name: 'Fruits & Vegetables',
      description: 'Fresh fruits and vegetables',
      image_url: 'https://example.com/images/fruits-vegetables.jpg',
      parent_id: null,
      is_active: true,
    },
    {
      name: 'Dairy & Eggs',
      description: 'Milk, cheese, eggs and dairy products',
      image_url: 'https://example.com/images/dairy.jpg',
      parent_id: null,
      is_active: true,
    },
    {
      name: 'Beverages',
      description: 'Soft drinks, juices, and beverages',
      image_url: 'https://example.com/images/beverages.jpg',
      parent_id: null,
      is_active: true,
    },
    {
      name: 'Snacks & Munchies',
      description: 'Chips, biscuits, and snacks',
      image_url: 'https://example.com/images/snacks.jpg',
      parent_id: null,
      is_active: true,
    },
    {
      name: 'Personal Care',
      description: 'Soap, shampoo, and personal care items',
      image_url: 'https://example.com/images/personal-care.jpg',
      parent_id: null,
      is_active: true,
    },
  ];

  const savedCategories: { [key: string]: Category } = {};

  for (const categoryData of categories) {
    const existingCategory = await categoryRepository.findOne({
      where: { name: categoryData.name },
    });

    if (!existingCategory) {
      const category = categoryRepository.create(categoryData);
      const saved = await categoryRepository.save(category);
      savedCategories[categoryData.name] = saved;
      console.log(`✓ Created category: ${categoryData.name}`);
    } else {
      savedCategories[categoryData.name] = existingCategory;
      console.log(`⊘ Category already exists: ${categoryData.name}`);
    }
  }

  return savedCategories;
}

