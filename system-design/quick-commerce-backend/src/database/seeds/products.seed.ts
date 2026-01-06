import { DataSource } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { Category } from '../../entities/category.entity';

export async function seedProducts(
  dataSource: DataSource,
  categories: { [key: string]: Category },
): Promise<void> {
  const productRepository = dataSource.getRepository(Product);

  const products = [
    // Fruits & Vegetables
    {
      name: 'Fresh Tomatoes',
      description: 'Fresh red tomatoes, 1 kg',
      category_id: categories['Fruits & Vegetables']?.id,
      price: 40.0,
      image_url: 'https://example.com/images/tomatoes.jpg',
      unit: 'kg',
      is_active: true,
    },
    {
      name: 'Bananas',
      description: 'Fresh yellow bananas, 1 dozen',
      category_id: categories['Fruits & Vegetables']?.id,
      price: 60.0,
      image_url: 'https://example.com/images/bananas.jpg',
      unit: 'dozen',
      is_active: true,
    },
    {
      name: 'Onions',
      description: 'Fresh onions, 1 kg',
      category_id: categories['Fruits & Vegetables']?.id,
      price: 30.0,
      image_url: 'https://example.com/images/onions.jpg',
      unit: 'kg',
      is_active: true,
    },
    // Dairy & Eggs
    {
      name: 'Amul Milk',
      description: 'Fresh Amul milk, 1 liter',
      category_id: categories['Dairy & Eggs']?.id,
      price: 60.0,
      image_url: 'https://example.com/images/amul-milk.jpg',
      unit: 'liter',
      is_active: true,
    },
    {
      name: 'Farm Fresh Eggs',
      description: 'Fresh eggs, 12 pieces',
      category_id: categories['Dairy & Eggs']?.id,
      price: 90.0,
      image_url: 'https://example.com/images/eggs.jpg',
      unit: 'dozen',
      is_active: true,
    },
    {
      name: 'Amul Butter',
      description: 'Amul butter, 100g',
      category_id: categories['Dairy & Eggs']?.id,
      price: 55.0,
      image_url: 'https://example.com/images/butter.jpg',
      unit: 'pack',
      is_active: true,
    },
    // Beverages
    {
      name: 'Coca Cola',
      description: 'Coca Cola soft drink, 750ml',
      category_id: categories['Beverages']?.id,
      price: 40.0,
      image_url: 'https://example.com/images/coca-cola.jpg',
      unit: 'bottle',
      is_active: true,
    },
    {
      name: 'Orange Juice',
      description: 'Fresh orange juice, 1 liter',
      category_id: categories['Beverages']?.id,
      price: 120.0,
      image_url: 'https://example.com/images/orange-juice.jpg',
      unit: 'bottle',
      is_active: true,
    },
    // Snacks
    {
      name: 'Lays Classic',
      description: 'Lays classic chips, 50g',
      category_id: categories['Snacks & Munchies']?.id,
      price: 20.0,
      image_url: 'https://example.com/images/lays.jpg',
      unit: 'pack',
      is_active: true,
    },
    {
      name: 'Parle-G Biscuits',
      description: 'Parle-G glucose biscuits, 200g',
      category_id: categories['Snacks & Munchies']?.id,
      price: 25.0,
      image_url: 'https://example.com/images/parle-g.jpg',
      unit: 'pack',
      is_active: true,
    },
  ];

  for (const productData of products) {
    if (!productData.category_id) {
      console.log(`⊘ Skipping product ${productData.name} - category not found`);
      continue;
    }

    const existingProduct = await productRepository.findOne({
      where: { name: productData.name },
    });

    if (!existingProduct) {
      const product = productRepository.create(productData);
      await productRepository.save(product);
      console.log(`✓ Created product: ${productData.name}`);
    } else {
      console.log(`⊘ Product already exists: ${productData.name}`);
    }
  }
}

