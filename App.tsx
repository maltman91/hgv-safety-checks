import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  History, 
  Settings, 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  Camera, 
  ChevronRight, 
  FileText,
  Search,
  PenTool,
  BrainCircuit,
  X,
  Trash2,
  Image as ImageIcon,
  User,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { InspectionType, CheckStatus, DefectSeverity, CheckItem, InspectionRecord, Defect, VehicleDetails } from './types';
import { DAILY_CHECKLIST, SIX_WEEKLY_CHECKLIST } from './constants';
import { analyzeDefect } from './services/geminiService';
import { SignaturePad } from './components/SignaturePad';
import { ReportView } from './components/ReportView';

// --- Utility Functions ---

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality JPEG
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

// --- Helper Components ---

const Header = ({ title, subtitle, onBack }: { title: string, subtitle?: string, onBack?: () => void }) => (
  <header className="bg-slate-900 text-white p-6 pb-12 rounded-b-3xl shadow-lg mb-[-1.5rem] relative z-10 transition-all">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-200" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
        </div>
      </div>
      {!onBack && (
        <div className="bg-slate-800 p-2 rounded-full">
          <Truck className="w-6 h-6 text-blue-400" />
        </div>
      )}
    </div>
  </header>
);

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-4 ${className}`}>
    {children}
  </div>
);

// --- Main App Logic ---

export default function App() {
  const [view, setView] = useState<'dashboard' | 'new-inspection' | 'report' | 'settings'>('dashboard');
  const [inspectionHistory, setInspectionHistory] = useState<InspectionRecord[]>([]);
  const [activeReport, setActiveReport] = useState<InspectionRecord | null>(null);
  const [inspectorName, setInspectorName] = useState<string>('Driver');
  const [initialInspectionType, setInitialInspectionType] = useState<InspectionType>(InspectionType.DAILY);

  // Load data from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('hgv_inspections');
    if (savedHistory) {
      try {
        setInspectionHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    const savedName = localStorage.getItem('hgv_inspector_name');
    if (savedName) {
      setInspectorName(savedName);
    }
  }, []);

  const handleSaveInspection = (record: InspectionRecord) => {
    const updated = [record, ...inspectionHistory];
    setInspectionHistory(updated);
    localStorage.setItem('hgv_inspections', JSON.stringify(updated));
    setView('dashboard');
  };

  const handleViewReport = (record: InspectionRecord) => {
    setActiveReport(record);
    setView('report');
  };

  const handleUpdateSettings = (name: string) => {
    setInspectorName(name);
    localStorage.setItem('hgv_inspector_name', name);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all inspection history?')) {
      setInspectionHistory([]);
      localStorage.removeItem('hgv_inspections');
    }
  };

  const handleStartNew = (type: InspectionType = InspectionType.DAILY) => {
    setInitialInspectionType(type);
    setView('new-inspection');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {view === 'dashboard' && (
        <Dashboard 
          history={inspectionHistory} 
          onStartNew={handleStartNew}
          onViewReport={handleViewReport}
        />
      )}
      
      {view === 'new-inspection' && (
        <InspectionWizard 
          inspectorName={inspectorName}
          initialType={initialInspectionType}
          onCancel={() => setView('dashboard')}
          onComplete={handleSaveInspection}
        />
      )}

      {view === 'report' && activeReport && (
        <ReportView 
          inspection={activeReport} 
          onClose={() => {
            setActiveReport(null);
            setView('dashboard');
          }} 
        />
      )}

      {view === 'settings' && (
        <SettingsView 
          inspectorName={inspectorName}
          onUpdateInspectorName={handleUpdateSettings}
          onClearHistory={clearHistory}
        />
      )}

      {/* Mobile Bottom Nav (visible on dashboard and settings) */}
      {(view === 'dashboard' || view === 'settings') && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <History className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">History</span>
          </button>
          
          <button 
            onClick={() => handleStartNew(InspectionType.DAILY)}
            className="flex items-center justify-center bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg shadow-blue-200 -mt-8 border-4 border-slate-50 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus className="w-8 h-8" />
          </button>

          <button 
            onClick={() => setView('settings')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'settings' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Settings</span>
          </button>
        </div>
      )}
    </div>
  );
}

// --- Dashboard Component ---

const Dashboard = ({ 
  history, 
  onStartNew,
  onViewReport 
}: { 
  history: InspectionRecord[], 
  onStartNew: (type: InspectionType) => void,
  onViewReport: (r: InspectionRecord) => void
}) => {
  return (
    <>
      <Header title="HGV Safety Checks" subtitle="Compliance Dashboard" />
      
      <main className="px-4 pt-4 space-y-6">
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="flex flex-col items-center justify-center py-6 gap-3 active:scale-95 transition-transform relative cursor-pointer hover:bg-slate-50" >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
               <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-900">Daily Check</div>
              <div className="text-xs text-slate-500">Walkaround</div>
            </div>
            <button onClick={() => onStartNew(InspectionType.DAILY)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">Start</button>
          </Card>

          <Card className="flex flex-col items-center justify-center py-6 gap-3 active:scale-95 transition-transform relative cursor-pointer hover:bg-slate-50">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
               <FileText className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-900">PMI Check</div>
              <div className="text-xs text-slate-500">6-Weekly</div>
            </div>
             <button onClick={() => onStartNew(InspectionType.SIX_WEEKLY)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">Start</button>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="pb-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Recent Inspections</h2>
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
              <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No inspections found.</p>
              <button onClick={() => onStartNew(InspectionType.DAILY)} className="text-blue-600 font-bold mt-2 text-sm hover:text-blue-700">Start your first check</button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <div 
                  key={record.id} 
                  onClick={() => onViewReport(record)}
                  className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center active:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-12 rounded-full ${record.defects.length > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <div>
                      <div className="font-bold text-slate-900">{record.vehicle.registration}</div>
                      <div className="text-xs text-slate-500">{record.type} • {new Date(record.completedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${record.defects.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {record.defects.length > 0 ? `${record.defects.length} Defects` : 'PASS'}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 inline-block mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

// --- Settings View ---

const SettingsView = ({ 
  inspectorName, 
  onUpdateInspectorName, 
  onClearHistory,
}: { 
  inspectorName: string, 
  onUpdateInspectorName: (name: string) => void,
  onClearHistory: () => void,
}) => {
  const [name, setName] = useState(inspectorName);

  const handleSave = () => {
    onUpdateInspectorName(name);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header title="Settings" />
      
      <main className="px-4 pt-4 space-y-6 max-w-lg mx-auto">
        
        {/* Profile Section */}
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Inspector Profile</h2>
          <Card>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleSave}
                  className="w-full p-2 border border-slate-200 rounded text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter your name"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400">This name will appear on all inspection reports generated from this device.</p>
          </Card>
        </section>

        {/* Data Management */}
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Data Management</h2>
          <Card className="space-y-4">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3 text-red-600">
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Clear History</span>
              </div>
              <button 
                onClick={onClearHistory}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
              >
                Clear
              </button>
            </div>
            <hr className="border-slate-100" />
            <div className="p-2 text-xs text-slate-400 text-center">
              App Version 1.0.3 • Compliance Mate
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

// --- Inspection Wizard ---

const InspectionWizard = ({ 
  inspectorName,
  initialType,
  onCancel, 
  onComplete 
}: { 
  inspectorName: string,
  initialType: InspectionType,
  onCancel: () => void, 
  onComplete: (r: InspectionRecord) => void 
}) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<InspectionType>(initialType);
  const [vehicle, setVehicle] = useState<VehicleDetails>({ registration: '', odometer: '', makeModel: '' });
  const [results, setResults] = useState<Record<string, CheckStatus>>({});
  const [itemImages, setItemImages] = useState<Record<string, string[]>>({});
  const [defects, setDefects] = useState<Defect[]>([]);
  const [signature, setSignature] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo capture state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoItemId, setActivePhotoItemId] = useState<string | null>(null);

  // Current defect being added
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [currentDefectItem, setCurrentDefectItem] = useState<CheckItem | null>(null);

  const checklist = type === InspectionType.DAILY ? DAILY_CHECKLIST : SIX_WEEKLY_CHECKLIST;
  
  // Group checklist by category
  const categories = Array.from(new Set(checklist.map(i => i.category)));

  const handleStatusChange = (itemId: string, status: CheckStatus) => {
    setResults(prev => ({ ...prev, [itemId]: status }));
    if (status === CheckStatus.FAIL) {
      const item = checklist.find(i => i.id === itemId);
      if (item) {
        setCurrentDefectItem(item);
        setShowDefectModal(true);
      }
    } else {
      // Remove defect if switched back to PASS
      setDefects(prev => prev.filter(d => d.checkItemId !== itemId));
    }
  };

  const handleAddDefect = (defect: Defect) => {
    setDefects(prev => [...prev.filter(d => d.checkItemId !== defect.checkItemId), defect]);
    setShowDefectModal(false);
    setCurrentDefectItem(null);
  };

  const handlePhotoClick = (itemId: string) => {
    setActivePhotoItemId(itemId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activePhotoItemId) {
      try {
        const compressed = await compressImage(file);
        setItemImages(prev => ({
          ...prev,
          [activePhotoItemId]: [...(prev[activePhotoItemId] || []), compressed]
        }));
      } catch (err) {
        console.error("Image processing failed", err);
      }
    }
    // Reset
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActivePhotoItemId(null);
  };

  const handleRemoveImage = (itemId: string, index: number) => {
    setItemImages(prev => ({
      ...prev,
      [itemId]: prev[itemId].filter((_, i) => i !== index)
    }));
  };

  const calculateProgress = () => {
    const total = checklist.length;
    const completed = Object.keys(results).length;
    return Math.round((completed / total) * 100);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const record: InspectionRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type,
      vehicle,
      inspectorName: inspectorName || 'Unknown Inspector',
      results,
      itemImages,
      defects,
      signatureUrl: signature,
      completedAt: Date.now()
    };
    
    onComplete(record);
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-20">
          <button onClick={onCancel} className="text-slate-500 font-medium">Cancel</button>
          <h2 className="font-bold text-slate-900">New Inspection</h2>
          <div className="w-12"></div>
        </div>
        
        <div className="p-6 space-y-6 max-w-lg mx-auto w-full">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Inspection Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setType(InspectionType.DAILY)}
                className={`p-4 rounded-lg border-2 text-center transition-all ${type === InspectionType.DAILY ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}
              >
                <div className="font-bold">Daily Check</div>
              </button>
              <button 
                onClick={() => setType(InspectionType.SIX_WEEKLY)}
                className={`p-4 rounded-lg border-2 text-center transition-all ${type === InspectionType.SIX_WEEKLY ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}
              >
                <div className="font-bold">6-Weekly PMI</div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vehicle Registration</label>
               <input 
                 type="text" 
                 value={vehicle.registration}
                 onChange={e => setVehicle(v => ({...v, registration: e.target.value.toUpperCase()}))}
                 className="w-full p-3 border border-slate-300 rounded-lg text-lg font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="AB12 CDE"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Odometer (km)</label>
               <input 
                 type="number" 
                 value={vehicle.odometer}
                 onChange={e => setVehicle(v => ({...v, odometer: e.target.value}))}
                 className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="120050"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Make / Model</label>
               <input 
                 type="text" 
                 value={vehicle.makeModel}
                 onChange={e => setVehicle(v => ({...v, makeModel: e.target.value}))}
                 className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="Scania R450"
               />
             </div>
          </div>

          <button 
            disabled={!vehicle.registration}
            onClick={() => setStep(2)}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none hover:bg-blue-700 transition-colors"
          >
            Start Checks
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        {/* Hidden File Input for Item Photos */}
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sticky top-0 z-30 shadow-md">
           <div className="flex justify-between items-center mb-2">
             <div className="font-bold">{vehicle.registration}</div>
             <div className="text-xs bg-slate-700 px-2 py-1 rounded">{type}</div>
           </div>
           <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
             <div 
               className="h-full bg-green-500 transition-all duration-300"
               style={{ width: `${calculateProgress()}%` }}
             />
           </div>
        </div>

        <div className="p-4 space-y-6 max-w-2xl mx-auto">
          {categories.map(cat => (
            <div key={cat} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm uppercase tracking-wider">
                {cat}
              </div>
              <div className="divide-y divide-slate-100">
                {checklist.filter(i => i.category === cat).map(item => {
                  const hasPhotos = itemImages[item.id]?.length > 0;
                  return (
                   <div key={item.id} className="p-4">
                     <div className="flex items-center justify-between">
                       <div className="flex-1 pr-4">
                         <div className="font-medium text-slate-900">{item.label}</div>
                         {results[item.id] === CheckStatus.FAIL && (
                           <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                             <AlertTriangle className="w-3 h-3" /> Defect Recorded
                           </div>
                         )}
                         {hasPhotos && (
                           <div className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                             <ImageIcon className="w-3 h-3" /> {itemImages[item.id].length} Photos attached
                           </div>
                         )}
                       </div>
                       <div className="flex gap-2 items-center">
                          <button 
                            onClick={() => handlePhotoClick(item.id)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${hasPhotos ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                          >
                             <Camera className="w-5 h-5" />
                          </button>
                          <div className="w-px h-6 bg-slate-200 mx-1"></div>
                          <StatusButton 
                            status={CheckStatus.PASS} 
                            active={results[item.id] === CheckStatus.PASS} 
                            onClick={() => handleStatusChange(item.id, CheckStatus.PASS)} 
                          />
                          <StatusButton 
                            status={CheckStatus.FAIL} 
                            active={results[item.id] === CheckStatus.FAIL} 
                            onClick={() => handleStatusChange(item.id, CheckStatus.FAIL)} 
                          />
                       </div>
                     </div>
                     
                     {/* Mini Gallery for Item */}
                     {hasPhotos && (
                       <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                         {itemImages[item.id].map((src, idx) => (
                           <div key={idx} className="relative flex-shrink-0 w-16 h-16 rounded overflow-hidden group">
                             <img src={src} alt="evidence" className="w-full h-full object-cover" />
                             <button 
                               onClick={() => handleRemoveImage(item.id, idx)}
                               className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                );
              })}
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-30">
          <button 
            disabled={calculateProgress() < 100}
            onClick={() => setStep(3)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Review & Sign
          </button>
        </div>

        {showDefectModal && currentDefectItem && (
          <DefectModal 
            item={currentDefectItem} 
            onSave={handleAddDefect} 
            onCancel={() => {
              setShowDefectModal(false);
              // Reset to PASS if cancelled? Or stay unchecked? Let's reset to unchecked to force decision
              if (!defects.find(d => d.checkItemId === currentDefectItem.id)) {
                 const newResults = {...results};
                 delete newResults[currentDefectItem.id];
                 setResults(newResults);
              }
            }}
          />
        )}
      </div>
    );
  }

  if (step === 3) {
    const hasDefects = defects.length > 0;
    
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
         <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-20">
           <h2 className="font-bold text-slate-900 text-center">Summary & Sign Off</h2>
         </div>

         <div className="p-6 flex-1 max-w-lg mx-auto w-full space-y-6">
           <Card className={hasDefects ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}>
              <h3 className="font-bold text-lg mb-2">
                {hasDefects ? 'Defects Found' : 'Vehicle Roadworthy'}
              </h3>
              <p className="text-slate-500 text-sm">
                {hasDefects 
                  ? `There are ${defects.length} recorded defects. Please ensure major/dangerous defects are rectified before use.` 
                  : 'No defects were recorded during this inspection.'}
              </p>
           </Card>

           {hasDefects && (
             <div className="space-y-3">
               {defects.map(d => (
                 <div key={d.id} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm text-sm">
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>{d.checkItemName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        d.severity === DefectSeverity.DANGEROUS ? 'bg-red-600 text-white' : 
                        d.severity === DefectSeverity.MAJOR ? 'bg-orange-500 text-white' : 'bg-yellow-300 text-yellow-900'
                      }`}>{d.severity}</span>
                    </div>
                    <div className="text-slate-600">{d.description}</div>
                    {d.photos.length > 0 && (
                      <div className="flex gap-2 mt-2 overflow-x-auto">
                        {d.photos.map((p, i) => (
                          <img key={i} src={p} className="w-12 h-12 object-cover rounded border border-slate-200" alt="defect" />
                        ))}
                      </div>
                    )}
                    {d.aiAnalysis && <div className="mt-2 text-xs bg-slate-100 p-2 rounded text-slate-500 italic">AI: {d.aiAnalysis}</div>}
                 </div>
               ))}
             </div>
           )}

           <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">Driver Signature</label>
             <p className="text-xs text-slate-400 mb-2">
               I, <span className="font-bold text-slate-600">{inspectorName}</span>, certify that I have performed the checks recorded above.
             </p>
             <SignaturePad onSave={setSignature} onClear={() => setSignature('')} />
           </div>

           <div className="h-8"></div>
         </div>

         <div className="p-4 bg-white border-t border-slate-200">
            <button 
              disabled={!signature || isSubmitting}
              onClick={handleSubmit}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-100 disabled:opacity-50 hover:bg-green-700 transition-colors flex justify-center items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Inspection'}
              {!isSubmitting && <CheckCircle className="w-5 h-5" />}
            </button>
         </div>
      </div>
    );
  }

  return null;
};

// --- Sub Components ---

const StatusButton = ({ status, active, onClick }: { status: CheckStatus, active: boolean, onClick: () => void }) => {
  const isPass = status === CheckStatus.PASS;
  const baseClasses = "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all border-2";
  
  if (active) {
    return (
      <button onClick={onClick} className={`${baseClasses} ${isPass ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white'} shadow-md scale-105`}>
        {isPass ? '✓' : '✕'}
      </button>
    );
  }
  
  return (
    <button onClick={onClick} className={`${baseClasses} border-slate-200 text-slate-300 hover:border-slate-300 hover:text-slate-400`}>
       {isPass ? '✓' : '✕'}
    </button>
  );
};

const DefectModal = ({ item, onSave, onCancel }: { item: CheckItem, onSave: (d: Defect) => void, onCancel: () => void }) => {
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState<DefectSeverity>(DefectSeverity.MINOR);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleAIAnalysis = async () => {
    if (!desc) return;
    setAnalyzing(true);
    const result = await analyzeDefect(desc, item.label);
    setSeverity(result.severity);
    setAiAdvice(result.advice);
    setAnalyzing(false);
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setPhotos(prev => [...prev, compressed]);
      } catch (err) {
        console.error("Failed to process image", err);
      }
    }
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-200 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
             <AlertTriangle className="w-5 h-5" />
             Report Defect
           </h3>
           <button onClick={onCancel} className="bg-slate-100 p-2 rounded-full text-slate-500">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="mb-4">
          <div className="text-xs font-bold text-slate-400 uppercase mb-1">Item</div>
          <div className="font-medium text-slate-900">{item.label}</div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
          <textarea 
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-red-500 outline-none resize-none text-sm"
            placeholder="e.g. Lens cracked, Air leaking..."
          />
          <button 
            type="button"
            onClick={handleAIAnalysis}
            disabled={!desc || analyzing}
            className="mt-2 text-xs flex items-center gap-1 text-purple-600 font-bold hover:text-purple-800 disabled:opacity-50"
          >
            <BrainCircuit className="w-3 h-3" />
            {analyzing ? 'Analyzing...' : 'Analyze with AI'}
          </button>
          
          {aiAdvice && (
             <div className="mt-2 bg-purple-50 text-purple-900 text-xs p-2 rounded border border-purple-100">
               <strong>AI Suggestion:</strong> {aiAdvice}
             </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Evidence Photos</label>
          <input 
             type="file" 
             ref={photoInputRef}
             accept="image/*"
             capture="environment"
             className="hidden"
             onChange={handlePhotoCapture}
          />
          <div className="flex flex-wrap gap-2">
             {photos.map((p, i) => (
               <div key={i} className="relative w-20 h-20 rounded overflow-hidden group">
                 <img src={p} alt="Defect" className="w-full h-full object-cover" />
                 <button 
                   onClick={() => removePhoto(i)}
                   className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <Trash2 className="w-5 h-5" />
                 </button>
               </div>
             ))}
             <button 
               onClick={() => photoInputRef.current?.click()}
               className="w-20 h-20 rounded border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-colors"
             >
               <Camera className="w-6 h-6 mb-1" />
               <span className="text-[10px] font-bold uppercase">Add</span>
             </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Severity</label>
          <div className="grid grid-cols-3 gap-2">
             {[DefectSeverity.MINOR, DefectSeverity.MAJOR, DefectSeverity.DANGEROUS].map((sev) => (
               <button 
                 key={sev}
                 onClick={() => setSeverity(sev)}
                 className={`p-2 rounded text-xs font-bold border-2 transition-all ${
                   severity === sev 
                   ? (sev === DefectSeverity.DANGEROUS ? 'bg-red-600 border-red-600 text-white' : sev === DefectSeverity.MAJOR ? 'bg-orange-500 border-orange-500 text-white' : 'bg-yellow-400 border-yellow-400 text-yellow-900')
                   : 'border-slate-200 text-slate-500 hover:border-slate-300'
                 }`}
               >
                 {sev}
               </button>
             ))}
          </div>
        </div>

        <button 
          disabled={!desc}
          onClick={() => onSave({
            id: crypto.randomUUID(),
            checkItemId: item.id,
            checkItemName: item.label,
            description: desc,
            severity,
            notes: '',
            photos: photos,
            aiAnalysis: aiAdvice
          })}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
        >
          Save Defect
        </button>
      </div>
    </div>
  );
};