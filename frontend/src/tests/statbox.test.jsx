import React from 'react';
import { render, screen } from '@testing-library/react';
import StatBox from '../components/StatBox';

// Mock WhiteBox component
vi.mock('../components/WhiteBox', () => ({
  default: ({ children, className }) => (
    <div className={className} data-testid="white-box">
      {children}
    </div>
  ),
}));

describe('StatBox Component', () => {
  it('renders with title and value', () => {
    render(<StatBox title="Total Applications" value={42} />);
    
    expect(screen.getByText('Total Applications')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('applies custom color class', () => {
    render(<StatBox title="Success Rate" value="75%" color="text-green-500" />);
    
    const valueElement = screen.getByText('75%');
    expect(valueElement).toHaveClass('text-green-500');
  });

  it('renders string values correctly', () => {
    render(<StatBox title="Status" value="Active" color="text-blue-500" />);
    
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders inside a WhiteBox with text-center class', () => {
    render(<StatBox title="Metric" value="Value" />);
    
    const whiteBox = screen.getByTestId('white-box');
    expect(whiteBox).toHaveClass('text-center');
  });

  it('renders title as smaller font than value', () => {
    render(<StatBox title="Small Title" value="Big Value" />);
    
    const titleElement = screen.getByText('Small Title');
    const valueElement = screen.getByText('Big Value');
    
    expect(titleElement).toHaveClass('text-sm');
    expect(valueElement).toHaveClass('text-2xl');
  });
});
