// Road Trip Bingo - Icon Import Utility
// Import existing icons from filesystem into SQLite database

const fs = require('fs');
const path = require('path');
const SQLiteStorage = require('../src/js/modules/sqliteStorage');

class IconImporter {
  constructor() {
    this.storage = new SQLiteStorage();
    this.iconDir = './public/assets/icons';
  }

  // Convert image file to base64 data URL
  imageToBase64(filePath) {
    try {
      const imageBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      let mimeType;
      switch (ext) {
        case '.png':
          mimeType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          mimeType = 'image/jpeg';
          break;
        case '.svg':
          mimeType = 'image/svg+xml';
          break;
        case '.gif':
          mimeType = 'image/gif';
          break;
        default:
          mimeType = 'image/png'; // Default fallback
      }
      
      const base64String = imageBuffer.toString('base64');
      return `data:${mimeType};base64,${base64String}`;
    } catch (error) {
      console.error(`Error converting ${filePath} to base64:`, error);
      return null;
    }
  }

  // Extract icon name and category from filename
  parseIconName(filename) {
    const nameWithoutExt = path.parse(filename).name;
    
    // Clean up the name
    const cleanName = nameWithoutExt
      .replace(/[-_]/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Determine category based on keywords
    const lowerName = nameWithoutExt.toLowerCase();
    let category = 'other';
    
    if (lowerName.includes('car') || lowerName.includes('auto') || lowerName.includes('truck') || 
        lowerName.includes('bus') || lowerName.includes('ambulance') || lowerName.includes('bike')) {
      category = 'vehicles';
    } else if (lowerName.includes('tree') || lowerName.includes('plant') || lowerName.includes('flower') ||
               lowerName.includes('hay') || lowerName.includes('wood')) {
      category = 'nature';
    } else if (lowerName.includes('building') || lowerName.includes('house') || lowerName.includes('church') ||
               lowerName.includes('castle') || lowerName.includes('barn') || lowerName.includes('home')) {
      category = 'buildings';
    } else if (lowerName.includes('sign') || lowerName.includes('flag') || lowerName.includes('traffic')) {
      category = 'signs';
    } else if (lowerName.includes('animal') || lowerName.includes('horse') || lowerName.includes('cow') ||
               lowerName.includes('deer') || lowerName.includes('bird') || lowerName.includes('beetle')) {
      category = 'animals';
    } else if (lowerName.includes('bridge') || lowerName.includes('tunnel') || lowerName.includes('road') ||
               lowerName.includes('station') || lowerName.includes('parking')) {
      category = 'infrastructure';
    }
    
    return { name: cleanName, category };
  }

  // Import all icons from the filesystem
  async importAllIcons() {
    try {
      console.log('Initializing SQLite storage...');
      await this.storage.init();
      
      console.log(`Reading icons from: ${this.iconDir}`);
      
      if (!fs.existsSync(this.iconDir)) {
        throw new Error(`Icon directory not found: ${this.iconDir}`);
      }
      
      const files = fs.readdirSync(this.iconDir);
      const imageFiles = files.filter(file => 
        /\.(png|jpg|jpeg|svg|gif)$/i.test(file)
      );
      
      console.log(`Found ${imageFiles.length} image files to import`);
      
      let imported = 0;
      let skipped = 0;
      let errors = 0;
      
      for (const filename of imageFiles) {
        try {
          const filePath = path.join(this.iconDir, filename);
          const { name, category } = this.parseIconName(filename);
          
          console.log(`Importing: ${filename} -> ${name} (${category})`);
          
          // Convert to base64
          const base64Data = this.imageToBase64(filePath);
          if (!base64Data) {
            console.warn(`Skipping ${filename}: Could not convert to base64`);
            skipped++;
            continue;
          }
          
          // Save to database
          const iconData = {
            name: name,
            image: base64Data,
            category: category,
            tags: [category, name.toLowerCase()]
          };
          
          const result = await this.storage.saveIcon(iconData);
          if (result.success) {
            imported++;
            console.log(`✅ Imported: ${name} (ID: ${result.data?.id})`);
          } else {
            console.error(`❌ Failed to save ${name}:`, result.error);
            errors++;
          }
          
        } catch (error) {
          console.error(`❌ Error processing ${filename}:`, error.message);
          errors++;
        }
      }
      
      console.log('\n=== Import Summary ===');
      console.log(`Total files found: ${imageFiles.length}`);
      console.log(`Successfully imported: ${imported}`);
      console.log(`Skipped: ${skipped}`);
      console.log(`Errors: ${errors}`);
      
      // Verify final count
      const icons = await this.storage.loadIcons();
      console.log(`Final icon count in database: ${icons.length}`);
      
      return {
        total: imageFiles.length,
        imported,
        skipped,
        errors,
        finalCount: icons.length
      };
      
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    } finally {
      this.storage.close();
    }
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  const importer = new IconImporter();
  
  importer.importAllIcons()
    .then(result => {
      console.log('✅ Import completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = IconImporter;
