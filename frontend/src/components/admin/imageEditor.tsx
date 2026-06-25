import { useState } from 'react';
import { Icon } from '../Icons';

export default function ImageEditor({
  src,
  label,
  onClose,
}: {
  src: string;
  label: string;
  onClose: () => void;
}) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gold-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-maroon-800 to-maroon-900 flex items-center justify-center text-gold-300">
              <Icon.image />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-maroon-900">
                Image Editor · {label}
              </h2>
              <p className="text-[11px] text-maroon-700/60">
                Adjust brightness, contrast, rotation & zoom
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-maroon-50 text-maroon-700 cursor-pointer"
          >
            <Icon.close />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5 grid lg:grid-cols-3 gap-6">
          {/* Preview */}
          <div className="lg:col-span-2 bg-maroon-50 rounded-2xl flex items-center justify-center p-4 border border-gold-100 overflow-hidden min-h-[300px]">
            <div
              className="transition-all duration-200 ease-linear"
              style={{
                transform: `rotate(${rotation}deg) scale(${zoom})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
              }}
            >
              <img
                src={src}
                alt={label}
                className="max-h-[400px] w-auto rounded-xl shadow-lg border border-gold-200"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-5">
            {/* Brightness */}
            <div>
              <div className="flex justify-between text-xs font-bold text-maroon-900 mb-1">
                <span>
                  <Icon.sun /> Brightness
                </span>
                <span>{brightness}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="180"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-maroon-900 cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between text-xs font-bold text-maroon-900 mb-1">
                <span>
                  <Icon.contrast /> Contrast
                </span>
                <span>{contrast}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-maroon-900 cursor-pointer"
              />
            </div>

            {/* Rotation */}
            <div>
              <div className="flex justify-between text-xs font-bold text-maroon-900 mb-1">
                <span>
                  <Icon.rotate /> Rotation
                </span>
                <span>{rotation}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-maroon-900 cursor-pointer"
              />
            </div>

            {/* Zoom */}
            <div>
              <div className="flex justify-between text-xs font-bold text-maroon-900 mb-1">
                <span>
                  <Icon.expand /> Zoom
                </span>
                <span>{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-maroon-900 cursor-pointer"
              />
            </div>

            {/* Preset filters */}
            <div>
              <p className="text-xs font-bold text-maroon-900 mb-2">
                Quick Presets
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Normal', b: 100, c: 100 },
                  { label: 'Warm Glow', b: 110, c: 115 },
                  { label: 'Silk Sheen', b: 105, c: 125 },
                  { label: 'Gold Tint', b: 95, c: 120 },
                  { label: 'Vintage', b: 85, c: 90 },
                ].map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setBrightness(p.b);
                      setContrast(p.c);
                    }}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-maroon-50 hover:bg-maroon-100 text-maroon-900 transition-colors border border-gold-100 cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset & Done */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setBrightness(100);
                  setContrast(100);
                  setRotation(0);
                  setZoom(1);
                }}
                className="py-2.5 rounded-xl border-2 border-gold-200 text-maroon-900 text-xs font-bold hover:bg-gold-50 transition-colors cursor-pointer"
              >
                Reset All
              </button>
              <button
                onClick={onClose}
                className="py-2.5 rounded-xl bg-maroon-900 text-gold-100 text-xs font-bold hover:bg-maroon-800 transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1"
              >
                <Icon.check /> Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
