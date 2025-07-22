import React, { useState, useEffect } from 'react';
import { FaRedo, FaDownload, FaCog } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import BingoCard from '../components/BingoCard';
import GeneratorSettings from '../components/GeneratorSettings';
import { useIcons } from '../hooks/useIcons';
import { generateBingoCards } from '../services/cardGenerator';
import { generatePDF } from '../services/pdfGeneratorFixed';

function Generator() {
  const { t } = useLanguage();
  const { icons, loading } = useIcons();
  const [settings, setSettings] = useState({
    title: 'Road Trip Bingo',
    gridSize: 5,
    multiHitMode: false,
    centerBlank: true,
    showLabels: true,
    cardCount: 1,
  });
  const [cards, setCards] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  const handleGenerate = async () => {
    if (icons.length === 0) return;
    
    setGenerating(true);
    try {
      const generatedCards = await generateBingoCards(icons, settings);
      setCards(generatedCards);
    } catch (error) {
      console.error('Error generating cards:', error);
    } finally {
      setGenerating(false);
    }
  };
  
  const handleDownloadPDF = async () => {
    if (cards.length === 0) return;
    
    setDownloading(true);
    try {
      await generatePDF(cards, settings);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setDownloading(false);
    }
  };
  
  useEffect(() => {
    if (icons.length > 0 && cards.length === 0) {
      handleGenerate();
    }
  }, [icons]);
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <GeneratorSettings 
            settings={settings} 
            onSettingsChange={setSettings}
          />
          
          <div className="mt-6 space-y-3">
            <button
              onClick={handleGenerate}
              disabled={loading || generating || icons.length === 0}
              className="w-full btn-primary justify-center disabled:opacity-50"
            >
              <FaRedo className={generating ? 'animate-spin' : ''} />
              {generating ? t('generating') : t('generateButton')}
            </button>
            
            <button
              onClick={handleDownloadPDF}
              disabled={cards.length === 0 || downloading}
              className="w-full btn-secondary justify-center disabled:opacity-50"
            >
              <FaDownload />
              {downloading ? t('downloading') : t('downloadPDF')}
            </button>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {cards.length > 0 ? (
            <div className="space-y-8">
              {cards.map((card, index) => (
                <BingoCard
                  key={index}
                  card={card}
                  settings={settings}
                />
              ))}
            </div>
          ) : (
            <div className="card h-96 flex items-center justify-center text-gray-500">
              {loading ? 'Loading icons...' : 'Generate a card to see it here'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Generator;