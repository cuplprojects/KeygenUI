import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import VerificationWindow from '../VerificationWindow';
import { UserProvider } from 'src/context/UserContext';
import useStatusCounts from 'src/context/usePdfStatusData';

jest.mock('axios');
jest.mock('src/context/usePdfStatusData');

const mockUser = {
  token: 'mock-token',
  userID: 'mock-user-id',
};

const mockStatusCounts = {
  pdfStatusCounts: {
    notVerifiedCount: 10,
    totalCatchNumbers: 100,
    totalFiles: 400,
    totalPapers: 100,
    verifiedCount: 80,
    wrongCount: 10,
  },
  loadingstatus: false,
  error: null,
  refetch: jest.fn(),
};

const renderComponent = () => {
  return render(
    <UserProvider value={{ keygenUser: mockUser }}>
      <VerificationWindow />
    </UserProvider>
  );
};

describe('VerificationWindow', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: {} });
    useStatusCounts.mockReturnValue(mockStatusCounts);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders initial state correctly', () => {
    renderComponent();
    expect(screen.getByText('Program')).toBeInTheDocument();
    expect(screen.getByText('Select Filter:')).toBeInTheDocument();
    expect(screen.getByText('Catch Number')).toBeInTheDocument();
    expect(screen.getByText('Show PDFs')).toBeDisabled();
  });

  test('fetches programs on mount', async () => {
    const mockPrograms = [
      { programmeID: 1, programmeName: 'Program 1' },
      { programmeID: 2, programmeName: 'Program 2' },
    ];
    axios.get.mockResolvedValueOnce({ data: mockPrograms });

    renderComponent();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/Programmes'), expect.any(Object));
    });
  });

  test('handles program selection', async () => {
    renderComponent();

    const programSelect = screen.getByLabelText('Program');
    fireEvent.change(programSelect, { target: { value: 'Program 1' } });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/catch-numbers'), expect.any(Object));
    });
  });

  test('handles catch number selection', async () => {
    renderComponent();

    const catchNumberSelect = screen.getByLabelText('Catch Number');
    fireEvent.change(catchNumberSelect, { target: { value: 'Catch 1' } });

    expect(screen.getByText('Show PDFs')).not.toBeDisabled();
  });

  test('shows PDFs when button is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ fileName: 'test.pdf' }] });

    renderComponent();

    const showPDFsButton = screen.getByText('Show PDFs');
    fireEvent.click(showPDFsButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/GetPdfs'), expect.any(Object));
    });
  });

  test('handles verification', async () => {
    renderComponent();

    const verifyButton = screen.getByLabelText('Verify (Correct)');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/VerifyPageNumber'), expect.any(Object), expect.any(Object));
    });
  });

  test('displays status counts correctly', () => {
    renderComponent();

    expect(screen.getByText('Total Catches: 100')).toBeInTheDocument();
    expect(screen.getByText('Not Verified: 10')).toBeInTheDocument();
    expect(screen.getByText('Verified: 80')).toBeInTheDocument();
    expect(screen.getByText('Incorrect: 10')).toBeInTheDocument();
  });

  test('toggles fullscreen mode', () => {
    renderComponent();

    const fullscreenButton = screen.getByLabelText('Toggle fullscreen');
    fireEvent.click(fullscreenButton);

    // Mock the fullscreen API
    const mockRequestFullscreen = jest.fn();
    const mockExitFullscreen = jest.fn();
    Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true });
    document.documentElement.requestFullscreen = mockRequestFullscreen;
    document.exitFullscreen = mockExitFullscreen;

    fireEvent.click(fullscreenButton);
    expect(mockRequestFullscreen).toHaveBeenCalled();

    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement });
    fireEvent.click(fullscreenButton);
    expect(mockExitFullscreen).toHaveBeenCalled();
  });

  test('handles filter change', async () => {
    renderComponent();

    const filterSelect = screen.getByLabelText('Select Filter:');
    fireEvent.change(filterSelect, { target: { value: 'verified' } });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/catch-numbers'), expect.any(Object));
    });
  });

  test('marks all as verified', async () => {
    renderComponent();

    const markVerifiedButton = screen.getByText('Mark as Verified');
    fireEvent.click(markVerifiedButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/UpdateStatus'), expect.any(Object), expect.any(Object));
    });
  });

  test('marks all as wrong', async () => {
    renderComponent();

    const markWrongButton = screen.getByText('Mark as Wrong');
    fireEvent.click(markWrongButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/UpdateStatus'), expect.any(Object), expect.any(Object));
    });
  });
});
