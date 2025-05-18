const API_BASE_URL = 'http://localhost:3001/api';

export const createBuyer = async (buyerData: {
  name: string;
  email: string;
  phone: string;
  bio: string;
  preferredLocations: string[];
  propertyTypes: string[];
  budget: number;
  experience: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/buyers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buyerData),
  });

  if (!response.ok) {
    throw new Error('Failed to create buyer profile');
  }

  return response.json();
};

export const getProperties = async () => {
  const response = await fetch(`${API_BASE_URL}/properties`);
  if (!response.ok) {
    throw new Error('Failed to fetch properties');
  }
  return response.json();
};

export const expressInterest = async (propertyId: string, buyerId: string) => {
  const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/interest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ buyerId }),
  });

  if (!response.ok) {
    throw new Error('Failed to express interest');
  }

  return response.json();
}; 