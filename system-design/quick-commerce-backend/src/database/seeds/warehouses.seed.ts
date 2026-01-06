import { DataSource } from 'typeorm';
import { Warehouse } from '../../entities/warehouse.entity';

export async function seedWarehouses(dataSource: DataSource): Promise<void> {
  const warehouseRepository = dataSource.getRepository(Warehouse);

  const warehouses = [
    {
      name: 'Mumbai Central Warehouse',
      address: '123 Industrial Area, Mumbai',
      latitude: 19.0760,
      longitude: 72.8777,
      service_radius: 10, // 10 km
      is_active: true,
    },
    {
      name: 'Delhi North Warehouse',
      address: '456 Sector 18, Noida, Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      service_radius: 15, // 15 km
      is_active: true,
    },
    {
      name: 'Bangalore South Warehouse',
      address: '789 Electronic City, Bangalore',
      latitude: 12.9716,
      longitude: 77.5946,
      service_radius: 12, // 12 km
      is_active: true,
    },
  ];

  for (const warehouseData of warehouses) {
    const existingWarehouse = await warehouseRepository.findOne({
      where: { name: warehouseData.name },
    });

    if (!existingWarehouse) {
      const warehouse = warehouseRepository.create(warehouseData);
      await warehouseRepository.save(warehouse);
      console.log(`✓ Created warehouse: ${warehouseData.name}`);
    } else {
      console.log(`⊘ Warehouse already exists: ${warehouseData.name}`);
    }
  }
}

