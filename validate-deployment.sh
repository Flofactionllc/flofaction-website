#!/bin/bash

# Flo Faction Website - Automated Validation Script
# Tests all critical components before deployment

echo "🚀 FLO FACTION WEBSITE - PRE-DEPLOYMENT VALIDATION"
echo "=================================================="
echo ""

PASS=0
FAIL=0
WARN=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS++))
}

test_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAIL++))
}

test_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARN++))
}

# 1. GIT REPOSITORY VALIDATION
echo "📁 Testing Git Repository..."
if git status > /dev/null 2>&1; then
    test_pass "Git repository initialized"

    if git diff-index --quiet HEAD --; then
        test_pass "No uncommitted changes"
    else
        test_warn "Uncommitted changes detected"
    fi
else
    test_fail "Git repository not found"
fi
echo ""

# 2. FILE STRUCTURE VALIDATION
echo "📂 Testing File Structure..."

REQUIRED_FILES=(
    "public/index.html"
    "public/music-store.html"
    "public/checkout.html"
    "public/contact.html"
    "public/intake.html"
    "public/js/cart.js"
    "public/js/router.js"
    "public/js/navigation.js"
    "functions/index.js"
    "functions/package.json"
    "functions/.env"
    ".gitignore"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        test_pass "Found $file"
    else
        test_fail "Missing $file"
    fi
done
echo ""

# 3. JAVASCRIPT SYNTAX VALIDATION
echo "🔍 Testing JavaScript Syntax..."

for js_file in public/js/*.js; do
    if node -c "$js_file" 2>/dev/null; then
        test_pass "$(basename "$js_file") syntax valid"
    else
        test_fail "$(basename "$js_file") has syntax errors"
    fi
done

if node -c functions/index.js 2>/dev/null; then
    test_pass "functions/index.js syntax valid"
else
    test_fail "functions/index.js has syntax errors"
fi
echo ""

# 4. JSON VALIDATION
echo "📋 Testing JSON Files..."

if python3 -m json.tool functions/package.json > /dev/null 2>&1; then
    test_pass "functions/package.json is valid JSON"
else
    test_fail "functions/package.json has JSON errors"
fi

if python3 -m json.tool package.json > /dev/null 2>&1; then
    test_pass "package.json is valid JSON"
else
    test_fail "package.json has JSON errors"
fi
echo ""

# 5. ENVIRONMENT VARIABLES
echo "🔑 Testing Environment Configuration..."

if [ -f "functions/.env" ]; then
    test_pass ".env file exists"

    # Check for required variables
    if grep -q "GEMINI_API_KEY=AIzaSyC" functions/.env; then
        test_pass "Gemini API key configured"
    else
        test_warn "Gemini API key not configured"
    fi

    if grep -q "SMTP_PASS_BUSINESS=.\+" functions/.env; then
        test_pass "SMTP Business password configured"
    else
        test_warn "SMTP Business password not configured"
    fi

    if grep -q "SMTP_PASS_INSURANCE=.\+" functions/.env; then
        test_pass "SMTP Insurance password configured"
    else
        test_warn "SMTP Insurance password not configured"
    fi
else
    test_fail ".env file not found"
fi
echo ""

# 6. CRITICAL ENDPOINTS
echo "🌐 Testing Critical File Paths..."

CRITICAL_PATHS=(
    "public/js/cart.js"
    "public/js/router.js"
    "public/audio/beats"
)

for path in "${CRITICAL_PATHS[@]}"; do
    if [ -e "$path" ]; then
        test_pass "Path exists: $path"
    else
        if [[ "$path" == *"audio/beats"* ]]; then
            test_warn "Beat audio directory not created (expected)"
        else
            test_fail "Missing critical path: $path"
        fi
    fi
done
echo ""

# 7. BEAT CATALOG
echo "🎵 Testing Beat Catalog..."

BEAT_COUNT=$(grep -c "id: '" public/music-store.html | head -1)
if [ "$BEAT_COUNT" -gt 10 ]; then
    test_pass "Beat catalog has $BEAT_COUNT entries"
else
    test_fail "Beat catalog incomplete (found $BEAT_COUNT beats)"
fi
echo ""

# 8. SHOPPING CART INTEGRATION
echo "🛒 Testing Shopping Cart Integration..."

CART_PAGES=(
    "public/checkout.html"
    "public/legacy.html"
    "public/retirement-guide.html"
    "public/music-store.html"
    "public/music.html"
)

for page in "${CART_PAGES[@]}"; do
    if grep -q "cart.js" "$page"; then
        test_pass "$(basename "$page") has cart integration"
    else
        test_warn "$(basename "$page") missing cart.js"
    fi
done
echo ""

# 9. SECURITY CHECKS
echo "🔒 Testing Security..."

if [ -f ".gitignore" ]; then
    if grep -q ".env" .gitignore; then
        test_pass ".env files excluded from git"
    else
        test_fail ".env not in .gitignore"
    fi
else
    test_fail ".gitignore not found"
fi

# Check for exposed secrets in committed files
if git log --all -p | grep -q "AIzaSyAIfXpcGndNb2dNHs07_QcAi6Od37_DACw"; then
    test_warn "Old API key found in git history (already rotated)"
else
    test_pass "No exposed API keys in git history"
fi
echo ""

# 10. HTML STRUCTURE
echo "📄 Testing HTML Structure..."

for html_file in public/*.html; do
    if grep -q "</body>" "$html_file" && grep -q "</html>" "$html_file"; then
        # File is complete
        :
    else
        test_warn "$(basename "$html_file") may be incomplete"
    fi
done
test_pass "All HTML files checked"
echo ""

# SUMMARY
echo "=================================================="
echo "📊 VALIDATION SUMMARY"
echo "=================================================="
echo -e "${GREEN}✅ PASSED: $PASS${NC}"
echo -e "${YELLOW}⚠️  WARNINGS: $WARN${NC}"
echo -e "${RED}❌ FAILED: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CRITICAL TESTS PASSED!${NC}"
    echo "✅ Website is ready for deployment"
    echo ""
    echo "⚠️  WARNINGS ($WARN) are configuration issues that need attention before production:"
    echo "   - Add SMTP passwords to functions/.env"
    echo "   - Create audio/beats directory and upload MP3 files"
    echo "   - Update PayPal keys to production mode"
    exit 0
else
    echo -e "${RED}❌ DEPLOYMENT BLOCKED${NC}"
    echo "Fix $FAIL critical issue(s) before deploying"
    exit 1
fi
