# Night Snack Delivery App

A full-stack multi-vendor food delivery web application built for hostel environments using Next.js 14, MongoDB, and NextAuth.js.

## 🚀 Features

### Authentication & User Management
- Google OAuth integration with NextAuth.js
- Role switching between buyer and seller
- Admin panel access control

### Buyer Features
- Browse snacks by hostel (Himalaya/Janadhar)
- Shopping cart with real-time stock validation
- Order placement with hostel, room details, and contact number
- Order History: Track all past and current orders with real-time status updates
- Order status tracking (Pending → Confirmed → Delivered)

### Seller Features
- Product management (upload, edit, delete)
- Real-time Order Notifications: Get notified when new orders arrive
- Seller Order Dashboard: View all orders containing your products
- Order status management: Accept orders and mark as delivered
- Automatic stock quantity updates when orders are placed
- Revenue tracking and order statistics

### Admin Features
- Enhanced Admin Panel: Only accessible by configured admin email
- View all orders sorted by hostel and status
- Order Status Management: Update order status with admin controls
- Comprehensive order filtering and statistics
- Revenue tracking across hostels

### Stock Management
- Automatic Stock Updates: Stock quantities decrease when orders are placed
- Stock Validation: Prevents ordering when insufficient stock
- Real-time stock updates on seller dashboard
- Cart validation against current stock levels

### Pricing Features
- Standard delivery charge (₹10) added to all orders
- Clear breakdown of subtotal, delivery charge, and total amount

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd night-snack-delivery
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

4. **Configure Environment Variables**
   \`\`\`env
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/night-snack-delivery

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key

   # Google OAuth Credentials
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Admin Access
   ADMIN_EMAIL=your-admin-email@gmail.com
   NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email@gmail.com
   \`\`\`

5. **Run Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### MongoDB Setup
1. Create a MongoDB Atlas cluster
2. Create a database user
3. Get the connection string
4. Add to `MONGODB_URI` in `.env.local`

### Admin Access
- Set `ADMIN_EMAIL` to your email address
- Only this email will have access to the admin panel
- Admin can update order statuses and view all orders

## 📱 Usage

### For Buyers
1. **Sign in** with Google account
2. **Select hostel** (Himalaya or Janadhar)
3. **Browse products** and add to cart
4. **Place order** with room number, contact number, and payment method
5. **Track orders** in Order History with real-time status updates

### For Sellers
1. **Switch to seller mode** using the toggle
2. **Add products** with images, descriptions, and stock quantities
3. **Manage inventory** and view order notifications
4. **Monitor orders** containing your products in the Seller Orders dashboard
5. **Accept and deliver orders** using the action buttons
6. **Track revenue** and order statistics

### For Admins
1. **Access admin panel** (only available to configured admin email)
2. **View all orders** sorted by hostel and status
3. **Update order status** using dropdown controls
4. **Monitor statistics** across all hostels

## 🔄 Recent Updates

### Fixed Issues
1. **Stock Updates**: Fixed stock quantity updates when orders are placed
2. **Seller Order Management**: Added Accept and Deliver buttons on seller dashboard
3. **Order Placement**: Fixed 500 error when placing orders
4. **Contact Information**: Added contact number field for delivery purposes
5. **Delivery Charges**: Added ₹10 delivery charge to all orders

### New Features
1. **Improved Order Management**: Sellers can now accept and deliver orders
2. **Enhanced Checkout**: Added contact number field for better delivery coordination
3. **Transparent Pricing**: Clear breakdown of subtotal, delivery charge, and total
4. **Real-time Stock Validation**: Prevents ordering unavailable items
5. **Improved Order Details**: More comprehensive order information for all users

## 🚀 Deployment

### Vercel Deployment
1. **Connect to Vercel**
   \`\`\`bash
   vercel
   \`\`\`

2. **Set Environment Variables** in Vercel dashboard:
   - `MONGODB_URI`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `ADMIN_EMAIL`
   - `NEXT_PUBLIC_ADMIN_EMAIL`

3. **Update Google OAuth** redirect URIs to include production URL

4. **Deploy**
   \`\`\`bash
   vercel --prod
   \`\`\`

## 📊 Database Schema

### Collections
- **Users**: User profiles with roles and hostel information
- **Products**: Product listings with stock quantities
- **Orders**: Order details with status tracking and seller notifications

### Key Features
- **Seller Notifications**: Orders track which sellers have been notified
- **Status History**: Complete audit trail of order status changes
- **Contact Information**: Customer contact details for delivery

## 🔒 Security Features

- **Role-based Access Control**: Different interfaces for buyers, sellers, and admin
- **Admin Email Verification**: Only configured admin can access admin panel
- **Input Validation**: All forms include proper validation
- **Stock Consistency**: Prevents overselling

## 🐛 Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure your IP is whitelisted in MongoDB Atlas
2. **Google OAuth**: Check redirect URIs match exactly
3. **Admin Access**: Verify `ADMIN_EMAIL` matches your Google account email
4. **Stock Issues**: Check MongoDB connection is stable

### Development Tips
- Use MongoDB Atlas for easier setup
- Test with multiple user accounts for different roles
- Monitor browser console for any JavaScript errors
- Check Network tab for API request/response details

## 📈 Future Enhancements

- Real-time notifications using WebSockets
- Image upload functionality
- Order rating and review system
- Advanced analytics dashboard
- Mobile app development
- Payment gateway integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
