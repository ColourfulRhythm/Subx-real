import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

describe('App Component', () => {
  test('renders landing page by default', () => {
    render(<App />);
    const ownershipTexts = screen.getAllByText(/Real Estate Ownership/i);
    expect(ownershipTexts.length).toBeGreaterThan(0);
    expect(screen.getByText(/Made Simple/i)).toBeInTheDocument();
  });

  test('renders signup form fields', async () => {
    render(<App />);
    
    // Navigate to developer signup
    const developerButton = screen.getByText(/Get Started as Developer/i);
    fireEvent.click(developerButton);
    
    // Wait for form to be visible
    const firstNameLabel = await screen.findByLabelText(/First Name/i);
    expect(firstNameLabel).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
  });

  test('renders investor signup form fields', async () => {
    render(<App />);
    
    // Navigate to investor signup
    const investorButton = screen.getByText(/Get Started as Investor/i);
    fireEvent.click(investorButton);
    
    // Wait for form to be visible
    const firstNameLabel = await screen.findByLabelText(/First Name/i);
    expect(firstNameLabel).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Investment Focus/i)).toBeInTheDocument();
  });
});

describe('LandingPage Component', () => {
  test('renders developer and investor signup buttons', () => {
    render(<App />);
    expect(screen.getByText(/Get Started as Developer/i)).toBeInTheDocument();
    expect(screen.getByText(/Get Started as Investor/i)).toBeInTheDocument();
  });
});

describe('DeveloperSignup Component', () => {
  test('renders signup form fields', () => {
    render(<App />);
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Website/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument();
  });
});

describe('InvestorSignup Component', () => {
  test('renders signup form fields', () => {
    render(<App />);
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Investment Focus/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Investment Amount/i)).toBeInTheDocument();
  });
}); 