// leadsSlice.ts
// This file manages the leads state using Redux Toolkit. It handles adding, updating, deleting, and setting the list of leads.
// Used for all lead management operations in the app.
//
// Workflow:
// 1. setLeads: Replaces the entire leads array (used when loading from storage).
// 2. addLead: Adds a new lead to the array.
// 3. updateLead: Updates an existing lead by id.
// 4. deleteLead: Removes a lead by id.

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Lead type definition
export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  source: 'Website' | 'Referral' | 'Cold Call' | 'Social Media';
  notes: string;
}

// Leads state type
type LeadsState = {
  leads: Lead[];
};

// Initial state for leads
const initialState: LeadsState = {
  leads: [],
};

// Leads slice definition
const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    // Replaces the entire leads array (used when loading from storage)
    setLeads(state, action: PayloadAction<Lead[]>) {
      state.leads = action.payload;
    },
    // Adds a new lead to the array
    addLead(state, action: PayloadAction<Lead>) {
      state.leads.push(action.payload);
    },
    // Updates an existing lead by id
    updateLead(state, action: PayloadAction<Lead>) {
      const idx = state.leads.findIndex(l => l.id === action.payload.id);
      if (idx !== -1) {
        state.leads[idx] = action.payload;
      }
    },
    // Removes a lead by id
    deleteLead(state, action: PayloadAction<string>) {
      state.leads = state.leads.filter(l => l.id !== action.payload);
    },
  },
});

export const { setLeads, addLead, updateLead, deleteLead } = leadsSlice.actions;
export default leadsSlice.reducer; 
