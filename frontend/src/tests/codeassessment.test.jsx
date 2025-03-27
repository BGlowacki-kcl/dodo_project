import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CodeAss from '../pages/applicant/CodeAssessment';
import { assessmentService } from '../services/assessment.service';
import { getApplicationById, getAssessmentDeadline, setAssessmentDeadline, updateStatus } from '../services/application.service.js';

// Mock the required modules
vi.mock('react-router-dom', () => ({
  useParams: () => ({ appId: 'test-app-id' }),
  useNavigate: () => vi.fn(),
}));

vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }) => (
    <textarea 
      data-testid="monaco-editor"
      value={value} 
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('../firebase.js', () => ({
  auth: {
    currentUser: {
      getIdToken: vi.fn().mockResolvedValue('mock-token')
    }
  }
}));

vi.mock('../context/notification.context', () => ({
  useNotification: () => vi.fn(),
}));

vi.mock('../services/assessment.service', () => ({
  assessmentService: {
    getTasksId: vi.fn(),
    getTask: vi.fn(),
    runCode: vi.fn(),
    submit: vi.fn(),
  },
}));

vi.mock('../services/application.service.js', () => ({
  getApplicationById: vi.fn(),
  getAssessmentDeadline: vi.fn(),
  setAssessmentDeadline: vi.fn(),
  updateStatus: vi.fn(),
}));

vi.mock('../components/AssessmentStatus', () => ({
  default: ({ chosen, status, onClick, title }) => (
    <div 
      data-testid={`assessment-status-${title}`}
      data-chosen={chosen}
      data-status={status}
      onClick={onClick}
    >
      {title}
    </div>
  ),
}));

describe('CodeAssessment Component', () => {
  const mockTasks = [
    { id: 'task1', status: 'not-attempted', title: 'Task 1' },
    { id: 'task2', status: 'not-attempted', title: 'Task 2' }
  ];
  
  const mockTask = {
    _id: 'task1',
    description: 'Test description',
    testCases: [{ input: "5", expectedOutput: "25" }],
    inputForPythonJS: "n",
    code: "",
    input: "A number n",
    output: "n squared",
    funcForCppTest: "func"
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock dates
    vi.setSystemTime(new Date(2023, 1, 1, 12, 0, 0));
    
    // Mock application
    getApplicationById.mockResolvedValue({
      status: 'Code Challenge',
    });
    
    // Mock deadline - 1 hour from now
    getAssessmentDeadline.mockResolvedValue(new Date(2023, 1, 1, 13, 0, 0).getTime());
    
    // Mock tasks
    assessmentService.getTasksId.mockResolvedValue(mockTasks);
    assessmentService.getTask.mockResolvedValue({
      assessment: mockTask,
      submission: []
    });
    
    // Mock run code
    assessmentService.runCode.mockResolvedValue({
      stdout: "Test 1: PASSED\nTest 2: HIDDEN PASSED\n",
      stderr: ""
    });
    
    // Mock submit
    assessmentService.submit.mockResolvedValue({
      success: true,
      message: "Solution submitted successfully"
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders the code assessment page', async () => {
    render(<CodeAss />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Run Code')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Tests Passed: 0 / 10')).toBeInTheDocument();
    expect(screen.getByText('Time Left:')).toBeInTheDocument();
    expect(screen.getByText('Finish assessment!')).toBeInTheDocument();
  });

  test('changes language correctly', async () => {
    render(<CodeAss />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Mock confirm to return true
    window.confirm = vi.fn(() => true);
    
    const languageSelect = screen.getByRole('combobox');
    expect(languageSelect.value).toBe('python');
    
    fireEvent.change(languageSelect, { target: { value: 'javascript' } });
    expect(languageSelect.value).toBe('javascript');
    
    expect(window.confirm).toHaveBeenCalled();
  });

  test('handles running code', async () => {
    render(<CodeAss />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    const runButton = screen.getByText('Run Code');
    fireEvent.click(runButton);
    
    await waitFor(() => {
      expect(assessmentService.runCode).toHaveBeenCalled();
    });
    
    expect(screen.getByText('Test 1: PASSED')).toBeInTheDocument();
  });

  test('handles submitting code', async () => {
    render(<CodeAss />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(assessmentService.submit).toHaveBeenCalled();
    });
  });

  test('handles task switching', async () => {
    render(<CodeAss />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Mock Task 2 data
    assessmentService.getTask.mockResolvedValueOnce({
      assessment: {
        ...mockTask,
        _id: 'task2', 
        description: 'Task 2 description'
      },
      submission: []
    });
    
    const task2Element = screen.getByTestId('assessment-status-Task 2');
    fireEvent.click(task2Element);
    
    await waitFor(() => {
      expect(assessmentService.getTask).toHaveBeenCalledWith('test-app-id', 'task2');
    });
  });

  test('finishes assessment when button is clicked', async () => {
    render(<CodeAss />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    const finishButton = screen.getByText('Finish assessment!');
    fireEvent.click(finishButton);
    
    await waitFor(() => {
      expect(setAssessmentDeadline).toHaveBeenCalledWith('test-app-id', -1);
      expect(updateStatus).toHaveBeenCalledWith('test-app-id', false);
    });
  });

  test('handles timer expiration', async () => {
    // Mock deadline to be in the past
    getAssessmentDeadline.mockResolvedValue(new Date(2023, 1, 1, 11, 0, 0).getTime());
    
    render(<CodeAss />);
    
    await waitFor(() => {
      expect(setAssessmentDeadline).toHaveBeenCalledWith('test-app-id', -1);
      expect(updateStatus).toHaveBeenCalledWith('test-app-id', false);
    });
  });

  test('handles code editor changes', async () => {
    render(<CodeAss />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    const editor = screen.getByTestId('monaco-editor');
    fireEvent.change(editor, { target: { value: 'def func(n):\n  return n * n' } });
    
    expect(editor.value).toBe('def func(n):\n  return n * n');
  });
});
