import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking
} from 'react-native';
import { Card, Button, Icon, Slider } from '@rneui/themed';
import { useAuth } from '../contexts/AuthContext';
import { createInvestment, verifyPaystackPayment } from '../services/api';

const { width } = Dimensions.get('window');

const PropertyDetailsScreen = ({ route, navigation }) => {
  const { property } = route.params;
  const { user } = useAuth();
  const [selectedSqm, setSelectedSqm] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const calculateAmount = () => {
    // Calculate amount based on selected sqm and property price per sqm
    const pricePerSqm = parseInt(property.propertyValue.replace(/[₦,]/g, '')) / property.sqm;
    return selectedSqm * pricePerSqm;
  };

  const handleOwnershipSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to make an investment');
      return;
    }

    const amount = calculateAmount();
    const email = user.email;
    const name = user.displayName || 'User';
    const reference = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      setLoading(true);

      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_live_c6e9456f9a1b1071ed96b977c21f8fae727400e0',
        email: email,
        amount: amount * 100, // Paystack expects amount in kobo
        currency: 'NGN',
        ref: reference,
        label: name,
        callback: function(response) {
          console.log('Payment successful:', response);
          
          // Create investment record
          const investmentData = {
            investorId: user.uid,
            projectTitle: property.title,
            projectId: property.id,
            sqm: selectedSqm,
            amount: amount,
            location: property.location,
            description: property.description,
            paymentReference: reference,
            status: 'active',
            documents: ['Investment Certificate', 'Ownership Deed']
          };

          createInvestment(investmentData)
            .then(() => {
              Alert.alert(
                'Success!',
                `Payment successful! You now own ${selectedSqm} sq.m in ${property.title}!`,
                [
                  {
                    text: 'View Dashboard',
                    onPress: () => navigation.navigate('UserDashboard')
                  }
                ]
              );
            })
            .catch((error) => {
              console.error('Failed to save investment:', error);
              Alert.alert('Error', 'Payment successful but failed to save investment. Please contact support.');
            });
        },
        onClose: function() {
          Alert.alert('Payment Cancelled', 'Payment was cancelled');
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('Payment setup error:', error);
      Alert.alert('Error', 'Failed to setup payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    // Generate and download receipt
    Alert.alert('Download Receipt', 'Receipt download functionality will be implemented');
  };

  const handleDownloadCertificate = () => {
    // Generate and download certificate
    Alert.alert('Download Certificate', 'Certificate download functionality will be implemented');
  };

  const renderPropertyHeader = () => (
    <Card containerStyle={styles.headerCard}>
      <View style={styles.headerContent}>
        <Icon name="home" size={40} color="#007AFF" />
        <View style={styles.headerText}>
          <Text h3 style={styles.propertyTitle}>{property.title}</Text>
          <Text style={styles.propertyLocation}>{property.location}</Text>
        </View>
      </View>
    </Card>
  );

  const renderPropertyDetails = () => (
    <Card containerStyle={styles.detailsCard}>
      <Text h4 style={styles.sectionTitle}>Property Details</Text>
      
      <View style={styles.detailRow}>
        <Icon name="straighten" size={20} color="#666" />
        <Text style={styles.detailLabel}>Total Area:</Text>
        <Text style={styles.detailValue}>{property.sqm} sq.m</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Icon name="attach-money" size={20} color="#666" />
        <Text style={styles.detailLabel}>Total Value:</Text>
        <Text style={styles.detailValue}>{property.propertyValue}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Icon name="description" size={20} color="#666" />
        <Text style={styles.detailLabel}>Description:</Text>
        <Text style={styles.detailValue}>{property.description}</Text>
      </View>
    </Card>
  );

  const renderInvestmentSection = () => (
    <Card containerStyle={styles.investmentCard}>
      <Text h4 style={styles.sectionTitle}>Investment Options</Text>
      
      <View style={styles.sqmSelector}>
        <Text style={styles.sqmLabel}>Select Square Meters:</Text>
        <Text style={styles.sqmValue}>{selectedSqm} sq.m</Text>
        
        <Slider
          value={selectedSqm}
          onValueChange={setSelectedSqm}
          minimumValue={1}
          maximumValue={property.sqm}
          step={1}
          thumbStyle={styles.sliderThumb}
          trackStyle={styles.sliderTrack}
        />
      </View>
      
      <View style={styles.amountDisplay}>
        <Text style={styles.amountLabel}>Investment Amount:</Text>
        <Text style={styles.amountValue}>₦{calculateAmount().toLocaleString()}</Text>
      </View>
      
      <Button
        title="Confirm Ownership"
        onPress={handleOwnershipSubmit}
        loading={loading}
        containerStyle={styles.confirmButton}
        buttonStyle={styles.confirmButtonStyle}
      />
    </Card>
  );

  const renderDocuments = () => (
    <Card containerStyle={styles.documentsCard}>
      <Text h4 style={styles.sectionTitle}>Documents</Text>
      
      <View style={styles.documentList}>
        {property.documents?.map((doc, index) => (
          <TouchableOpacity
            key={index}
            style={styles.documentItem}
            onPress={() => {
              if (doc.name === 'Investment Certificate') {
                handleDownloadCertificate();
              } else if (doc.name === 'Ownership Deed') {
                handleDownloadReceipt();
              }
            }}
          >
            <Icon 
              name={doc.signed ? "check-circle" : "description"} 
              size={24} 
              color={doc.signed ? "#4CAF50" : "#666"} 
            />
            <View style={styles.documentInfo}>
              <Text style={styles.documentName}>{doc.name}</Text>
              <Text style={styles.documentStatus}>
                {doc.signed ? 'Signed' : 'Pending'}
              </Text>
            </View>
            <Icon name="download" size={20} color="#007AFF" />
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      {renderPropertyHeader()}
      {renderPropertyDetails()}
      {renderInvestmentSection()}
      {renderDocuments()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 15,
    borderRadius: 15,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 15,
    flex: 1,
  },
  propertyTitle: {
    color: '#333',
    fontWeight: 'bold',
  },
  propertyLocation: {
    color: '#666',
    fontSize: 16,
    marginTop: 5,
  },
  detailsCard: {
    margin: 15,
    borderRadius: 15,
    elevation: 3,
  },
  sectionTitle: {
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  investmentCard: {
    margin: 15,
    borderRadius: 15,
    elevation: 3,
  },
  sqmSelector: {
    marginBottom: 20,
  },
  sqmLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  sqmValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  sliderThumb: {
    backgroundColor: '#007AFF',
  },
  sliderTrack: {
    backgroundColor: '#e0e0e0',
  },
  amountDisplay: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 5,
  },
  confirmButton: {
    marginTop: 10,
  },
  confirmButtonStyle: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
  },
  documentsCard: {
    margin: 15,
    borderRadius: 15,
    elevation: 3,
  },
  documentList: {
    marginTop: 10,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  documentName: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  documentStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default PropertyDetailsScreen;
