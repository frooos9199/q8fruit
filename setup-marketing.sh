#!/bin/bash

# 🚀 Quick Setup Script for Q8 Fruit Marketing Launch
# This script helps you set up all necessary configurations

echo "🍎 Q8 Fruit - Marketing Setup Helper"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Facebook Pixel
NEXT_PUBLIC_FB_PIXEL_ID=YOUR_FB_PIXEL_ID

# Firebase Admin (for notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Site URL
NEXT_PUBLIC_SITE_URL=https://www.q8fruit.com

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
EOF
    echo "✅ .env.local file created!"
    echo "⚠️  Please edit .env.local with your actual credentials"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "📱 Next Steps:"
echo "1. Edit .env.local with your actual API keys"
echo "2. Create Google Analytics property at: https://analytics.google.com/"
echo "3. Create Facebook Pixel at: https://business.facebook.com/"
echo "4. Download Firebase service account key"
echo "5. Run: npm run dev"
echo ""
echo "📚 Full guide in MARKETING_STRATEGY.md"
echo ""
echo "🎉 Ready to launch! Good luck! 🚀"
