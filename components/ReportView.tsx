import React from 'react';
import { InspectionRecord, CheckStatus, DefectSeverity } from '../types';

interface ReportViewProps {
  inspection: InspectionRecord;
  onClose: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ inspection, onClose }) => {
  
  const handlePrint = () => {
    window.print();
  };

  const passCount = Object.values(inspection.results).filter(s => s === CheckStatus.PASS).length;
  const failCount = Object.values(inspection.results).filter(s => s === CheckStatus.FAIL).length;

  const hasItemImages = inspection.itemImages && Object.keys(inspection.itemImages).length > 0;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto flex flex-col print:static print:overflow-visible print:h-auto print:block">
      {/* Toolbar - Hidden when printing */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md no-print sticky top-0 print:hidden">
        <h2 className="text-lg font-bold">Inspection Report</h2>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 font-medium transition-colors"
          >
            Print / Save PDF
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Printable Content */}
      <div className="p-8 max-w-4xl mx-auto w-full print:p-0">
        
        {/* Header */}
        <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
              {inspection.type}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Compliance Report</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Inspection ID</div>
            <div className="font-mono text-lg font-bold">{inspection.id.slice(0, 8)}</div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            <h3 className="text-slate-400 uppercase tracking-wider font-bold text-xs mb-2">Vehicle Details</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-500">Registration</td>
                  <td className="py-2 font-bold text-right">{inspection.vehicle.registration}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-500">Odometer</td>
                  <td className="py-2 font-bold text-right">{inspection.vehicle.odometer} km</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-500">Make/Model</td>
                  <td className="py-2 font-bold text-right">{inspection.vehicle.makeModel}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-slate-400 uppercase tracking-wider font-bold text-xs mb-2">Inspection Details</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-500">Inspector</td>
                  <td className="py-2 font-bold text-right">{inspection.inspectorName}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-500">Date</td>
                  <td className="py-2 font-bold text-right">{new Date(inspection.completedAt).toLocaleDateString()}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-500">Time</td>
                  <td className="py-2 font-bold text-right">{new Date(inspection.completedAt).toLocaleTimeString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-500">Result</td>
                  <td className={`py-2 font-bold text-right ${failCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {failCount > 0 ? 'FAIL' : 'PASS'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Defects Section - Only show if defects exist */}
        {inspection.defects.length > 0 ? (
          <div className="mb-8">
            <h3 className="text-red-600 uppercase tracking-wider font-bold text-xs mb-4 border-b border-red-100 pb-2">
              Reported Defects ({inspection.defects.length})
            </h3>
            <div className="space-y-4">
              {inspection.defects.map((defect) => (
                <div key={defect.id} className="bg-red-50 border border-red-100 p-4 rounded-lg break-inside-avoid">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-red-900">{defect.checkItemName}</div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                      ${defect.severity === DefectSeverity.DANGEROUS ? 'bg-red-600 text-white' : 
                        defect.severity === DefectSeverity.MAJOR ? 'bg-orange-500 text-white' : 
                        'bg-yellow-400 text-yellow-900'}`}>
                      {defect.severity}
                    </span>
                  </div>
                  <p className="text-red-800 text-sm mb-2">{defect.description}</p>
                  
                  {/* Defect Photos */}
                  {defect.photos && defect.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-2 mt-2">
                      {defect.photos.map((photo, i) => (
                        <div key={i} className="aspect-square bg-slate-200 rounded overflow-hidden border border-slate-300">
                           <img src={photo} alt={`Defect ${i+1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {defect.aiAnalysis && (
                    <div className="mt-2 text-xs text-red-700 bg-red-100 p-2 rounded">
                      <strong>AI Analysis:</strong> {defect.aiAnalysis}
                    </div>
                  )}
                  {defect.notes && <p className="text-xs text-slate-500 mt-2">Notes: {defect.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        ) : (
           <div className="mb-8 bg-green-50 border border-green-100 p-4 rounded-lg text-green-800 text-center font-medium">
             No defects found. Vehicle is roadworthy.
           </div>
        )}

        {/* General Evidence Photos Section */}
        {hasItemImages && (
          <div className="mb-8 break-before-page">
            <h3 className="text-slate-500 uppercase tracking-wider font-bold text-xs mb-4 border-b border-slate-200 pb-2">
              General Inspection Evidence
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(inspection.itemImages).map(([itemId, photos]) => {
                return photos.map((photo, index) => (
                  <div key={`${itemId}-${index}`} className="break-inside-avoid">
                     <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 mb-1">
                        <img src={photo} alt="Evidence" className="w-full h-full object-cover" />
                     </div>
                     <div className="text-[10px] text-slate-500 font-mono text-center truncate">
                        Item ID: {itemId}
                     </div>
                  </div>
                ));
              })}
            </div>
          </div>
        )}

        {/* Declaration & Signature */}
        <div className="mt-12 break-inside-avoid">
          <div className="text-xs text-slate-500 mb-6 text-justify">
            I hereby declare that I have checked the items listed above and the vehicle is in the condition described. 
            I have been instructed in the safe operation of this vehicle.
          </div>
          
          <div className="flex justify-between items-end">
             <div>
               <div className="h-16 mb-2">
                 <img src={inspection.signatureUrl} alt="Signature" className="h-full object-contain" />
               </div>
               <div className="border-t border-slate-300 w-64 pt-1">
                  <p className="text-xs font-bold uppercase text-slate-400">Driver Signature</p>
               </div>
             </div>

             <div className="text-right">
                <div className="h-16 mb-2 flex items-end justify-end">
                   <span className="text-2xl font-bold text-slate-200">HGV COMPLIANCE</span>
                </div>
                <div className="border-t border-slate-300 w-48 pt-1">
                   <p className="text-xs font-bold uppercase text-slate-400">System Generated</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};