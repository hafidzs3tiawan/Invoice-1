import { useWizardStore } from '@/store/wizardStore';
import { useState } from 'react';
import apiClient from '@/lib/axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export default function Step3Review() {
  const { clientData, items, setStep, resetForm } = useWizardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const token = Cookies.get('token');
      if (!token) throw new Error("Not logged in");
      
      const decoded: any = jwtDecode(token);
      const userRole = decoded.role; // 'Admin' or 'Kerani'

      // Transform payload: Role-Based Payload Verification
      const grandTotalLocal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      
      let payloadDetails = items.map(item => ({
        item_id: item.itemId,
        quantity: item.quantity,
        // Admin sends full object (price and total/subtotal)
        ...(userRole === 'Admin' ? { price: item.price, subtotal: item.price * item.quantity } : {}) 
      }));

      const payload: any = {
        sender_name: clientData.senderName,
        sender_address: clientData.senderAddress,
        receiver_name: clientData.receiverName,
        receiver_address: clientData.receiverAddress,
        // Admin sends full object total
        ...(userRole === 'Admin' ? { total_amount: grandTotalLocal } : {}),
        details: payloadDetails
      };

      const res = await apiClient.post('/invoices', payload);
      setSuccessData(res.data.data);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to submit invoice');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
     return (
        <div className="text-center py-12 animate-in slide-in-from-bottom duration-500 bg-white p-10 rounded-2xl border border-green-100 shadow-xl max-w-2xl mx-auto">
           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
           </div>
           <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Invoice Created Successfully!</h2>
           <p className="text-gray-500 mb-8 font-medium">Verified by Zero-Trust Backend. Invoice Number: <span className="text-green-600 font-mono font-bold bg-green-50 px-2 py-1 rounded">{successData.invoice_number}</span></p>
           
           <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-left mb-8 space-y-3 shadow-inner">
               <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Amount Before Tax (Backend Override):</span> <span className="font-mono font-bold text-gray-900">Rp {Number(successData.total_amount).toLocaleString('id-ID')}</span></div>
               <div className="flex justify-between"><span className="text-gray-500">Created By User ID:</span> <span className="font-mono text-gray-900">{successData.created_by}</span></div>
           </div>

           <div className="flex justify-center space-x-4">
               <button onClick={() => window.print()} className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow hover:bg-black transition-colors font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Print Invoice
               </button>
               <button onClick={() => setSuccessData(null)} className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-semibold">Start New Invoice</button>
           </div>
        </div>
     )
  }

  const grandTotalLocal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
      <div className="flex justify-between items-center border-b pb-4">
         <h3 className="text-2xl font-bold text-gray-900">Review Invoice</h3>
         <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">Draft</span>
      </div>
      
      <div className="grid grid-cols-2 gap-8 text-sm mt-6">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h4 className="font-bold text-gray-400 uppercase tracking-wide text-xs mb-3">Sender Details</h4>
          <p className="text-gray-900 font-semibold text-lg">{clientData.senderName}</p>
          <p className="text-gray-600 mt-1 whitespace-pre-wrap">{clientData.senderAddress}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-right">
          <h4 className="font-bold text-gray-400 uppercase tracking-wide text-xs mb-3">Receiver Details</h4>
          <p className="text-gray-900 font-semibold text-lg">{clientData.receiverName}</p>
          <p className="text-gray-600 mt-1 whitespace-pre-wrap">{clientData.receiverAddress}</p>
        </div>
      </div>

      <div className="mt-8 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-200 uppercase tracking-wider">Item Description</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-200 uppercase tracking-wider">Qty</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-200 uppercase tracking-wider">Local Subtotal</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
             {items.map(item => (
                <tr key={item._localId} className="hover:bg-gray-50 transition-colors">
                   <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {item.name} 
                      <span className="text-xs text-blue-600 block mt-1 font-mono">{item.code}</span>
                   </td>
                   <td className="px-6 py-4 text-sm text-gray-600 text-center font-bold bg-gray-50">{item.quantity}</td>
                   <td className="px-6 py-4 text-sm text-gray-900 text-right font-mono font-medium">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</td>
                </tr>
             ))}
          </tbody>
          <tfoot className="bg-blue-50 font-bold border-t-2 border-blue-200">
             <tr>
                <td colSpan={2} className="px-6 py-5 text-right text-gray-700 uppercase tracking-wider text-xs">Total Local Estimation:</td>
                <td className="px-6 py-5 text-right text-blue-700 font-mono text-lg">Rp {grandTotalLocal.toLocaleString('id-ID')}</td>
             </tr>
          </tfoot>
        </table>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-200 text-sm font-medium animate-bounce mt-4">{error}</div>}

      <div className="flex justify-between pt-6 mt-6 border-t">
        <button type="button" onClick={() => setStep(2)} className="bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 border border-gray-300 transition-all shadow-sm font-semibold flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Items
        </button>
        <button type="button" onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-xl font-bold disabled:opacity-70 disabled:cursor-wait flex items-center justify-center min-w-[240px]">
           {loading ? (
             <>
               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Submitting Securely...
             </>
           ) : 'Submit Invoice via Zero-Trust'}
        </button>
      </div>
    </div>
  );
}
