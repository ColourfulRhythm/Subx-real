const API_BASE_URL = 'http://localhost:3000/api';

export const createInvestor = async (investorData: {
  name: string;
  email: string;
  phone: string;
  bio: string;
  investmentInterests: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/investors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(investorData),
  });

  if (!response.ok) {
    throw new Error('Failed to create investor profile');
  }

  return response.json();
};

export const createDeveloper = async (developerData: {
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  bio: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/developers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(developerData),
  });

  if (!response.ok) {
    throw new Error('Failed to create developer profile');
  }

  return response.json();
}; 