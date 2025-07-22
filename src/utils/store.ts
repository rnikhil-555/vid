import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MediaItem } from '@/hooks/use-media-list'

interface MediaStore {
  watchlist: MediaItem[]
  history: MediaItem[]
  loading: boolean
  setLoading: (loading: boolean) => void
  initializeStore: (type: 'watchlist' | 'history', items: MediaItem[]) => void
  addItem: (type: 'watchlist' | 'history', item: MediaItem) => void
  removeItem: (type: 'watchlist' | 'history', mediaId: string, mediaType: string) => void
  clearList: (type: 'watchlist' | 'history') => void
  isInList: (type: 'watchlist' | 'history', mediaId: string, mediaType: string) => boolean
  clearAll: () => void
}

export const useMediaStore = create<MediaStore>()(
  persist(
    (set, get) => ({
      watchlist: [],
      history: [],
      loading: true,
      setLoading: (loading) => set({ loading }),
      
      initializeStore: (type, items) => {
        set((state) => ({
          [type]: items,
          loading: false
        }))
      },

      addItem: (type, item) => {
        set((state) => {
          const currentList = state[type]
          const filteredList = currentList.filter(
            (existingItem) => !(
              existingItem.mediaId === item.mediaId &&
              existingItem.mediaType === item.mediaType
            )
          )
          return { [type]: [item, ...filteredList] }
        })
      },

      removeItem: (type, mediaId, mediaType) => {
        set((state) => ({
          [type]: state[type].filter(
            (item) => !(item.mediaId === mediaId && item.mediaType === mediaType)
          )
        }))
      },

      clearList: (type) => {
        set((state) => ({ [type]: [] }))
      },

      isInList: (type, mediaId, mediaType) => {
        const state = get()
        return state[type].some(
          (item) => item.mediaId === mediaId && item.mediaType === mediaType
        )
      },

      clearAll: () => {
        set((state) => ({
          watchlist: [],
          history: [],
          loading: true
        }))
      }
    }),
    {
      name: 'media-storage'
    }
  )
)