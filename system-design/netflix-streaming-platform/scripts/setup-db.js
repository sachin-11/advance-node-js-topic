const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  // Database configuration
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'netflix_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  };

  console.log('🔄 Setting up Netflix Streaming Platform database...');

  const client = new Client({
    ...dbConfig,
    database: 'postgres' // Connect to default database first
  });

  try {
    // Connect to PostgreSQL
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Create database if it doesn't exist
    try {
      await client.query(`CREATE DATABASE ${dbConfig.database}`);
      console.log(`✅ Created database: ${dbConfig.database}`);
    } catch (error) {
      if (error.code === '42P04') {
        console.log(`ℹ️  Database ${dbConfig.database} already exists`);
      } else {
        throw error;
      }
    }

    // Close connection to default database
    await client.end();

    // Connect to the Netflix database
    const netflixClient = new Client(dbConfig);
    await netflixClient.connect();
    console.log(`✅ Connected to database: ${dbConfig.database}`);

    // Enable UUID extension
    await netflixClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ Enabled UUID extension');

    // Enable trigram extension for full-text search
    await netflixClient.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
    console.log('✅ Enabled pg_trgm extension');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../src/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 Executing database schema...');

    // Split schema into individual statements and execute them
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await netflixClient.query(statement);
        } catch (error) {
          console.error('❌ Error executing statement:', statement.substring(0, 100) + '...');
          console.error('Error details:', error.message);
          throw error;
        }
      }
    }

    console.log('✅ Database schema created successfully');

    // Seed with sample data (optional)
    if (process.argv.includes('--seed')) {
      console.log('🔄 Seeding sample data...');
      await seedSampleData(netflixClient);
      console.log('✅ Sample data seeded');
    }

    await netflixClient.end();
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Set up your environment variables in .env file');
    console.log('2. Start Redis server');
    console.log('3. Run: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

async function seedSampleData(client) {
  // Insert sample categories
  const categories = [
    { name: 'Action & Adventure', display_order: 1 },
    { name: 'Comedy', display_order: 2 },
    { name: 'Drama', display_order: 3 },
    { name: 'Horror', display_order: 4 },
    { name: 'Sci-Fi & Fantasy', display_order: 5 },
    { name: 'Romance', display_order: 6 },
    { name: 'Thriller', display_order: 7 },
    { name: 'Documentary', display_order: 8 }
  ];

  for (const category of categories) {
    await client.query(
      'INSERT INTO categories (name, description, display_order) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
      [category.name, `Collection of ${category.name.toLowerCase()} content`, category.display_order]
    );
  }

  // Insert sample content
  const sampleContent = [
    {
      title: 'The Matrix',
      content_type: 'movie',
      description: 'A computer hacker learns about the true nature of reality.',
      duration_minutes: 136,
      language: 'en',
      release_date: '1999-03-31',
      genres: ['Action', 'Sci-Fi'],
      age_rating: 'R',
      director: 'Wachowski Sisters',
      cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss']
    },
    {
      title: 'Stranger Things',
      content_type: 'tv_show',
      description: 'When a young boy disappears, his mother and friends uncover supernatural forces.',
      language: 'en',
      release_date: '2016-07-15',
      genres: ['Sci-Fi', 'Horror', 'Drama'],
      age_rating: 'TV-14',
      director: 'The Duffer Brothers',
      cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'David Harbour']
    }
  ];

  for (const content of sampleContent) {
    const result = await client.query(
      `INSERT INTO content (
        title, content_type, description, duration_minutes, language,
        release_date, genres, age_rating, director, cast, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
      RETURNING id`,
      [
        content.title,
        content.content_type,
        content.description,
        content.duration_minutes,
        content.language,
        content.release_date,
        content.genres,
        content.age_rating,
        content.director,
        content.cast
      ]
    );

    const contentId = result.rows[0].id;

    // Add content to categories
    for (const genre of content.genres) {
      const categoryResult = await client.query('SELECT id FROM categories WHERE name = $1', [genre]);
      if (categoryResult.rows.length > 0) {
        await client.query(
          'INSERT INTO content_categories (content_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [contentId, categoryResult.rows[0].id]
        );
      }
    }

    // Create TV show entry if it's a TV show
    if (content.content_type === 'tv_show') {
      await client.query(
        'INSERT INTO tv_shows (id, total_seasons, status) VALUES ($1, $2, $3)',
        [contentId, 4, 'ongoing']
      );
    }
  }

  console.log('✅ Sample content added');
}

// Run setup
setupDatabase().catch(console.error);