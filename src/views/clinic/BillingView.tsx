/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  DollarSign,
  PlusCircle,
  Receipt,
  Search,
  Printer,
  Grid,
  CheckCircle,
  AlertOctagon,
  Wallet,
  Barcode,
  Sparkles,
  Percent,
  Trash
} from 'lucide-react';
import { Invoice, InvoiceItem, PaymentMethod } from '../../types';

export const BillingView: React.FC = () => {
  const {
    invoices,
    addInvoice,
    addPaymentToInvoice,
    clients,
    pets,
    currentUser
  } = useVeterinary();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'Unpaid'>('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New Invoice Fields
  const [newClientId, setNewClientId] = useState('');
  const [newPetId, setNewPetId] = useState('');
  const [itemsList, setItemsList] = useState<Omit<InvoiceItem, 'id' | 'subtotal'>[]>([
    { description: 'Standard General Veterinary Consultation', quantity: 1, unitPrice: 45.0 }
  ]);

  // Record Payment fields
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Credit Card');
  const [payRef, setPayRef] = useState('');

  // Invoice creation form helpers
  const [itemDesc, setItemDesc] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemPrice, setItemPrice] = useState('0.0');

  const filteredInvoices = invoices.filter(inv => {
    const client = clients.find(c => c.id === inv.clientId);
    const pet = pets.find(p => p.id === inv.petId);
    
    // Status filters
    if (filterStatus === 'Paid' && inv.status !== 'Paid') return false;
    if (filterStatus === 'Unpaid' && inv.status === 'Paid') return false;

    const fullStr = `${inv.id} ${client?.firstName || ''} ${client?.lastName || ''} ${pet?.name || ''}`.toLowerCase();
    return fullStr.includes(searchTerm.toLowerCase());
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientId || !newPetId || itemsList.length === 0) return;

    // Convert itemsList to standard schema
    const formattedItems = itemsList.map((item, idx) => ({
      id: `ITM-${idx + 1}`,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: Number((item.quantity * item.unitPrice).toFixed(2))
    }));

    addInvoice({
      clientId: newClientId,
      petId: newPetId,
      items: formattedItems
    });

    // Reset
    setNewClientId('');
    setNewPetId('');
    setItemsList([{ description: 'Standard General Veterinary Consultation', quantity: 1, unitPrice: 45.0 }]);
    setShowAddForm(false);
  };

  const handleAddLineItem = () => {
    if (!itemDesc || !itemPrice || !itemQty) return;
    setItemsList(prev => [
      ...prev,
      {
        description: itemDesc,
        quantity: parseInt(itemQty),
        unitPrice: parseFloat(itemPrice)
      }
    ]);
    setItemDesc('');
    setItemQty('1');
    setItemPrice('0.0');
  };

  const handleRemoveLineItem = (idx: number) => {
    setItemsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !payAmount) return;

    addPaymentToInvoice(selectedInvoice.id, parseFloat(payAmount), payMethod, payRef || undefined);

    // Sync viewed invoice state
    const refreshed = invoices.find(inv => inv.id === selectedInvoice.id);
    if (refreshed) setSelectedInvoice(refreshed);

    setPayAmount('');
    setPayRef('');
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200" id="billing-ledger-container">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between font-sans">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900">Invoicing, Ledgers & Payments</h2>
          <p className="text-xs text-slate-500">Record veterinary diagnostics collections, calculate billing taxes and generate receipts.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/10 cursor-pointer self-start transition-colors"
          id="generate-invoice-btn"
        >
          <PlusCircle className="h-4 w-4 stroke-[2.5]" />
          <span>Formulate New Invoice</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex gap-1">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-250 py-2 pl-9 pr-4 text-xs font-medium focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="rounded-xl border border-slate-250 px-2.5 py-2 text-xs bg-white text-slate-700 focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="All">All Bills</option>
              <option value="Paid">Paid Settled</option>
              <option value="Unpaid">Unpaid / Balance</option>
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm max-h-[58vh] overflow-y-auto space-y-1">
            {filteredInvoices.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8 font-medium">No invoice balances logged.</p>
            ) : (
              filteredInvoices.map((inv) => {
                const client = clients.find(c => c.id === inv.clientId);
                const isSelected = selectedInvoice?.id === inv.id;
                return (
                  <button
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex justify-between items-center ${
                      isSelected ? 'bg-emerald-50/70 border border-emerald-100/30 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800 font-mono block">{inv.id}</span>
                      <span className="text-[10px] text-slate-400 font-sans block mt-1">{client?.firstName} {client?.lastName}</span>
                    </div>

                    <div className="text-right">
                      <span className="block text-xs font-bold font-mono text-slate-700 font-bold">${inv.totalAmount}</span>
                      <span className={`inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 font-extrabold' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right column detail & Printable layout */}
        <div className="lg:col-span-2">
          {selectedInvoice ? (
            <div className="space-y-6">
              {/* PRINTABLE RECEIPT LAYOUT */}
              <div className="rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm text-left max-w-xl mx-auto space-y-6 border border-slate-200">
                <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">Settled Receipt</span>
                    <h3 className="font-sans font-black tracking-tight text-slate-900 font-mono text-base uppercase mt-2">WellPet Vet Clinic</h3>
                    <p className="text-[10px] text-slate-400">Invoice Id: {selectedInvoice.id}</p>
                    <p className="text-[10px] text-slate-400">Created date: {selectedInvoice.date}</p>
                  </div>

                  <div className="text-right text-[11px] text-slate-500 font-sans leading-relaxed">
                    <strong>Abidjan Hills DVM Group</strong>
                    <p>456 Pharmacy Rd, San Jose</p>
                    <p>Phone: 555-WELLPET</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] tracking-wide block">Owner Intake Client:</span>
                    <strong className="text-slate-800 mt-1 block">
                      {(() => {
                        const client = clients.find(c => c.id === selectedInvoice.clientId);
                        return client ? `${client.firstName} ${client.lastName}` : 'Guest Client';
                      })()}
                    </strong>
                    <p className="text-slate-500 font-mono mt-0.5 text-[11px]">
                      {clients.find(c => c.id === selectedInvoice.clientId)?.phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] tracking-wide block">Associated Patient:</span>
                    <strong className="text-slate-800 mt-1 block">
                      {pets.find(p => p.id === selectedInvoice.petId)?.name}
                    </strong>
                    <p className="text-slate-500 mt-0.5 text-[11px]">
                      Species: {pets.find(p => p.id === selectedInvoice.petId)?.species}
                    </p>
                  </div>
                </div>

                {/* Ledger services list */}
                <div className="border-t border-slate-100 pt-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-[10px] text-slate-400 uppercase">
                        <th className="pb-2">Clinical Service / Medication</th>
                        <th className="pb-2 text-center">Qty</th>
                        <th className="pb-2 text-right">Unit Price</th>
                        <th className="pb-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 text-slate-700 font-medium">{item.description}</td>
                          <td className="py-2.5 text-center font-mono text-slate-600">{item.quantity}</td>
                          <td className="py-2.5 text-right font-mono text-slate-600">${item.unitPrice.toFixed(2)}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-slate-800">${item.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Ledger taxes calculation */}
                <div className="border-t border-slate-100 pt-4 flex flex-col items-end text-xs space-y-2">
                  <div className="flex gap-8 justify-between w-full max-w-[220px]">
                    <span className="text-slate-400">Subtotal Balance:</span>
                    <span className="font-mono font-semibold">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-8 justify-between w-full max-w-[220px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      Tax Assessment <Percent className="h-3.5 w-3.5 text-slate-300" /> (8%):
                    </span>
                    <span className="font-mono font-semibold">${selectedInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-8 justify-between w-full max-w-[220px] border-t border-slate-100 pt-2 text-sm font-bold text-slate-800">
                    <span>Total Amount Charged:</span>
                    <span className="font-mono text-emerald-700 text-base font-black">${selectedInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-8 justify-between w-full max-w-[220px] rounded bg-slate-50 p-2 border border-slate-200 text-slate-600">
                    <span className="font-semibold text-[11px] uppercase tracking-wide">Paid Settled Amount:</span>
                    <strong className="font-mono text-emerald-700 text-xs">${selectedInvoice.paidAmount.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="flex gap-2 justify-between items-center pt-5 border-t border-slate-150">
                  <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase flex items-center gap-1.5 bg-emerald-50 px-2 rounded-lg py-1.5 font-bold">
                    <Barcode className="h-4 w-4" /> Barcode clearance
                  </span>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => window.print()}
                      className="rounded-xl border border-slate-200 px-3.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="h-4 w-4" /> Print Invoice
                    </button>
                  </div>
                </div>
              </div>

              {/* Record manual payment module */}
              {selectedInvoice.status !== 'Paid' && (
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm max-w-xl mx-auto text-left">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 mb-3 border-b border-slate-50 pb-2">
                    <Wallet className="h-4 w-4 text-emerald-600" />
                    Record Payment Settlement
                  </span>

                  <form onSubmit={handleRecordPaymentSubmit} className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Settlement Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={payAmount}
                        placeholder="0.00"
                        max={selectedInvoice.totalAmount - selectedInvoice.paidAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Clearing Method</label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                        className="w-full rounded-xl border border-slate-200 px-2 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="E-Wallet">E-Wallet</option>
                      </select>
                    </div>

                    <div className="col-span-1 flex flex-col justify-end">
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs text-white font-semibold cursor-pointer"
                      >
                        Process Payment
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <Receipt className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
              <p>Select invoice to audit ledger billing lines, generate PDF reports, or trace settlement balance.</p>
            </div>
          )}
        </div>
      </div>

      {/* NEW INVOICE MODAL FORM */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Formulate New Diagnostic Invoice</h3>
            <form onSubmit={handleCreateInvoice} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Select Client</label>
                  <select
                    required
                    value={newClientId}
                    onChange={(e) => {
                      setNewClientId(e.target.value);
                      setNewPetId('');
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Select billing recipient --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Select Pet Patient</label>
                  <select
                    required
                    value={newPetId}
                    onChange={(e) => setNewPetId(e.target.value)}
                    disabled={!newClientId}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Select patient --</option>
                    {pets.filter(p => p.clientId === newClientId).map(pet => (
                      <option key={pet.id} value={pet.id}>{pet.name} ({pet.breed})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Line items additions form */}
              <div className="border-t border-slate-50 pt-3 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Draft Line Items Customiser</span>
                
                <div className="grid gap-2 sm:grid-cols-4 items-end">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Description</label>
                    <input
                      type="text"
                      value={itemDesc}
                      placeholder="e.g. Surolan Ear Drops Treatment"
                      onChange={(e) => setItemDesc(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="w-full rounded-xl bg-slate-800 text-white font-semibold py-1.5 text-xs cursor-pointer hover:bg-slate-700"
                    >
                      Add Item
                    </button>
                  </div>
                </div>

                <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-50 p-2 bg-slate-50/20 text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 text-left">
                        <th className="pb-1.5">Custom Line Description</th>
                        <th className="pb-1.5 text-right">Price</th>
                        <th className="pb-1.5 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {itemsList.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 text-slate-700 font-medium">{item.description}</td>
                          <td className="py-2 text-right font-mono font-bold text-slate-800">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                          <td className="py-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(idx)}
                              className="text-rose-500 hover:text-rose-600"
                            >
                              <Trash className="h-4 w-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Discard Bill
                </button>
                <button
                  type="submit"
                  disabled={itemsList.length === 0}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
