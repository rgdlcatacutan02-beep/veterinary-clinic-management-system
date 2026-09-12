/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { Package, PlusCircle, AlertTriangle, Search, Activity, CornerDownRight, Plus, Minus } from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../../types';

export const InventoryView: React.FC = () => {
  const {
    inventoryItems,
    addInventoryItem,
    updateInventoryItem,
    adjustStock,
    suppliers,
    currentUser
  } = useVeterinary();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Item Fields
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<InventoryCategory>('Medications');
  const [newQty, setNewQty] = useState('10');
  const [newUnit, setNewUnit] = useState('Boxes');
  const [newSupplier, setNewSupplier] = useState('SUP-01');
  const [newCost, setNewCost] = useState('10.0');
  const [newPrice, setNewPrice] = useState('20.0');
  const [newExpiry, setNewExpiry] = useState('2027-12-31');
  const [newMinLevel, setNewMinLevel] = useState('5');

  const filteredItems = inventoryItems.filter(item => {
    if (filterCategory !== 'All' && item.category !== filterCategory) return false;
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newQty || !newCost || !newPrice || !newMinLevel) return;

    addInventoryItem({
      name: newName,
      category: newCat,
      quantity: parseInt(newQty),
      unit: newUnit,
      supplierId: newSupplier,
      purchaseCost: parseFloat(newCost),
      sellingPrice: parseFloat(newPrice),
      expirationDate: newExpiry,
      minStockLevel: parseInt(newMinLevel)
    });

    // Reset
    setNewName('');
    setShowAddForm(false);
  };

  const handleAddStockQuick = (item: InventoryItem) => {
    adjustStock(item.id, 5, "Manual rapid restock inflow");
  };

  const handleSubtractStockQuick = (item: InventoryItem) => {
    adjustStock(item.id, -1, "Manual rapid correction outflow");
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200" id="inventory-view-container">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">Pharmaceutical Stock & Consumables</h2>
          <p className="text-xs text-slate-500">Track medication reserves, vaccines minimum limits, shelf expirations and supplier records.</p>
        </div>
        {currentUser?.role === 'Admin' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/15 cursor-pointer self-start"
            id="register-stock-btn"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Register Stock Supply</span>
          </button>
        )}
      </div>

      {/* Statistics alerts row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-xs font-medium text-amber-950 flex gap-3 items-center">
          <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
          <div>
            <strong>Low stock alarm limits triggered:</strong>
            <p className="text-amber-700/80 mt-0.5">
              {inventoryItems.filter(i => i.quantity <= i.minStockLevel).length} items require prompt PO restocking.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-xs font-medium text-indigo-950 flex gap-3 items-center">
          <Activity className="h-6 w-6 text-indigo-600 flex-shrink-0" />
          <div>
            <strong>Shelf-Life Expirations due soon (2026):</strong>
            <p className="text-indigo-700/80 mt-0.5">
              {inventoryItems.filter(i => {
                const isWithinSixMonths = new Date(i.expirationDate).getTime() - new Date().getTime() < 180 * 24 * 60 * 60 * 1000;
                return isWithinSixMonths;
              }).length} medical items require audit.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-150 p-4 text-xs font-medium text-slate-900 flex gap-3 items-center">
          <Package className="h-6 w-6 text-slate-600 flex-shrink-0" />
          <div>
            <strong>Total Valued Inventory asset:</strong>
            <p className="text-slate-500 font-bold font-mono mt-0.5 text-xs">
              ${inventoryItems.reduce((sum, i) => sum + (i.quantity * i.purchaseCost), 0).toFixed(2)} cost basis
            </p>
          </div>
        </div>
      </div>

      {/* Main filter options and table ledger */}
      <div className="space-y-4">
        <div className="flex gap-2.5 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter item indices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-1">
            {['All', 'Medications', 'Vaccines', 'Medical Supplies', 'Consumables'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3 text-left">Stock Item Name</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Qty Status</th>
                  <th className="px-6 py-3 text-left">Purchase Cost</th>
                  <th className="px-6 py-3 text-left font-bold text-emerald-800">Selling Retail</th>
                  <th className="px-6 py-3 text-left">Expiry</th>
                  {currentUser?.role === 'Admin' && <th className="px-6 py-3 text-right">Interactive adjust</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">No matching inventory matches registered.</td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isLow = item.quantity <= item.minStockLevel;
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/40 transition-colors ${isLow ? 'bg-amber-50/20' : ''}`}>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 block">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Supplier: {suppliers.find(s => s.id === item.supplierId)?.name || 'Default'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded bg-slate-50 border border-slate-100 py-0.5 px-2 text-[10px] text-slate-600 font-semibold uppercase">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          <span className={`font-bold ${isLow ? 'text-rose-600 font-black' : 'text-slate-800'}`}>
                            {item.quantity} {item.unit}
                          </span>
                          {isLow && <span className="text-[9px] uppercase font-bold text-rose-500 bg-rose-50 rounded ml-1 px-1">LOW</span>}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500">${item.purchaseCost}</td>
                        <td className="px-6 py-4 font-mono font-bold text-emerald-700">${item.sellingPrice}</td>
                        <td className="px-6 py-4 font-mono text-slate-500">{item.expirationDate}</td>
                        {currentUser?.role === 'Admin' && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex gap-1.5 justify-end items-center">
                              <button
                                onClick={() => handleSubtractStockQuick(item)}
                                className="p-1 rounded bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 cursor-pointer"
                                title="Dispense 1 Unit"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleAddStockQuick(item)}
                                className="p-1 rounded bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-700 cursor-pointer"
                                title="Restock +5 Units"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE MODAL FORM */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Register New Pharmaceutical Stock Item</h3>
            <form onSubmit={handleCreateItem} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Item Title Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  placeholder="e.g. Surolan Antifungal Drops 15ml"
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as InventoryCategory)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none"
                  >
                    <option value="Medications">Medications</option>
                    <option value="Vaccines">Vaccines</option>
                    <option value="Medical Supplies">Medical Supplies</option>
                    <option value="Consumables">Consumables</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Initial restock Quantity</label>
                  <input
                    type="number"
                    required
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Stock Unit (e.g. Boxes / Bottles)</label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Purchase Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Retail Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Safety stock threshold minimum</label>
                  <input
                    type="number"
                    required
                    value={newMinLevel}
                    onChange={(e) => setNewMinLevel(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 font-bold text-rose-500">Item Shelf Expiry</label>
                  <input
                    type="date"
                    required
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none font-mono text-rose-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Supplier profile</label>
                <select
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none"
                >
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name} ({sup.contactName})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Discard restock
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Apply to Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
