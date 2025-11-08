#!/bin/bash

# Script to set up the private key file
# Run with: bash setup-private-key.sh

echo "🔑 Setting up private key file..."
echo ""

# Create private.key file
cat > private.key << 'EOF'
-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIIq7AvSyap022BGGlXzKeIywsxJAwt0m2iP1f4NobVNQ
-----END PRIVATE KEY-----
EOF

# Set secure permissions
chmod 600 private.key

echo "✅ Private key file created: private.key"
echo "🔒 Permissions set to 600 (owner read/write only)"
echo ""
echo "📋 Your wallet configuration:"
echo "  Wallet Address: https://ilp.interledger-test.dev/eb37db34"
echo "  Key ID: e2903c1f-a02c-4ee2-aa8d-c2ea0d064180"
echo ""
echo "🚀 Next steps:"
echo "  1. Run: node test-connection.js"
echo "  2. Check out: QUICKSTART.md"
echo ""

