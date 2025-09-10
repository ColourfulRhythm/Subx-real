# MANUAL DATA ADDITION - JOSEPH ADELEKE
## Last Time Manual Data Entry

### User Details:
- **Email**: josephadeleke253@gmail.com
- **Plot**: Plot 5
- **SQM Purchased**: 1 sqm
- **Amount**: ₦5,000
- **Location**: Ogun State
- **Payment Reference**: JOSEPH_MANUAL_1725911714020

### Steps to Add Data:

#### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com/project/subx-825e9/firestore
- Navigate to Firestore Database

#### 2. Add Investment Record
- Collection: `investments`
- Document ID: (auto-generated)
- Data:
```json
{
  "user_id": "manual_joseph_1725911714020",
  "user_email": "josephadeleke253@gmail.com",
  "project_id": 5,
  "project_title": "Plot 5",
  "sqm_purchased": 1,
  "amount": 5000,
  "location": "Ogun State",
  "payment_reference": "JOSEPH_MANUAL_1725911714020",
  "status": "successful",
  "payment_status": "verified",
  "created_at": "2025-09-09T20:15:14.020Z",
  "updated_at": "2025-09-09T20:15:14.020Z",
  "documents": [
    {
      "name": "Investment Certificate",
      "type": "pdf",
      "signed": false
    },
    {
      "name": "Deed of Sale", 
      "type": "pdf",
      "signed": false
    },
    {
      "name": "Co-ownership Certificate",
      "type": "pdf", 
      "signed": false
    }
  ]
}
```

#### 3. Add Plot Ownership Record
- Collection: `plot_ownership`
- Document ID: (auto-generated)
- Data:
```json
{
  "user_id": "manual_joseph_1725911714020",
  "user_email": "josephadeleke253@gmail.com",
  "plot_id": 5,
  "project_title": "Plot 5",
  "sqm_owned": 1,
  "amount_paid": 5000,
  "status": "Active",
  "payment_reference": "JOSEPH_MANUAL_1725911714020",
  "payment_status": "verified",
  "created_at": "2025-09-09T20:15:14.020Z",
  "updated_at": "2025-09-09T20:15:14.020Z"
}
```

#### 4. Update Project Available SQM
- Collection: `projects`
- Document ID: `5`
- Update field: `available_sqm` (reduce by 1)
- Update field: `updated_at` to current timestamp

### Verification:
After adding the data, Joseph should be able to:
1. Log in with josephadeleke253@gmail.com
2. See his 1 sqm investment in Plot 5 on his dashboard
3. View his investment certificate and documents

### Important Notes:
- This is the LAST TIME we manually add data
- All future purchases will be automatically captured via the Telegram-integrated payment system
- The Telegram bot will notify the group for every new purchase and registration
- No more manual data entry needed!

### Telegram Integration Status:
✅ **ACTIVE** - All future purchases and registrations will automatically trigger Telegram notifications to group -1002635491419
