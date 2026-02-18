import requests
import sys
import json
from datetime import datetime, timezone, timedelta

class ChitrakathaAPITester:
    def __init__(self, base_url="https://multi-page-site-4.preview.emergentagent.com"):
        self.base_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.errors = []
        print(f"🚀 Starting API tests for: {self.base_url}")

    def log_result(self, test_name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name}: {details}")
            self.errors.append(f"{test_name}: {details}")
        
    def run_test(self, name, method, endpoint, expected_status, data=None, auth=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.log_result(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                self.log_result(name, False, error_msg)
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log_result(name, False, f"Network error: {str(e)}")
            return False, {}
        except Exception as e:
            self.log_result(name, False, f"Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_register_user(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@chitrakatha.com",
            "password": "TestPass123!",
            "phone": "+91 9876543210"
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, user_data)
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"🔑 Got authentication token for user: {response['user']['name']}")
            return True
        return False

    def test_login_user(self):
        """Test user login with the registered user"""
        # Try to login with a test user
        login_data = {
            "email": "test@chitrakatha.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        if success and 'token' in response:
            return True
        
        # If login fails, user might not exist, try creating one
        register_data = {
            "name": "Test User",
            "email": "test@chitrakatha.com", 
            "password": "TestPass123!"
        }
        
        success, response = self.run_test("Create Test User for Login", "POST", "auth/register", 200, register_data)
        if success:
            # Now try login again
            success, response = self.run_test("User Login Retry", "POST", "auth/login", 200, login_data)
            if success and 'token' in response:
                self.token = response['token']
                self.user_id = response['user']['id']
                return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        return self.run_test("Get Current User", "GET", "auth/me", 200, auth=True)

    def test_dashboard_overview(self):
        """Test dashboard overview"""
        return self.run_test("Dashboard Overview", "GET", "dashboard/overview", 200, auth=True)

    def test_create_project(self):
        """Test creating a project"""
        project_data = {
            "title": "Test Wedding Project",
            "event_type": "Wedding",
            "event_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "package_type": "Cinematic"
        }
        
        success, response = self.run_test("Create Project", "POST", "projects", 200, project_data, auth=True)
        if success and 'id' in response:
            self.project_id = response['id']
            return True
        return False

    def test_get_projects(self):
        """Test getting user projects"""
        return self.run_test("Get Projects", "GET", "projects", 200, auth=True)

    def test_create_booking(self):
        """Test creating a booking"""
        booking_data = {
            "package_name": "Premium Cinematic",
            "package_price": 120000,
            "event_date": (datetime.now() + timedelta(days=45)).isoformat()
        }
        
        success, response = self.run_test("Create Booking", "POST", "bookings", 200, booking_data, auth=True)
        if success and 'id' in response:
            self.booking_id = response['id']
            return True
        return False

    def test_get_bookings(self):
        """Test getting user bookings"""
        return self.run_test("Get Bookings", "GET", "bookings", 200, auth=True)

    def test_get_gallery(self):
        """Test getting gallery items (public endpoint)"""
        return self.run_test("Get Gallery", "GET", "gallery", 200)

    def test_create_gallery_item(self):
        """Test creating a gallery item"""
        gallery_data = {
            "title": "Test Wedding Photo",
            "category": "Wedding", 
            "media_type": "photo",
            "media_url": "https://images.unsplash.com/photo-1724138009317-04f47b288945?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwY291cGxlJTIwcG9ydHJhaXQlMjBlbW90aW9ufGVufDB8fHx8MTc3MTQwNzE4MXww&ixlib=rb-4.1.0&q=85",
            "thumbnail_url": "https://images.unsplash.com/photo-1724138009317-04f47b288945?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwY291cGxlJTIwcG9ydHJhaXQlMjBlbW90aW9ufGVufDB8fHx8MTc3MTQwNzE4MXww&ixlib=rb-4.1.0&q=85"
        }
        
        return self.run_test("Create Gallery Item", "POST", "gallery", 200, gallery_data)

    def test_auth_protection(self):
        """Test that protected endpoints require authentication"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, _ = self.run_test("Protected Endpoint (No Auth)", "GET", "dashboard/overview", 401, auth=True)
        
        # Restore token
        self.token = temp_token
        return success

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print(f"\n🧪 Testing Chitrakatha API at {datetime.now()}")
        print("=" * 60)
        
        # Test API availability
        if not self.test_api_root()[0]:
            print("❌ API not accessible. Stopping tests.")
            return self.get_summary()

        # Test authentication flow
        if not self.test_register_user():
            print("⚠️ Registration failed, trying login...")
            if not self.test_login_user():
                print("❌ Authentication failed. Stopping tests.")
                return self.get_summary()

        # Test protected endpoints with authentication
        self.test_get_current_user()
        self.test_dashboard_overview()
        
        # Test project management
        self.test_create_project()
        self.test_get_projects()
        
        # Test booking management
        self.test_create_booking()
        self.test_get_bookings()
        
        # Test gallery (public)
        self.test_get_gallery()
        self.test_create_gallery_item()
        
        # Test authentication protection
        self.test_auth_protection()
        
        return self.get_summary()

    def get_summary(self):
        """Get test summary"""
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.errors:
            print(f"\n❌ Failed Tests ({len(self.errors)}):")
            for error in self.errors:
                print(f"   • {error}")
        else:
            print("🎉 All tests passed!")
            
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return {
            'total_tests': self.tests_run,
            'passed_tests': self.tests_passed,
            'failed_tests': self.tests_run - self.tests_passed,
            'success_rate': success_rate,
            'errors': self.errors
        }

def main():
    """Main function to run tests"""
    tester = ChitrakathaAPITester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    exit_code = 0 if results['failed_tests'] == 0 else 1
    return exit_code

if __name__ == "__main__":
    sys.exit(main())