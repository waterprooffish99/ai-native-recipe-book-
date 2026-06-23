import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Recipe } from '../../services/recipeService';

interface PdfDownloadButtonProps {
  recipe: Recipe;
  scalingFactor: number;
  language: string;
}

export const PdfDownloadButton: React.FC<PdfDownloadButtonProps> = ({
  recipe,
  scalingFactor,
  language,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [PDFModules, setPDFModules] = useState<{
    PDFDownloadLink: any;
    RecipePdfDocument: any;
  } | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Dynamically import PDF libraries on client side only to prevent Docusaurus SSR crashes
    Promise.all([
      import('@react-pdf/renderer'),
      import('./RecipePdfDocument')
    ])
      .then(([pdfRendererModule, recipePdfDocModule]) => {
        setPDFModules({
          PDFDownloadLink: pdfRendererModule.PDFDownloadLink,
          RecipePdfDocument: recipePdfDocModule.RecipePdfDocument,
        });
      })
      .catch((err) => {
        console.error('Error loading PDF generation libraries:', err);
      });
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const generateQrCode = () => {
      try {
        const canvas = qrRef.current?.querySelector('canvas');
        if (canvas) {
          const url = canvas.toDataURL('image/png');
          setQrCodeDataUrl(url);
        }
      } catch (err) {
        console.error('Failed to generate QR code data URL', err);
      }
    };

    // Short delay to ensure the QRCodeCanvas component has rendered
    const timer = setTimeout(generateQrCode, 150);
    return () => clearTimeout(timer);
  }, [isMounted, recipe.recipe_id]);

  if (!isMounted || !PDFModules) {
    return (
      <button
        disabled
        className="px-4 py-3 min-h-[44px] min-w-[120px] bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-500 font-medium cursor-not-allowed select-none"
      >
        Loading PDF...
      </button>
    );
  }

  const { PDFDownloadLink, RecipePdfDocument } = PDFModules;
  const recipeUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      {/* Hidden container to render the QR code canvas */}
      <div ref={qrRef} style={{ display: 'none' }}>
        {recipeUrl && (
          <QRCodeCanvas
            value={recipeUrl}
            size={128}
            level="H"
            includeMargin={false}
          />
        )}
      </div>

      <PDFDownloadLink
        document={
          <RecipePdfDocument
            recipe={recipe}
            scalingFactor={scalingFactor}
            qrCodeDataUrl={qrCodeDataUrl}
          />
        }
        fileName={`${recipe.name.replace(/\s+/g, '_')}_recipe.pdf`}
      >
        {({ blob, url, loading, error }: any) => {
          if (loading) {
            return (
              <button
                disabled
                className="px-4 py-3 min-h-[44px] bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 font-medium cursor-wait animate-pulse"
              >
                Generating PDF...
              </button>
            );
          }
          if (error) {
            console.error('PDF generation error:', error);
            return (
              <button
                disabled
                className="px-4 py-3 min-h-[44px] bg-red-900/40 border border-red-800 text-red-300 rounded-xl text-xs font-medium cursor-not-allowed"
              >
                PDF Error
              </button>
            );
          }
          return (
            <button
              type="button"
              className="px-4 py-3 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              📥 Download PDF
            </button>
          );
        }}
      </PDFDownloadLink>
    </>
  );
};

export default PdfDownloadButton;
