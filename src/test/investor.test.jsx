import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../contexts/AuthContext';
import InvestorDashboard from '../routes/dashboard/investor';

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

describe('Investor Dashboard Flows', () => {
  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('Project Browsing', () => {
    test('renders project list with filters', () => {
      renderWithRouter(<InvestorDashboard />);
      expect(screen.getByText(/available projects/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location filter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/type filter/i)).toBeInTheDocument();
    });

    test('filters projects by location and type', async () => {
      renderWithRouter(<InvestorDashboard />);
      
      const locationFilter = screen.getByLabelText(/location filter/i);
      const typeFilter = screen.getByLabelText(/type filter/i);

      await userEvent.selectOptions(locationFilter, 'Lagos');
      await userEvent.selectOptions(typeFilter, 'Residential');

      await waitFor(() => {
        const projectCards = screen.getAllByTestId('project-card');
        projectCards.forEach(card => {
          expect(card).toHaveTextContent(/lagos/i);
          expect(card).toHaveTextContent(/residential/i);
        });
      });
    });

    test('shows project details when clicked', async () => {
      renderWithRouter(<InvestorDashboard />);
      
      const projectCard = screen.getAllByTestId('project-card')[0];
      await userEvent.click(projectCard);

      await waitFor(() => {
        expect(screen.getByText(/project details/i)).toBeInTheDocument();
        expect(screen.getByText(/roi/i)).toBeInTheDocument();
        expect(screen.getByText(/timeline/i)).toBeInTheDocument();
        expect(screen.getByText(/risk level/i)).toBeInTheDocument();
      });
    });
  });

  describe('Investment Proposals', () => {
    test('allows submitting investment proposal', async () => {
      renderWithRouter(<InvestorDashboard />);
      
      const projectCard = screen.getAllByTestId('project-card')[0];
      await userEvent.click(projectCard);

      const investButton = screen.getByRole('button', { name: /invest now/i });
      await userEvent.click(investButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/investment amount/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/number of units/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
      });

      const amountInput = screen.getByLabelText(/investment amount/i);
      const unitsInput = screen.getByLabelText(/number of units/i);
      const notesInput = screen.getByLabelText(/notes/i);
      const submitButton = screen.getByRole('button', { name: /submit proposal/i });

      await userEvent.type(amountInput, '500000');
      await userEvent.type(unitsInput, '2');
      await userEvent.type(notesInput, 'Interested in long-term investment');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/proposal submitted successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Portfolio Tracking', () => {
    test('displays investment portfolio', () => {
      renderWithRouter(<InvestorDashboard />);
      expect(screen.getByText(/my portfolio/i)).toBeInTheDocument();
    });

    test('shows investment details and status', async () => {
      renderWithRouter(<InvestorDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/total investment/i)).toBeInTheDocument();
        expect(screen.getByText(/active investments/i)).toBeInTheDocument();
        expect(screen.getByText(/pending investments/i)).toBeInTheDocument();
      });
    });

    test('allows viewing investment documents', async () => {
      renderWithRouter(<InvestorDashboard />);
      
      const viewDocumentsButton = screen.getByRole('button', { name: /view documents/i });
      await userEvent.click(viewDocumentsButton);

      await waitFor(() => {
        expect(screen.getByText(/investment documents/i)).toBeInTheDocument();
        expect(screen.getByText(/agreement/i)).toBeInTheDocument();
        expect(screen.getByText(/property deed/i)).toBeInTheDocument();
        expect(screen.getByText(/financial projections/i)).toBeInTheDocument();
      });
    });
  });

  describe('Forum Participation', () => {
    test('displays project discussion forums', () => {
      renderWithRouter(<InvestorDashboard />);
      expect(screen.getByText(/project forums/i)).toBeInTheDocument();
    });

    test('allows posting in forums', async () => {
      renderWithRouter(<InvestorDashboard />);
      
      const forumTopic = screen.getByText(/investment strategies/i);
      await userEvent.click(forumTopic);

      const replyButton = screen.getByRole('button', { name: /reply/i });
      await userEvent.click(replyButton);

      const replyInput = screen.getByLabelText(/your reply/i);
      await userEvent.type(replyInput, 'This is a test reply');
      
      const submitReplyButton = screen.getByRole('button', { name: /submit reply/i });
      await userEvent.click(submitReplyButton);

      await waitFor(() => {
        expect(screen.getByText(/this is a test reply/i)).toBeInTheDocument();
      });
    });
  });
}); 