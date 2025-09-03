#!/bin/bash

# Manual User Verification Script using Firebase CLI
# This script verifies all users who migrated from Supabase to Firebase

echo "🔄 Starting manual user verification process..."
echo "📧 This will verify all users who migrated from Supabase to Firebase"
echo ""

# List of user UIDs to verify
users=(
    "2V0W6x7SJhZE13HgaH0FIcvk0WF2:omoyinboprecious@gmail.com"
    "3ywHLA6VuTQ0NJi3zGvaELbUdC23:tanimowotaiwo@yahoo.com"
    "5n7D48rDw5MSJAemfJNshqlVb7m1:olugbodeoluwaseyi111@gmail.com"
    "6jEzTJHSm9NvHTU4hI1OzMDw1Zs2:nereeyomi@gmail.com"
    "7m85ElPjxZeDfkqsKBx1tTmZQbq2:verifiedrealtor@focalpointdev.com"
    "978b8LlR9sX0Z1cM3855GB3fLrp2:godundergod100@gmail.com"
    "9zy0O2QDkSbTixOOWaWRNufbcBc2:kingameh2u@gmail.com"
    "BwxSFHSwTLhCA0QXRP6bfXeJWQB3:test@test.com"
    "CbSeeYIfccNwlVFh8nuQBUoyTY32:benjaminchisom1@gmail.com"
    "D3pBo3et2aTbsTDUCioRbKQh5uM2:osujiamuche@gmail.com"
    "EPf3Kejm73OJuOOPffL0lmVJPma2:valentineokoye38@gmail.com"
    "FFmEH6lVq5OFG4ZeQrshJDLTBGA2:thekingezekiel@gmail.com"
    "HB2Ux9NOwASxroTgGFUAlu2KMj82:contact@focalpointprop.com"
    "KpsoddO3gIRmGlSW9d81kt9s07A2:odunright19@gmail.com"
    "PeBOeF2a0BOu1nRuvJsIr5EzJm52:wealthytosin96@gmail.com"
    "PhTZCToijIOc3AYX538Vfp85Rnp2:gloriaunachukwu@gmail.com"
    "SOT8E0tjiTWLfjSDfA0KwGV1r4T2:colourfulrhythmmbe@gmail.com"
    "Sp2PpLm4SBVU843MDZoWaynimf03:rufusoba@hotmail.com"
    "T1TNVFPZjlM7m9GuX0tIeE6k7Al2:thekingezekielacademy@gmail.com"
    "T4Z3hVjn9FRexX7x54v9ruQjBC22:subx@focalpointdev.com"
    "XWNytRv2ilaTJOUD6aLGFOWBxxy2:thekingezekiel1@gmail.com"
    "oPWpRZSrQDVj7t3d3tunG1NScls1:kingkwaoyama@gmail.com"
)

echo "📊 Found ${#users[@]} users to verify"
echo ""

verified_count=0
error_count=0

for user_info in "${users[@]}"; do
    IFS=':' read -r uid email <<< "$user_info"
    
    echo "🔄 Verifying: $email"
    
    # Use Firebase CLI to update user (this is a workaround since CLI doesn't have direct email verification)
    # We'll export, modify, and import the user data
    if firebase auth:export --project subx-825e9 /tmp/temp_user.json > /dev/null 2>&1; then
        # Create a modified user record with emailVerified: true
        cat > /tmp/modified_user.json << EOF
{
  "users": [
    {
      "localId": "$uid",
      "email": "$email",
      "emailVerified": true,
      "passwordHash": "temp_hash",
      "salt": "temp_salt",
      "createdAt": "$(date +%s)000"
    }
  ]
}
EOF
        
        # Import the modified user (this will update the existing user)
        if firebase auth:import --project subx-825e9 /tmp/modified_user.json > /dev/null 2>&1; then
            echo "✅ Verified: $email"
            ((verified_count++))
        else
            echo "❌ Failed to verify: $email"
            ((error_count++))
        fi
        
        # Clean up temp files
        rm -f /tmp/temp_user.json /tmp/modified_user.json
        
        # Small delay to avoid rate limiting
        sleep 0.5
    else
        echo "❌ Failed to export user data for: $email"
        ((error_count++))
    fi
done

echo ""
echo "📈 VERIFICATION SUMMARY:"
echo "✅ Successfully verified: $verified_count users"
echo "❌ Failed to verify: $error_count users"
echo "📊 Total processed: ${#users[@]} users"

if [ $verified_count -gt 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Users are now verified!"
    echo "📧 Users can now:"
    echo "   • Use password reset functionality"
    echo "   • Access all features without email verification prompts"
    echo "   • Receive important notifications"
fi

if [ $error_count -gt 0 ]; then
    echo ""
    echo "⚠️  Some users could not be verified. Please check the errors above."
fi

echo ""
echo "🏁 Verification process completed."
