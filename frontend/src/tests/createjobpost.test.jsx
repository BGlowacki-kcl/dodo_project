import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateJobPost from '../pages/employer/CreateJobPost';
import { createJob } from '../services/job.service';
import { BrowserRouter } from 'react-router-dom';

import { describe, test, expect, vi } from "vitest";
import { userService } from "../services/user.service";
import { assessmentService } from "../services/assessment.service";

// Mock services
vi.mock("../services/user.service", () => ({
  userService: {
    getUserProfile: vi.fn().mockResolvedValue({
      name: "TechCorp",
      _id: "MASv2PrB4sgUxMvLNyHBkbOR9Uo2",
    }),
  },
}));

vi.mock("../services/job.service", () => ({
  createJob: vi.fn(),
}));

vi.mock("../services/assessment.service", () => ({
  assessmentService: {
    getAllTasks: vi.fn().mockResolvedValue([
      { id: '1', title: 'Coding Challenge' },
      { id: '2', title: 'System Design Interview' },
    ]),
  }
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("CreateJobPost Component", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test("should fetch and display user profile", async () => {
    const user = await userService.getUserProfile();
    
    expect(user.name).toBe("TechCorp");
    expect(user._id).toBe("MASv2PrB4sgUxMvLNyHBkbOR9Uo2");
  });

  test("should render the form with prefilled company name from user profile", async () => {
    renderWithRouter(<CreateJobPost />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toHaveValue("TechCorp");
    });
    
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  test("should handle input field changes", async () => {
    renderWithRouter(<CreateJobPost />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toHaveValue("TechCorp");
    });

    // Update title field
    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: 'Senior Developer' } });
    expect(titleInput.value).toBe('Senior Developer');

    // Update description field
    const descriptionInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descriptionInput, { target: { value: 'This is a test description' } });
    expect(descriptionInput.value).toBe('This is a test description');

    // Update location field
    const locationInput = screen.getByLabelText(/Location/i);
    fireEvent.change(locationInput, { target: { value: 'Remote' } });
    expect(locationInput.value).toBe('Remote');

    // Update employment type field
    const employmentTypeSelect = screen.getByLabelText(/Employment Type/i);
    fireEvent.change(employmentTypeSelect, { target: { value: 'full-time' } });
    expect(employmentTypeSelect.value).toBe('full-time');

    // Update deadline field
    const deadlineInput = screen.getByLabelText(/Application Deadline/i);
    const futureDate = '2025-12-31';
    fireEvent.change(deadlineInput, { target: { value: futureDate } });
    expect(deadlineInput.value).toBe(futureDate);
  });

  test("should handle salary range changes", async () => {
    renderWithRouter(<CreateJobPost />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toHaveValue("TechCorp");
    });

    // Update minimum salary
    const minSalaryInput = screen.getByLabelText(/Minimum Salary/i);
    fireEvent.change(minSalaryInput, { target: { value: '50000' } });
    expect(minSalaryInput.value).toBe('50000');

    // Update maximum salary
    const maxSalaryInput = screen.getByLabelText(/Maximum Salary/i);
    fireEvent.change(maxSalaryInput, { target: { value: '80000' } });
    expect(maxSalaryInput.value).toBe('80000');
  });

  test("should handle adding and removing requirements", async () => {
    renderWithRouter(<CreateJobPost />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toHaveValue("TechCorp");
    });

    // Get the requirements input and add button
    const requirementInput = screen.getByPlaceholderText(/Add a requirement/i);
    const addButton = screen.getByRole('button', { name: 'Add' });

    // Add first requirement
    fireEvent.change(requirementInput, { target: { value: '5+ years experience' } });
    fireEvent.click(addButton);

    // Verify requirement was added
    await waitFor(() => {
      expect(screen.getByText('5+ years experience')).toBeInTheDocument();
    });

    // Add second requirement
    fireEvent.change(requirementInput, { target: { value: 'React expertise' } });
    fireEvent.click(addButton);

    // Verify second requirement was added
    await waitFor(() => {
      expect(screen.getByText('React expertise')).toBeInTheDocument();
    });

    // Remove a requirement
    const removeButtons = screen.getAllByRole('button', { name: '×' });
    fireEvent.click(removeButtons[0]);

    // Verify requirement was removed
    await waitFor(() => {
      expect(screen.queryByText('5+ years experience')).not.toBeInTheDocument();
      expect(screen.getByText('React expertise')).toBeInTheDocument();
    });
  });

  test("should handle assessment selection", async () => {
    renderWithRouter(<CreateJobPost />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toHaveValue("TechCorp");
    });

    // Wait for assessments to load
    await waitFor(() => {
      expect(screen.getByText('Coding Challenge')).toBeInTheDocument();
    });

    // Toggle assessment selection
    const codingChallengeCheckbox = screen.getByLabelText('Coding Challenge');
    fireEvent.click(codingChallengeCheckbox);

    // Verify checkbox was checked
    expect(codingChallengeCheckbox.checked).toBe(true);

    // Toggle again to uncheck
    fireEvent.click(codingChallengeCheckbox);
    expect(codingChallengeCheckbox.checked).toBe(false);
  });

  test("should handle adding and removing questions", async () => {
    renderWithRouter(<CreateJobPost />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toHaveValue("TechCorp");
    });

    // Find the "Add Question" button (using title attribute)
    const addQuestionButton = screen.getByTitle('Add Question');
    
    // Add a question
    fireEvent.click(addQuestionButton);

    // Verify question input appears
    const questionInput = await screen.findByPlaceholderText('Enter question text');
    expect(questionInput).toBeInTheDocument();

    // Set question text
    fireEvent.change(questionInput, { target: { value: 'What is your greatest achievement?' } });
    expect(questionInput.value).toBe('What is your greatest achievement?');

    // Add another question
    fireEvent.click(addQuestionButton);

    // Verify both questions exist
    const questionInputs = await screen.findAllByPlaceholderText('Enter question text');
    expect(questionInputs.length).toBe(2);

    // Set text for second question
    fireEvent.change(questionInputs[1], { target: { value: 'Why do you want to work here?' } });
    
    // Remove a question
    const deleteButtons = screen.getAllByTitle('Delete Question');
    fireEvent.click(deleteButtons[0]);

    // Verify question was removed
    await waitFor(() => {
      const remainingInputs = screen.getAllByPlaceholderText('Enter question text');
      expect(remainingInputs.length).toBe(1);
      expect(remainingInputs[0].value).toBe('Why do you want to work here?');
    });
  });

  

  test("should submit form successfully with all required data", async () => {
    // Mock successful API call
    createJob.mockResolvedValueOnce({ success: true });
    
    renderWithRouter(<CreateJobPost />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toHaveValue("TechCorp");
    });

    // Fill out all required fields
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Senior Developer' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'This is a test description' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Remote' } });
    
    // Set deadline
    const deadlineInput = screen.getByLabelText(/Application Deadline/i);
    const futureDate = '2025-12-31';
    fireEvent.change(deadlineInput, { target: { value: futureDate } });

    // Select employment type
    const employmentTypeSelect = screen.getByLabelText(/Employment Type/i);
    fireEvent.change(employmentTypeSelect, { target: { value: 'full-time' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Create Job' });
    fireEvent.click(submitButton);

    // Verify createJob was called with the correct data
    await waitFor(() => {
      expect(createJob).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Senior Developer',
        company: 'TechCorp',
        description: 'This is a test description',
        location: 'Remote',
        employmentType: 'full-time',
        deadline: '2025-12-31',
        postedBy: 'MASv2PrB4sgUxMvLNyHBkbOR9Uo2'
      }));
      
      // Verify navigation was called
      expect(mockNavigate).toHaveBeenCalledWith('/employer/posts');
    });
  });
  
  

  test("should handle API error on form submission", async () => {
    // Mock API error
    createJob.mockRejectedValueOnce({ 
      response: { data: { message: 'Server error occurred' } } 
    });
    
    renderWithRouter(<CreateJobPost />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toHaveValue("TechCorp");
    });

    // Fill out all required fields
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Senior Developer' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'This is a test description' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Remote' } });
    fireEvent.change(screen.getByLabelText(/Application Deadline/i), { target: { value: '2025-12-31' } });
    fireEvent.change(screen.getByLabelText(/Employment Type/i), { target: { value: 'full-time' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Create Job' });
    fireEvent.click(submitButton);

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Server error occurred/i)).toBeInTheDocument();
    });
  });

  test("should handle API error when fetching tasks", async () => {
    // Mock API error for getAllTasks
    assessmentService.getAllTasks.mockRejectedValueOnce(new Error('Failed to fetch tasks'));
    
    renderWithRouter(<CreateJobPost />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toHaveValue("TechCorp");
    });

    // Component should still render without crashing
    expect(screen.getByText('Create Job Post')).toBeInTheDocument();
  });

  test("should handle loading state during form submission", async () => {
    // Mock delayed API response
    createJob.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ success: true }), 100);
      });
    });
    
    renderWithRouter(<CreateJobPost />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toHaveValue("TechCorp");
    });

    // Fill out all required fields
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Senior Developer' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'This is a test description' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Remote' } });
    fireEvent.change(screen.getByLabelText(/Application Deadline/i), { target: { value: '2025-12-31' } });
    fireEvent.change(screen.getByLabelText(/Employment Type/i), { target: { value: 'full-time' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Create Job' });
    fireEvent.click(submitButton);

    // Check loading state
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Verify loading state changes back
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/employer/posts');
    });
  });

  test("should navigate back to posts when cancel button is clicked", async () => {
    renderWithRouter(<CreateJobPost />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toHaveValue("TechCorp");
    });

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    // Verify navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/employer/posts');
  });

  test("should not add duplicate requirements", async () => {
    renderWithRouter(<CreateJobPost />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toHaveValue("TechCorp");
    });

    // Get the requirements input and add button
    const requirementInput = screen.getByPlaceholderText(/Add a requirement/i);
    const addButton = screen.getByRole('button', { name: 'Add' });

    // Add a requirement
    fireEvent.change(requirementInput, { target: { value: 'React expertise' } });
    fireEvent.click(addButton);

    // Try to add the same requirement again
    fireEvent.change(requirementInput, { target: { value: 'React expertise' } });
    fireEvent.click(addButton);

    // Verify requirement was added only once
    const requirementElements = screen.getAllByText('React expertise');
    expect(requirementElements.length).toBe(1);
  });

  test("should not add empty requirements", async () => {
    renderWithRouter(<CreateJobPost />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Company/i)).toHaveValue("TechCorp");
    });

    // Get the requirements input and add button
    const requirementInput = screen.getByPlaceholderText(/Add a requirement/i);
    const addButton = screen.getByRole('button', { name: 'Add' });

    // Try to add an empty requirement
    fireEvent.change(requirementInput, { target: { value: '   ' } });
    fireEvent.click(addButton);

    // Verify no requirement was added
    expect(screen.queryByRole('button', { name: '×' })).not.toBeInTheDocument();
  });
});






  

  

  

