import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ResumeData, Section, ResumeSettings } from './types';
import { INITIAL_RESUME_DATA } from './constants';
import { db } from './lib/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './lib/AuthContext';

interface ResumeContextType {
  resumeData: ResumeData;
  isLoading: boolean;
  saveResume: () => Promise<void>;
  createVersion: () => Promise<void>;
  loadResume: (id: string) => Promise<void>;
  currentResumeId: string | null;
  updatePersonalInfo: (info: Partial<ResumeData['personalInfo']>) => void;
  updateSettings: (settings: Partial<ResumeSettings>) => void;
  addSectionItem: (sectionId: string, item: any) => void;
  updateSectionItem: (sectionId: string, itemId: string, item: any) => void;
  removeSectionItem: (sectionId: string, itemId: string) => void;
  reorderSections: (newSections: Section[]) => void;
  reorderSectionItems: (sectionId: string, newItems: any[]) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children, initialData }: { children: ReactNode, initialData?: ResumeData }) {
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData>(initialData || INITIAL_RESUME_DATA as ResumeData);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(initialData?.id || null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's most recent resume on login
  useEffect(() => {
    async function loadLastResume() {
      if (initialData) return; // Don't override if we have initial data (shared view)
      if (!user) {
        setResumeData(INITIAL_RESUME_DATA as ResumeData);
        setCurrentResumeId(null);
        return;
      }

      setIsLoading(true);
      try {
        const q = query(
          collection(db, 'resumes'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const lastDoc = querySnapshot.docs[0];
          setResumeData(lastDoc.data() as ResumeData);
          setCurrentResumeId(lastDoc.id);
        } else {
          // Create a new resume for new user
          const newResumeId = crypto.randomUUID();
          const newResume = {
            ...INITIAL_RESUME_DATA,
            id: newResumeId,
            userId: user.uid,
            title: 'My First Resume',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'resumes', newResumeId), newResume);
          setResumeData(newResume as ResumeData);
          setCurrentResumeId(newResumeId);
        }
      } catch (error) {
        console.error('Error loading resume:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadLastResume();
  }, [user]);

  const saveResume = async () => {
    if (!user || !currentResumeId) return;

    try {
      await updateDoc(doc(db, 'resumes', currentResumeId), {
        ...resumeData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving resume:', error);
    }
  };

  const createVersion = async () => {
    if (!user || !currentResumeId) return;

    try {
      const token = await user.getIdToken();
      await fetch(`/api/resumes/${currentResumeId}/versions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: resumeData,
        }),
      });
    } catch (error) {
      console.error('Error creating version:', error);
    }
  };

  const loadResume = async (id: string) => {
    setIsLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'resumes', id));
      if (docSnap.exists()) {
        setResumeData(docSnap.data() as ResumeData);
        setCurrentResumeId(id);
      }
    } catch (error) {
      console.error('Error loading specific resume:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePersonalInfo = useCallback((info: Partial<ResumeData['personalInfo']>) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info },
    }));
  }, []);

  const updateSettings = useCallback((settings: Partial<ResumeSettings>) => {
    setResumeData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  }, []);

  const addSectionItem = useCallback((sectionId: string, item: any) => {
    setResumeData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, content: [...s.content, item] } : s
      ),
    }));
  }, []);

  const updateSectionItem = useCallback((sectionId: string, itemId: string, item: any) => {
    setResumeData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              content: s.content.map((i) => (i.id === itemId ? { ...i, ...item } : i)),
            }
          : s
      ),
    }));
  }, []);

  const removeSectionItem = useCallback((sectionId: string, itemId: string) => {
    setResumeData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? { ...s, content: s.content.filter((i) => i.id !== itemId) }
          : s
      ),
    }));
  }, []);

  const reorderSections = useCallback((newSections: Section[]) => {
    setResumeData((prev) => ({ ...prev, sections: newSections }));
  }, []);

  const reorderSectionItems = useCallback((sectionId: string, newItems: any[]) => {
    setResumeData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, content: newItems } : s
      ),
    }));
  }, []);

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        isLoading,
        currentResumeId,
        saveResume,
        createVersion,
        loadResume,
        updatePersonalInfo,
        updateSettings,
        addSectionItem,
        updateSectionItem,
        removeSectionItem,
        reorderSections,
        reorderSectionItems,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
