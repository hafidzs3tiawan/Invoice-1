import { useWizardStore } from '@/store/wizardStore';

export default function Step1Klien() {
  const { clientData, setClientData, setStep } = useWizardStore();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  return (
    <form onSubmit={handleNext} className="space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 flex items-center">
            <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
            Sender Information
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
            <input
              type="text" required
              value={clientData.senderName}
              onChange={(e) => setClientData({ senderName: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border transition-colors"
              placeholder="e.g. PT Maju Bersama"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Address</label>
            <textarea
              required rows={3}
              value={clientData.senderAddress}
              onChange={(e) => setClientData({ senderAddress: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border transition-colors"
              placeholder="Full address of the sender..."
            />
          </div>
        </div>

        <div className="space-y-5 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 flex items-center">
            <span className="bg-green-100 text-green-800 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
            Receiver Information
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Name</label>
            <input
              type="text" required
              value={clientData.receiverName}
              onChange={(e) => setClientData({ receiverName: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border transition-colors"
              placeholder="e.g. CV Makmur Jaya"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Address</label>
            <textarea
              required rows={3}
              value={clientData.receiverAddress}
              onChange={(e) => setClientData({ receiverAddress: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border transition-colors"
              placeholder="Full destination address..."
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow hover:bg-blue-700 hover:shadow-lg transition-all font-medium">
          Continue to Items &rarr;
        </button>
      </div>
    </form>
  );
}
