import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SearchBar from '../components/SearchBar';

// Mock react-icons/fa
vi.mock('react-icons/fa', () => ({
  FaSearch: () => <span data-testid="search-icon">🔍</span>
}));

describe('SearchBar Component', () => {
  it('renders with default props', () => {
    render(<SearchBar />);
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<SearchBar placeholder="Find jobs..." />);
    
    expect(screen.getByPlaceholderText('Find jobs...')).toBeInTheDocument();
  });

  it('calls onSearch when input changes', () => {
    const mockOnSearch = vi.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'developer' } });
    
    expect(mockOnSearch).toHaveBeenCalledWith('developer');
  });

  it('applies custom width and height', () => {
    render(<SearchBar width="100px" height="50px" />);
    
    const searchBarContainer = screen.getByPlaceholderText('Search...').closest('div');
    
    expect(searchBarContainer).toHaveStyle({
      width: '100px',
      height: '50px',
    });
  });

  it('does not throw errors when onSearch prop is not provided', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText('Search...');
    expect(() => {
      fireEvent.change(input, { target: { value: 'test' } });
    }).not.toThrow();
  });
});
