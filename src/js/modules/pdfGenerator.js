// Road Trip Bingo - PDF Generator
// Provides functions for generating PDF files of bingo cards

import { createImageFromBase64 } from './imageUtils.js';

/**
 * Generate a PDF with bingo cards
 * @param {Object} options - Options for PDF generation
 * @param {Array} options.cardSets - The generated card sets to include in the PDF
 * @param {string} options.identifier - The unique identifier for this set
 * @param {string} options.compressionLevel - PDF compression level ('NONE', 'FAST', 'MEDIUM', 'SLOW')
 * @param {boolean} options.showLabels - Whether to show labels on the bingo cards
 * @returns {Promise<Blob>} - Promise that resolves with the generated PDF blob
 */
async function generatePDF(options) {
    const { cardSets, identifier, compressionLevel = 'MEDIUM', showLabels = true } = options;
    
    // Get the jsPDF library from window global
    const { jsPDF } = window.jspdf;
    
    // Log compression level
    console.log(`PDF Generation: Using compression level ${compressionLevel}`);
    
    // Create PDF with correct initialization
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true // This enables PDF level compression
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // margin in mm
    
    // Add metadata and identifier
    pdf.setProperties({
        title: 'Road Trip Bingo Cards',
        subject: 'Bingo Cards for Road Trips',
        author: 'Road Trip Bingo Generator',
        keywords: 'bingo, road trip, game',
        creator: 'Road Trip Bingo Generator'
    });
    
    // Set compression quality based on selected level
    let imgQuality = 0.8; // Default medium quality
    
    switch (compressionLevel) {
        case 'NONE':
            imgQuality = 1.0;
            break;
        case 'FAST':
            imgQuality = 0.9;
            break;
        case 'MEDIUM':
            imgQuality = 0.8;
            break;
        case 'SLOW':
            imgQuality = 0.7;
            break;
    }
    
    let pageCount = 0;
    
    // Add set identifier on first page
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(identifier, pageWidth - margin, margin - 5, { align: 'right' });
    
    // Process each card set
    for (let s = 0; s < cardSets.length; s++) {
        const set = cardSets[s];
        
        // Process each card in the set
        for (let c = 0; c < set.cards.length; c++) {
            const card = set.cards[c];
            
            // Add a new page for each card except the first one
            if (pageCount > 0) {
                pdf.addPage();
                // Add identifier on each page
                pdf.setFontSize(8);
                pdf.setTextColor(100, 100, 100);
                pdf.text(identifier, pageWidth - margin, margin - 5, { align: 'right' });
            }
            pageCount++;
            
            // Add the card title
            pdf.setFontSize(16);
            pdf.setTextColor(0, 0, 0);
            pdf.text(card.title, pageWidth / 2, margin + 5, { align: 'center' });
            
            // Draw the grid
            const gridSize = card.grid.length;
            const cellSize = (pageWidth - (2 * margin)) / gridSize;
            const gridStartY = margin + 15;
            
            // Draw the cells
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    const cell = card.grid[row][col];
                    const x = margin + (col * cellSize);
                    const y = gridStartY + (row * cellSize);
                    
                    // Draw cell border
                    pdf.setDrawColor(0, 0, 0);
                    pdf.rect(x, y, cellSize, cellSize, 'S');
                    
                    if (cell.isFreeSpace) {
                        // Leave blank (no text, no image)
                        continue;
                    } else {
                        // Calculate image position - adjust based on whether labels are shown
                        const imgPadding = 2;
                        const labelSpace = showLabels ? 8 : 0; // Reserve space for labels only if they're shown
                        const imgX = x + imgPadding;
                        const imgY = y + imgPadding;
                        const imgWidth = cellSize - (2 * imgPadding);
                        const imgHeight = cellSize - (2 * imgPadding) - labelSpace;
                        
                        try {
                            // Add the image
                            if (cell.data) {
                                // Create temporary image to get dimensions
                                const img = createImageFromBase64(cell.data);
                                // Function to draw image when loaded
                                const drawImage = () => {
                                    try {
                                        // Calculate aspect ratio
                                        const aspect = img.width / img.height;
                                        let drawWidth = imgWidth;
                                        let drawHeight = imgWidth / aspect;
                                        
                                        // Adjust if too tall
                                        if (drawHeight > imgHeight) {
                                            drawHeight = imgHeight;
                                            drawWidth = imgHeight * aspect;
                                        }
                                        
                                        // Center the image both horizontally and vertically
                                        const centerX = imgX + (imgWidth - drawWidth) / 2;
                                        let centerY;
                                        
                                        if (showLabels) {
                                            // When labels are shown, center in the available image space (top portion)
                                            centerY = imgY + (imgHeight - drawHeight) / 2;
                                        } else {
                                            // When no labels, center in the entire cell
                                            centerY = y + (cellSize - drawHeight) / 2;
                                        }
                                        
                                        // Add the image to PDF
                                        pdf.addImage(
                                            cell.data,
                                            'JPEG',
                                            centerX,
                                            centerY,
                                            drawWidth,
                                            drawHeight,
                                            `img-${cell.id}`,
                                            'FAST',
                                            imgQuality
                                        );
                                    } catch (imgErr) {
                                        console.error('Error adding image to PDF:', imgErr);
                                    }
                                };
                                
                                // Check if image is loaded
                                if (img.complete) {
                                    drawImage();
                                } else {
                                    // Wait for image to load
                                    img.onload = drawImage;
                                }
                            }
                            
                            // Add the label if showLabels is true
                            if (showLabels) {
                                pdf.setFontSize(8);
                                pdf.text(
                                    cell.name,
                                    x + cellSize / 2,
                                    y + cellSize - 4,
                                    { align: 'center', baseline: 'middle', maxWidth: cellSize - 4 }
                                );
                            }
                            
                            // Add multi-hit badge if applicable
                            if (cell.isMultiHit && cell.hitCount > 1) {
                                const badgeSize = 6; // Size in mm
                                const badgeX = x + cellSize - badgeSize - 1;
                                const badgeY = y + 1;
                                
                                // Draw red circle for badge background
                                pdf.setFillColor(255, 68, 68); // Red color
                                pdf.setDrawColor(255, 255, 255); // White border
                                pdf.circle(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2, 'FD');
                                
                                // Add hit count text centered in the circle
                                pdf.setFontSize(8);
                                pdf.setTextColor(255, 255, 255); // White text
                                
                                // Calculate center position for text
                                const textX = badgeX + badgeSize/2;
                                const textY = badgeY + badgeSize/2;
                                
                                // Use text() method with align: center, but adjust Y manually for better centering
                                pdf.text(
                                    cell.hitCount.toString(),
                                    textX,
                                    textY + 1, // Small adjustment for better visual centering
                                    { align: 'center' }
                                );
                                
                                // Reset text color back to black for other elements
                                pdf.setTextColor(0, 0, 0);
                            }
                        } catch (cellErr) {
                            console.error('Error rendering cell:', cellErr);
                        }
                    }
                }
            }
        }
    }
    
    return pdf.output('blob');
}

/**
 * Trigger download of the generated PDF
 * @param {Blob} pdfBlob - The generated PDF as a Blob
 * @param {string} filename - The filename for the download
 */
function downloadPDFBlob(pdfBlob, filename = 'bingo-cards.pdf') {
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export functions
export {
    generatePDF,
    downloadPDFBlob
};