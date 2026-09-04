import React, { useState, useMemo } from 'react';

// --- Constants & Data ---

const ZIGZAG_ORDER = [
   0,  1,  8, 16,  9,  2,  3, 10,
  17, 24, 32, 25, 18, 11,  4,  5,
  12, 19, 26, 33, 40, 48, 41, 34,
  27, 20, 13,  6,  7, 14, 21, 28,
  35, 42, 49, 56, 57, 50, 43, 36,
  29, 22, 15, 23, 30, 37, 44, 51,
  58, 59, 52, 45, 38, 31, 39, 46,
  53, 60, 61, 54, 47, 55, 62, 63
];

const ROW_ORDER = Array.from({ length: 64 }, (_, i) => i);
const COL_ORDER = Array.from({ length: 64 }, (_, i) => (i % 8) * 8 + Math.floor(i / 8));

// Mock Quantized DCT Blocks
const BLOCKS = [
  {
    id: 1,
    name: "Smooth Gradient (Sky)",
    data: [
      120,  22,   6,   2,   0,   0,   0,   0,
       15,   5,   1,   0,   0,   0,   0,   0,
        5,   1,   0,   0,   0,   0,   0,   0,
        1,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0
    ]
  },
  {
    id: 2,
    name: "High Contrast (Edge)",
    data: [
       65, -30,  15,  -8,   4,  -2,   1,   0,
      -25,  18,  -9,   5,  -2,   1,   0,   0,
       12, -10,   5,  -3,   1,   0,   0,   0,
       -7,   6,  -4,   2,   0,   0,   0,   0,
        3,  -3,   1,   0,   0,   0,   0,   0,
       -1,   1,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0
    ]
  },
  {
    id: 3,
    name: "Flat Color (Wall)",
    data: [
       85,   1,   0,   0,   0,   0,   0,   0,
       -1,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0,
        0,   0,   0,   0,   0,   0,   0,   0
    ]
  }
];

// --- Helper Functions ---

const getStats = (arr) => {
  let zeros = 0;
  let nonZeros = 0;
  let maxZeroRun = 0;
  let currentZeroRun = 0;
  
  arr.forEach(val => {
    if (val === 0) {
      zeros++;
      currentZeroRun++;
      if (currentZeroRun > maxZeroRun) maxZeroRun = currentZeroRun;
    } else {
      nonZeros++;
      currentZeroRun = 0;
    }
  });

  return {
    zeros,
    nonZeros,
    maxZeroRun,
    uniqueValues: new Set(arr).size,
  };
};

const Icons = {
  Grid: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>,
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
};

// --- Main Component ---

export default function App() {
  const [activeBlockId, setActiveBlockId] = useState(1);
  const [scanOrderType, setScanOrderType] = useState('zigzag'); // 'row', 'col', 'zigzag'

  // Derived state
  const activeBlock = useMemo(() => BLOCKS.find(b => b.id === activeBlockId), [activeBlockId]);
  
  const currentOrderIndices = useMemo(() => {
    if (scanOrderType === 'row') return ROW_ORDER;
    if (scanOrderType === 'col') return COL_ORDER;
    return ZIGZAG_ORDER;
  }, [scanOrderType]);

  const ordered1DArray = useMemo(() => {
    return currentOrderIndices.map(index => activeBlock.data[index]);
  }, [currentOrderIndices, activeBlock]);

  const rawStats = useMemo(() => getStats(ordered1DArray), [ordered1DArray]);

  // Generate SVG Path
  const svgPathData = useMemo(() => {
    const points = currentOrderIndices.map(index => {
      const col = index % 8;
      const row = Math.floor(index / 8);
      // In a 0-80 viewBox where each cell is 10x10, center is at col*10+5, row*10+5
      return `${col * 10 + 5},${row * 10 + 5}`;
    }).join(' L ');
    return `M ${points}`;
  }, [currentOrderIndices]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#0a84ff33] py-8 md:py-12">
      <style>{`
        @keyframes drawPath {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        .animate-draw {
          animation: drawPath 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 md:px-6">
        
        {/* Controls Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between bg-[#1c1c1e] p-2 rounded-2xl md:rounded-full border border-[#2c2c2e]">
          
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto p-1">
            {BLOCKS.map(block => (
              <button
                key={block.id}
                onClick={() => setActiveBlockId(block.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeBlockId === block.id 
                    ? 'bg-[#3a3a3c] text-white shadow-md' 
                    : 'bg-transparent text-[#8e8e93] hover:bg-[#2c2c2e]'
                }`}
              >
                {block.name}
              </button>
            ))}
          </div>

          <div className="h-px md:h-8 w-full md:w-px bg-[#2c2c2e] mx-2 hidden md:block" />

          <div className="flex bg-[#000000] rounded-full p-1 w-full md:w-auto border border-[#2c2c2e]">
            {[
              { id: 'row', label: 'Row-Major' },
              { id: 'col', label: 'Col-Major' },
              { id: 'zigzag', label: 'Zig-Zag' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setScanOrderType(type.id)}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  scanOrderType === type.id 
                    ? 'bg-[#2c2c2e] text-[#0a84ff] shadow-sm' 
                    : 'text-[#8e8e93] hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Visualization Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Left: 8x8 Grid */}
          <div className="lg:col-span-5 bg-[#1c1c1e] p-6 md:p-8 rounded-3xl border border-[#2c2c2e] flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[320px] aspect-square bg-[#000000] border border-[#2c2c2e] rounded-xl overflow-hidden">
              {/* Data Grid */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
                {activeBlock.data.map((val, i) => (
                  <div 
                    key={`cell-${i}`} 
                    className={`border-r border-b border-[#2c2c2e] flex items-center justify-center text-[11px] md:text-sm font-medium
                      ${val === 0 ? 'text-[#636366]' : 'text-[#0a84ff] bg-[#0a84ff1a]'}
                      ${i % 8 === 7 ? 'border-r-0' : ''} 
                      ${Math.floor(i / 8) === 7 ? 'border-b-0' : ''}
                    `}
                  >
                    {val}
                  </div>
                ))}
              </div>
              
              {/* Animated Path Overlay */}
              <svg 
                key={`${activeBlockId}-${scanOrderType}`} // Force remount to re-trigger animation
                className="absolute inset-0 w-full h-full pointer-events-none" 
                viewBox="0 0 80 80" 
                preserveAspectRatio="none"
              >
                <path
                  d={svgPathData}
                  fill="none"
                  stroke="#0a84ff"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="100"
                  strokeDasharray="100"
                  className="animate-draw opacity-80"
                />
                
                {/* Highlight start point */}
                <circle cx="5" cy="5" r="1.5" fill="#0a84ff" />
              </svg>
            </div>
          </div>

          {/* Right: Statistics */}
          <div className="lg:col-span-7 flex flex-col justify-center gap-4">
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                icon={<Icons.Grid />} 
                title="Total Zeros" 
                value={rawStats.zeros} 
              />
              <StatCard 
                icon={<Icons.Zap />} 
                title="Max Zero Run" 
                value={rawStats.maxZeroRun} 
                highlight={scanOrderType === 'zigzag'}
              />
              <StatCard 
                icon={<Icons.Activity />} 
                title="Unique Values (Raw)" 
                value={rawStats.uniqueValues} 
              />
              <StatCard 
                icon={<Icons.Grid />} 
                title="Non-Zero Values" 
                value={rawStats.nonZeros} 
              />
            </div>
          </div>
        </div>

        {/* Arrays Section */}
        <div className="space-y-6">
          <ArrayVisualizer 
            title="1D Ordered Sequence" 
            data={ordered1DArray} 
          />
        </div>

      </div>
    </div>
  );
}

// --- Subcomponents ---

function StatCard({ icon, title, value, highlight = false }) {
  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${highlight ? 'bg-[#0a84ff1a] border-[#0a84ff33]' : 'bg-[#1c1c1e] border-[#2c2c2e]'}`}>
      <div className={`flex items-center gap-2 mb-3 ${highlight ? 'text-[#0a84ff]' : 'text-[#8e8e93]'}`}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
      </div>
      <div className={`text-4xl font-semibold tracking-tight ${highlight ? 'text-[#0a84ff]' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function ArrayVisualizer({ title, data }) {
  return (
    <div className="bg-[#1c1c1e] p-6 md:p-8 rounded-3xl border border-[#2c2c2e]">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
          {title}
        </h3>
      </div>
      
      {/* Wrapping Container for multi-line display */}
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {data.map((val, idx) => {
          const isZero = val === 0;
          // An RLE Zero is considered any zero that immediately follows another zero
          const isRleZero = isZero && idx > 0 && data[idx - 1] === 0;
          
          let cellStyle = "flex-shrink-0 flex flex-col items-center justify-center w-[34px] h-[44px] md:w-10 md:h-12 rounded-lg text-xs md:text-sm border transition-all duration-500 ";
          
          if (!isZero) {
            // Non-zero values stand out
            cellStyle += "bg-[#0a84ff1a] border-[#0a84ff33] text-[#0a84ff] font-medium";
          } else if (isRleZero) {
            // RLE'd zeros (subsequent zeros in a run) are faded with dashed borders
            cellStyle += "bg-transparent border-dashed border-[#3a3a3c] text-[#48484a] opacity-60";
          } else {
            // The first zero of a run acts as an anchor
            cellStyle += "bg-[#000000] border-[#2c2c2e] text-[#8e8e93]";
          }

          return (
            <div key={idx} className={cellStyle}>
              <span className="opacity-40 text-[8px] md:text-[9px] mb-0.5">{idx}</span>
              <span>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}