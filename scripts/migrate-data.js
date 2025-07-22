#!/usr/bin/env node

import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

function getImageTypeFromBuffer(buffer) {
  // Check magic numbers to determine image type
  const firstBytes = buffer.slice(0, 8);
  
  if (firstBytes[0] === 0xFF && firstBytes[1] === 0xD8) {
    return 'image/jpeg';
  } else if (firstBytes[0] === 0x89 && firstBytes[1] === 0x50 && firstBytes[2] === 0x4E && firstBytes[3] === 0x47) {
    return 'image/png';
  } else if (firstBytes[0] === 0x47 && firstBytes[1] === 0x49 && firstBytes[2] === 0x46) {
    return 'image/gif';
  } else if (firstBytes[0] === 0x3C && firstBytes[1] === 0x3F) {
    return 'image/svg+xml';
  }
  
  // Default to PNG if can't detect
  return 'image/png';
}

async function migrateData() {
  console.log('🚀 Starting data migration from old database to new Prisma schema...\n');
  
  const oldDbPath = path.join(__dirname, '../data/roadtripbingo.db');
  const newDbPath = path.join(__dirname, '../data/roadtripbingo-new.db');
  
  if (!fs.existsSync(oldDbPath)) {
    console.error('❌ Old database not found at:', oldDbPath);
    process.exit(1);
  }
  
  const oldDb = new Database(oldDbPath, { readonly: true });
  
  try {
    // Migrate Icons
    console.log('📦 Migrating icons...');
    await migrateIcons(oldDb);
    
    // Migrate Settings
    console.log('⚙️  Migrating settings...');
    await migrateSettings(oldDb);
    
    // Show summary
    await showMigrationSummary();
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    oldDb.close();
    await prisma.$disconnect();
  }
}

async function migrateIcons(oldDb) {
  const icons = oldDb.prepare('SELECT * FROM icons').all();
  console.log(`   Found ${icons.length} icons to migrate`);
  
  let migrated = 0;
  let skipped = 0;
  
  for (const icon of icons) {
    try {
      // Check if icon already exists
      const existing = await prisma.icon.findFirst({
        where: { name: icon.name }
      });
      
      if (existing) {
        console.log(`   ⚠️  Skipping ${icon.name} (already exists)`);
        skipped++;
        continue;
      }
      
      // Extract tags (handle both string and JSON formats)
      let tags = [];
      if (icon.tags) {
        try {
          tags = typeof icon.tags === 'string' ? JSON.parse(icon.tags) : icon.tags;
        } catch (e) {
          tags = [];
        }
      }
      
      // Convert buffer to base64 if needed
      let imageData = icon.data || icon.image_data;
      if (Buffer.isBuffer(imageData)) {
        // Try to determine the image type from the buffer
        const imageType = getImageTypeFromBuffer(imageData);
        imageData = `data:${imageType};base64,${imageData.toString('base64')}`;
      }
      
      await prisma.icon.create({
        data: {
          name: icon.name,
          data: imageData,
          difficulty: icon.difficulty || 1,
          tags: JSON.stringify(Array.isArray(tags) ? tags : []),
          excludeFromMultiHit: Boolean(icon.exclude_from_multi_hit) || false,
          altText: icon.alt_text || '',
          category: icon.category || 'default'
        }
      });
      
      migrated++;
      console.log(`   ✅ Migrated: ${icon.name}`);
    } catch (error) {
      console.error(`   ❌ Failed to migrate icon ${icon.name}:`, error.message);
    }
  }
  
  console.log(`   📊 Icons: ${migrated} migrated, ${skipped} skipped`);
}

async function migrateSettings(oldDb) {
  try {
    const settings = oldDb.prepare('SELECT * FROM settings').all();
    console.log(`   Found ${settings.length} settings to migrate`);
    
    let migrated = 0;
    
    for (const setting of settings) {
      try {
        await prisma.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: {
            key: setting.key,
            value: setting.value
          }
        });
        
        migrated++;
        console.log(`   ✅ Migrated setting: ${setting.key}`);
      } catch (error) {
        console.error(`   ❌ Failed to migrate setting ${setting.key}:`, error.message);
      }
    }
    
    console.log(`   📊 Settings: ${migrated} migrated`);
  } catch (error) {
    console.log('   ℹ️  No settings table found in old database (skipping)');
  }
}

async function showMigrationSummary() {
  console.log('\n📋 Migration Summary:');
  
  const iconCount = await prisma.icon.count();
  const settingCount = await prisma.setting.count();
  
  console.log(`   📦 Icons: ${iconCount}`);
  console.log(`   ⚙️  Settings: ${settingCount}`);
}

// Run migration if called directly
if (process.argv[1] === __filename) {
  migrateData().catch(console.error);
}

export { migrateData };