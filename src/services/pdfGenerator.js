import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';

// PDF generation service
export function generatePDF(cards, settings) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Starting PDF generation with cards:', cards.length);
      console.log('First card data:', cards[0]);
      console.log('Settings:', settings);
      
      // Create PDF container
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.width = '8.5in';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      
      // Generate HTML content for all cards and collect image promises
      const imagePromises = [];
      
      cards.forEach((card, cardIndex) => {
        const { cardElement, imageLoadPromises } = createCardHTML(card, settings, cardIndex, cards.length);
        imagePromises.push(...imageLoadPromises);
        pdfContainer.appendChild(cardElement);
        
        // Add page break between cards (except for last card)
        if (cardIndex < cards.length - 1) {
          const pageBreak = document.createElement('div');
          pageBreak.style.pageBreakAfter = 'always';
          pdfContainer.appendChild(pageBreak);
        }
      });
      
      document.body.appendChild(pdfContainer);
      
      // Make container visible temporarily to ensure proper rendering
      pdfContainer.style.left = '0px';
      pdfContainer.style.top = '0px';
      pdfContainer.style.zIndex = '9999';
      pdfContainer.style.backgroundColor = 'white';
      
      // Wait for all images to load before generating PDF
      console.log(`Waiting for ${imagePromises.length} images to load...`);
      try {
        await Promise.all(imagePromises);
        console.log('All images loaded successfully');
      } catch (imageError) {
        console.warn('Some images failed to load, proceeding with PDF generation:', imageError);
      }
      
      // Give additional time for rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force browser to recalculate layout
      pdfContainer.offsetHeight;
      
      // Hide container again
      pdfContainer.style.left = '-9999px';
      
      // PDF options
      const options = {
        margin: 0.5,
        filename: `${settings.title.replace(/\s+/g, '_')}_bingo_cards.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            // Ensure all images in the cloned document are loaded
            const clonedImages = clonedDoc.querySelectorAll('img');
            clonedImages.forEach(img => {
              console.log(`Checking cloned image: ${img.alt}, complete: ${img.complete}`);
            });
          }
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      console.log('Generating PDF...');
      console.log('PDF container HTML preview:', pdfContainer.innerHTML.substring(0, 500) + '...');
      
      // Check if all images are actually loaded in DOM
      const domImages = pdfContainer.querySelectorAll('img');
      console.log(`Found ${domImages.length} images in DOM`);
      domImages.forEach((img, idx) => {
        console.log(`Image ${idx}: ${img.alt}, complete: ${img.complete}, width: ${img.width}, height: ${img.height}`);
      });
      
      // Generate PDF
      await html2pdf().set(options).from(pdfContainer).save();
      
      // Clean up
      document.body.removeChild(pdfContainer);
      console.log('PDF generation completed successfully');
      resolve();
    } catch (error) {
      console.error('PDF generation error:', error);
      reject(error);
    }
  });
}

function createCardHTML(card, settings, cardIndex, totalCards = 1) {
  const { gridSize, showLabels, title } = settings;
  const imageLoadPromises = [];
  
  const cardDiv = document.createElement('div');
  cardDiv.style.cssText = `
    width: 100%;
    max-width: 7.5in;
    margin: 0 auto;
    padding: 0.5in;
    page-break-inside: avoid;
  `;
  
  // Card title
  const titleElement = document.createElement('h2');
  titleElement.textContent = `${title} ${totalCards > 1 ? `(Card ${cardIndex + 1})` : ''}`;
  titleElement.style.cssText = `
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: bold;
    color: #333;
  `;
  cardDiv.appendChild(titleElement);
  
  // Grid container
  const gridDiv = document.createElement('div');
  gridDiv.style.cssText = `
    display: grid;
    grid-template-columns: repeat(${gridSize}, 1fr);
    gap: 2px;
    aspect-ratio: 1;
    border: 2px solid #333;
    background-color: #333;
  `;
  
  // Create cells
  console.log(`Card has ${card.cells.length} cells`);
  card.cells.forEach((cell, index) => {
    console.log(`Cell ${index}:`, { isBlank: cell.isBlank, hasIcon: !!cell.icon, iconName: cell.icon?.name });
    const cellDiv = document.createElement('div');
    cellDiv.style.cssText = `
      aspect-ratio: 1;
      background-color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5px;
      position: relative;
      ${cell.multiHitTarget ? 'border: 3px solid #2563eb;' : ''}
    `;
    
    if (cell.isBlank) {
      const freeText = document.createElement('span');
      freeText.textContent = 'FREE';
      freeText.style.cssText = `
        font-weight: bold;
        font-size: 16px;
        color: #666;
      `;
      cellDiv.appendChild(freeText);
    } else if (cell.icon && cell.icon.data) {
      console.log(`Creating image for: ${cell.icon.name}`);
      console.log(`Image data preview: ${cell.icon.data.substring(0, 50)}...`);
      
      const img = document.createElement('img');
      img.alt = cell.icon.name;
      img.style.cssText = `
        width: 80%;
        height: ${showLabels ? '70%' : '80%'};
        object-fit: contain;
        display: block;
        margin: 0 auto;
      `;
      
      // Create a promise that resolves when the image loads
      const imageLoadPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn(`Image load timeout for: ${cell.icon.name}`);
          reject(new Error(`Image load timeout: ${cell.icon.name}`));
        }, 5000); // 5 second timeout
        
        img.onload = () => {
          clearTimeout(timeout);
          console.log(`Image loaded successfully: ${cell.icon.name}`);
          resolve();
        };
        
        img.onerror = (error) => {
          clearTimeout(timeout);
          console.error(`Image failed to load: ${cell.icon.name}`, error);
          reject(error);
        };
      });
      
      // Set the src after setting up the event handlers
      img.src = cell.icon.data;
      imageLoadPromises.push(imageLoadPromise);
      
      cellDiv.appendChild(img);
      
      if (showLabels && cell.icon.name) {
        const label = document.createElement('span');
        label.textContent = cell.icon.name;
        label.style.cssText = `
          font-size: 8px;
          text-align: center;
          margin-top: 2px;
          line-height: 1;
          color: #333;
        `;
        cellDiv.appendChild(label);
      }
    } else {
      console.warn('Cell has no icon or icon data:', cell);
    }
    
    gridDiv.appendChild(cellDiv);
  });
  
  cardDiv.appendChild(gridDiv);
  return { cardElement: cardDiv, imageLoadPromises };
}

export function downloadPDFBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}