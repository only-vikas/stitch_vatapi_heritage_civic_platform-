'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PendingIssueData {
  category: string;
  severity: 'low' | 'medium' | 'high';
  title?: string;
  description: string;
  photo_url?: string;
  damage_type?: string;
  severity_score?: number;
  source: 'ar_scanner' | 'manual';
  location?: string;
  landmark?: string;
  jurisdiction?: string;
}

interface IssueStoreContextType {
  pendingIssueData: PendingIssueData | null;
  setPendingIssueData: (data: PendingIssueData | null) => void;
  clearPendingIssueData: () => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  openReportModalWithData: (data: PendingIssueData) => void;
}

const IssueContext = createContext<IssueStoreContextType | undefined>(undefined);

export function IssueProvider({ children }: { children: React.ReactNode }) {
  const [pendingIssueData, setPendingIssueDataState] = useState<PendingIssueData | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Restore pending issue from sessionStorage on mount (if available)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('vatapi_pending_issue');
        if (stored) {
          const parsed = JSON.parse(stored);
          setPendingIssueDataState(parsed);
        }
      } catch (e) {
        console.warn('Could not parse stored pending issue', e);
      }
    }
  }, []);

  const setPendingIssueData = (data: PendingIssueData | null) => {
    setPendingIssueDataState(data);
    if (typeof window !== 'undefined') {
      if (data) {
        sessionStorage.setItem('vatapi_pending_issue', JSON.stringify(data));
      } else {
        sessionStorage.removeItem('vatapi_pending_issue');
      }
    }
  };

  const clearPendingIssueData = () => {
    setPendingIssueData(null);
  };

  const openReportModalWithData = (data: PendingIssueData) => {
    setPendingIssueData(data);
    setIsReportModalOpen(true);
  };

  return (
    <IssueContext.Provider
      value={{
        pendingIssueData,
        setPendingIssueData,
        clearPendingIssueData,
        isReportModalOpen,
        setIsReportModalOpen,
        openReportModalWithData,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
}

export function useIssueStore() {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssueStore must be used within an IssueProvider');
  }
  return context;
}
