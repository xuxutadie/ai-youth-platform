import { create } from 'zustand'

interface WorkSearchState {
  searchTerm: string
  setSearchTerm: (term: string) => void
}

const useWorkSearchStore = create<WorkSearchState>((set) => ({
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
}))

export default useWorkSearchStore