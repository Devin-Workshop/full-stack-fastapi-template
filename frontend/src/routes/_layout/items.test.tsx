import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter } from '@tanstack/react-router'
import { ItemsService } from '@/client'
import { Route } from './items'

jest.mock('@/client', () => ({
  ItemsService: {
    readItems: jest.fn(),
    searchItems: jest.fn(),
  },
}))

const mockNavigate = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
}))

describe('Items Search Functionality', () => {
  let queryClient: QueryClient
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    jest.clearAllMocks()
  })

  it('should call searchItems when search query is provided', async () => {
    const mockSearchItems = jest.mocked(ItemsService.searchItems)
    mockSearchItems.mockResolvedValue({ data: [], count: 0 })
    
    const mockUseSearch = jest.fn(() => ({ page: 1, q: 'test' }))
    Route.useSearch = mockUseSearch
    
    render(
      <QueryClientProvider client={queryClient}>
        <Route.component />
      </QueryClientProvider>
    )
    
    await waitFor(() => {
      expect(mockSearchItems).toHaveBeenCalledWith({
        q: 'test',
        skip: 0,
        limit: 5,
      })
    })
  })

  it('should call readItems when no search query is provided', async () => {
    const mockReadItems = jest.mocked(ItemsService.readItems)
    mockReadItems.mockResolvedValue({ data: [], count: 0 })
    
    const mockUseSearch = jest.fn(() => ({ page: 1 }))
    Route.useSearch = mockUseSearch
    
    render(
      <QueryClientProvider client={queryClient}>
        <Route.component />
      </QueryClientProvider>
    )
    
    await waitFor(() => {
      expect(mockReadItems).toHaveBeenCalledWith({
        skip: 0,
        limit: 5,
      })
    })
  })

  it('should show search input with correct placeholder', () => {
    const mockUseSearch = jest.fn(() => ({ page: 1 }))
    Route.useSearch = mockUseSearch
    
    render(
      <QueryClientProvider client={queryClient}>
        <Route.component />
      </QueryClientProvider>
    )
    
    const searchInput = screen.getByPlaceholderText('Search items by title or description...')
    expect(searchInput).toBeInTheDocument()
  })

  it('should show appropriate empty state message for search results', async () => {
    const mockSearchItems = jest.mocked(ItemsService.searchItems)
    mockSearchItems.mockResolvedValue({ data: [], count: 0 })
    
    const mockUseSearch = jest.fn(() => ({ page: 1, q: 'nonexistent' }))
    Route.useSearch = mockUseSearch
    
    render(
      <QueryClientProvider client={queryClient}>
        <Route.component />
      </QueryClientProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByText('No items found for "nonexistent"')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument()
    })
  })

  it('should show default empty state when no search query', async () => {
    const mockReadItems = jest.mocked(ItemsService.readItems)
    mockReadItems.mockResolvedValue({ data: [], count: 0 })
    
    const mockUseSearch = jest.fn(() => ({ page: 1 }))
    Route.useSearch = mockUseSearch
    
    render(
      <QueryClientProvider client={queryClient}>
        <Route.component />
      </QueryClientProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByText("You don't have any items yet")).toBeInTheDocument()
      expect(screen.getByText('Add a new item to get started')).toBeInTheDocument()
    })
  })
})
