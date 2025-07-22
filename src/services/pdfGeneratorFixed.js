import html2pdf from 'html2pdf.js';

// PDF generation service with proper image handling
export function generatePDF(cards, settings) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Starting PDF generation with cards:', cards.length);
      
      // Create PDF container
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 8.5in;
        min-height: 11in;
        background: white;
        font-family: Arial, sans-serif;
        z-index: 10000;
        padding: 0.5in;
        box-sizing: border-box;
      `;
      
      // Generate HTML content for all cards
      for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
        const card = cards[cardIndex];
        const cardDiv = createCardElement(card, settings, cardIndex, cards.length);
        pdfContainer.appendChild(cardDiv);
        
        // Add page break between cards (except for last card)
        if (cardIndex < cards.length - 1) {
          const pageBreak = document.createElement('div');
          pageBreak.style.pageBreakAfter = 'always';
          pageBreak.style.height = '1px';
          pdfContainer.appendChild(pageBreak);
        }
      }
      
      // Add to document
      document.body.appendChild(pdfContainer);
      
      // Wait for next frame to ensure DOM is updated
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Force layout calculation
      pdfContainer.offsetHeight;
      
      // Wait a bit more for images to render
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // PDF options - simplified for better compatibility
      const opt = {
        margin: 0,
        filename: `${settings.title.replace(/\s+/g, '_')}_bingo_cards.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: true // Enable logging to debug
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
      };
      
      console.log('Starting html2pdf conversion...');
      
      // Generate PDF
      await html2pdf().set(opt).from(pdfContainer).save();
      
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

function createCardElement(card, settings, cardIndex, totalCards) {
  const { gridSize, showLabels, title } = settings;
  
  const cardDiv = document.createElement('div');
  cardDiv.style.cssText = `
    width: 7.5in;
    margin: 0 auto;
    page-break-inside: avoid;
  `;
  
  // Card title
  const titleElement = document.createElement('h2');
  titleElement.textContent = `${title} ${totalCards > 1 ? `(Card ${cardIndex + 1})` : ''}`;
  titleElement.style.cssText = `
    text-align: center;
    margin: 0 0 20px 0;
    font-size: 24px;
    font-weight: bold;
    color: #333;
  `;
  cardDiv.appendChild(titleElement);
  
  // Create table instead of grid for better PDF compatibility
  const table = document.createElement('table');
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    border: 3px solid #333;
    table-layout: fixed;
  `;
  
  const tbody = document.createElement('tbody');
  
  // Create rows
  for (let row = 0; row < gridSize; row++) {
    const tr = document.createElement('tr');
    
    for (let col = 0; col < gridSize; col++) {
      const cellIndex = row * gridSize + col;
      const cell = card.cells[cellIndex];
      
      const td = document.createElement('td');
      td.style.cssText = `
        border: 2px solid #333;
        padding: 8px;
        text-align: center;
        vertical-align: middle;
        width: ${100 / gridSize}%;
        height: ${7.5 / gridSize}in;
        position: relative;
        background: white;
      `;
      
      if (cell.multiHitTarget) {
        td.style.border = '4px solid #2563eb';
      }
      
      if (cell.isBlank) {
        // FREE space
        const freeDiv = document.createElement('div');
        freeDiv.textContent = 'FREE';
        freeDiv.style.cssText = `
          font-weight: bold;
          font-size: 20px;
          color: #666;
        `;
        td.appendChild(freeDiv);
      } else if (cell.icon) {
        // Create container for icon
        const iconContainer = document.createElement('div');
        iconContainer.style.cssText = `
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        `;
        
        // Create image
        const img = document.createElement('img');
        img.src = cell.icon.data;
        img.alt = cell.icon.name;
        img.style.cssText = `
          max-width: 90%;
          max-height: ${showLabels ? '70%' : '85%'};
          object-fit: contain;
        `;
        
        iconContainer.appendChild(img);
        
        // Add label if needed
        if (showLabels && cell.icon.name) {
          const label = document.createElement('div');
          label.textContent = cell.icon.name;
          label.style.cssText = `
            font-size: 10px;
            margin-top: 4px;
            color: #333;
            word-wrap: break-word;
            max-width: 100%;
          `;
          iconContainer.appendChild(label);
        }
        
        td.appendChild(iconContainer);
      }
      
      tr.appendChild(td);
    }
    
    tbody.appendChild(tr);
  }
  
  table.appendChild(tbody);
  cardDiv.appendChild(table);
  
  return cardDiv;
}

export default { generatePDF };