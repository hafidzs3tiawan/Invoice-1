import { useWizardStore } from '@/store/wizardStore';
import { useState, useEffect, useRef } from 'react';
import apiClient from '@/lib/axios';

export default function Step2Barang() {
  const { items, addItem, setStep } = useWizardStore();
  
  const handleAddNewRow = () => {
    addItem({
      _localId: crypto.randomUUID(),
      itemId: null,
      code: '',
      name: '',
      quantity: 1,
      price: 0
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Items List</h3>
          <p className="text-sm text-gray-500 mt-1">Search item codes to automatically fetch their prices.</p>
        </div>
        <button type="button" onClick={handleAddNewRow} className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-lg hover:bg-blue-100 transition font-medium text-sm border border-blue-200 shadow-sm">
          + Add New Item
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden shrink-0 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Code (Search)</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">Qty</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <ItemRow key={item._localId} item={item} />
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="text-gray-400 mb-2">No items added yet.</div>
                  <button onClick={handleAddNewRow} className="text-blue-600 text-sm font-medium hover:underline">Click here to add your first item.</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between pt-6 border-t mt-8">
        <button type="button" onClick={() => setStep(1)} className="bg-white text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 border border-gray-300 transition shadow-sm font-medium">
          &larr; Back to Client Info
        </button>
        <button 
          type="button" 
          onClick={() => setStep(3)} 
          disabled={items.length === 0 || items.some(i => !i.itemId)} 
          className="bg-blue-600 text-white px-8 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition shadow hover:shadow-lg font-medium"
        >
          Review & Submit Invoice &rarr;
        </button>
      </div>
    </div>
  );
}

function ItemRow({ item }: { item: any }) {
  const { updateItem, removeItem } = useWizardStore();
  const [localCode, setLocalCode] = useState(item.code);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!localCode.trim()) return;
      if (localCode === item.code) return; // already fetched, anti cycle

      // Anti-Race Condition Block
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      setLoading(true);

      try {
        const res = await apiClient.get(`/items?code=${localCode}`, {
          signal: abortControllerRef.current.signal
        });
        
        const data = res.data;
        if (data && data.length > 0) {
          const matched = data[0]; 
          updateItem(item._localId, {
            itemId: matched.id,
            code: matched.code, // keep case formatting if desired
            name: matched.name,
            price: matched.price
          });
        } else {
           updateItem(item._localId, { itemId: null, code: localCode, name: 'Not Found', price: 0 });
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError') {
           updateItem(item._localId, { itemId: null, code: localCode, name: 'Error', price: 0 });
        }
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce condition

    return () => clearTimeout(handler);
  }, [localCode]);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 relative">
        <input 
          type="text" 
          value={localCode} 
          onChange={(e) => setLocalCode(e.target.value)} 
          placeholder="e.g. BRG-001" 
          className="w-full border-gray-300 border p-2.5 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 shadow-sm" 
        />
      </td>
      <td className="px-6 py-4 text-sm text-gray-800 font-medium">
        {loading ? <span className="animate-pulse text-blue-500 bg-blue-50 px-2 py-1 rounded">Searching backend...</span> : (item.name || <span className="text-gray-400 italic">Waiting for input</span>)}
      </td>
      <td className="px-6 py-4">
        <input 
          type="number" min="1" 
          value={item.quantity} 
          onChange={(e) => updateItem(item._localId, { quantity: parseInt(e.target.value) || 1 })} 
          className="border-gray-300 border p-2.5 rounded-md w-full text-sm focus:ring-blue-500 focus:border-blue-500 shadow-sm text-center" 
        />
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 font-mono bg-gray-50">
        Rp {item.price.toLocaleString('id-ID')}
      </td>
      <td className="px-6 py-4 text-right">
        <button 
          title="Remove Item"
          type="button" 
          onClick={() => removeItem(item._localId)} 
          className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </td>
    </tr>
  );
}
