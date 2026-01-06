import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  const users = [
    {
      phone: '+919876543210',
      email: 'john.doe@example.com',
      name: 'John Doe',
      address: '123 Main Street, Mumbai',
      latitude: 19.0760,
      longitude: 72.8777,
    },
    {
      phone: '+919876543211',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      address: '456 Park Avenue, Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
    },
    {
      phone: '+919876543212',
      email: 'rahul.sharma@example.com',
      name: 'Rahul Sharma',
      address: '789 MG Road, Bangalore',
      latitude: 12.9716,
      longitude: 77.5946,
    },
  ];

  for (const userData of users) {
    const existingUser = await userRepository.findOne({
      where: { phone: userData.phone },
    });

    if (!existingUser) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`✓ Created user: ${userData.name} (${userData.phone})`);
    } else {
      console.log(`⊘ User already exists: ${userData.phone}`);
    }
  }
}

