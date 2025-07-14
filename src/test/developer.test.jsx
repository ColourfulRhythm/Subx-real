import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../contexts/AuthContext';
import DeveloperDashboard from '../routes/dashboard/developer';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

// Mock Firebase Storage
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

describe('Developer Dashboard Flows', () => {
  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('Project Management', () => {
    test('renders project list and create project button', () => {
      renderWithRouter(<DeveloperDashboard />);
      expect(screen.getByText(/my projects/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create new project/i })).toBeInTheDocument();
    });

    test('opens project creation form when create button is clicked', async () => {
      renderWithRouter(<DeveloperDashboard />);
      
      const createButton = screen.getByRole('button', { name: /create new project/i });
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/project title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/project type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/roi/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/timeline/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      });
    });

    test('validates required fields in project creation form', async () => {
      renderWithRouter(<DeveloperDashboard />);
      
      const createButton = screen.getByRole('button', { name: /create new project/i });
      await userEvent.click(createButton);

      const submitButton = screen.getByRole('button', { name: /create project/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/location is required/i)).toBeInTheDocument();
        expect(screen.getByText(/project type is required/i)).toBeInTheDocument();
        expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Investor Connections', () => {
    test('renders investor connections list', () => {
      renderWithRouter(<DeveloperDashboard />);
      expect(screen.getByText(/investor connections/i)).toBeInTheDocument();
    });

    test('shows connection status and details', async () => {
      renderWithRouter(<DeveloperDashboard />);
      
      // Wait for connections to load
      await waitFor(() => {
        expect(screen.getByText(/approved/i)).toBeInTheDocument();
        expect(screen.getByText(/pending/i)).toBeInTheDocument();
        expect(screen.getByText(/rejected/i)).toBeInTheDocument();
      });
    });

    test('allows responding to investor inquiries', async () => {
      renderWithRouter(<DeveloperDashboard />);
      
      // Wait for connections to load
      await waitFor(() => {
        const respondButton = screen.getByRole('button', { name: /respond/i });
        expect(respondButton).toBeInTheDocument();
      });

      const respondButton = screen.getByRole('button', { name: /respond/i });
      await userEvent.click(respondButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/response message/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send response/i })).toBeInTheDocument();
      });
    });
  });

  describe('Document Management', () => {
    test('renders document upload section', () => {
      renderWithRouter(<DeveloperDashboard />);
      expect(screen.getByText(/project documents/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upload document/i })).toBeInTheDocument();
    });

    test('allows uploading project documents', async () => {
      renderWithRouter(<DeveloperDashboard />);
      
      const uploadButton = screen.getByRole('button', { name: /upload document/i });
      await userEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/document type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/document file/i)).toBeInTheDocument();
      });
    });
  });
}); 