import React, { useState } from 'react';
import { useCreateProperty } from '../../lib/queries';

export const AddPropertyForm: React.FC<{ onAdded: () => void }> = ({ onAdded }) => {
  const createProperty = useCreateProperty();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    cadastralValue: 0,
    buildingValue: 0,
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProperty.mutateAsync(formData);
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save property');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <h3 className="font-bold text-lg mb-4">Add New Investment</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="prop-name" className="block text-xs font-bold text-gray-500 uppercase mb-1">Property Name</label>
          <input id="prop-name" type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md" placeholder="e.g. My First Apartment" />
        </div>
        <div>
          <label htmlFor="prop-address" className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
          <input id="prop-address" type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="prop-price" className="block text-xs font-bold text-gray-500 uppercase mb-1">Purchase Price (€)</label>
          <input id="prop-price" type="number" required value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="prop-date" className="block text-xs font-bold text-gray-500 uppercase mb-1">Purchase Date</label>
          <input id="prop-date" type="date" required value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="prop-cadastral" className="block text-xs font-bold text-gray-500 uppercase mb-1">Cadastral Value (€)</label>
          <input id="prop-cadastral" type="number" value={formData.cadastralValue} onChange={e => setFormData({...formData, cadastralValue: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-md" />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button type="submit" disabled={createProperty.isPending} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {createProperty.isPending ? 'Saving...' : 'Save Property'}
        </button>
      </div>
    </form>
  );
};
