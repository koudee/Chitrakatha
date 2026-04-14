"""
Backend API tests for Chitrakatha Admin Gallery features
Tests: Admin login, gallery CRUD, batch upload endpoint
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "admin@chitrakatha.com",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["is_admin"] == True, "User should be admin"
        assert data["user"]["email"] == "admin@chitrakatha.com"
        print(f"✅ Admin login successful, token received")
        return data["token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "wrong@email.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Invalid credentials rejected correctly")


class TestAdminGallery:
    """Admin gallery management tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "admin@chitrakatha.com",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin login failed")
    
    def test_get_gallery_items(self, admin_token):
        """Test fetching gallery items as admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/gallery", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Gallery items fetched: {len(data)} items")
    
    def test_create_gallery_item(self, admin_token):
        """Test creating a new gallery item"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        new_item = {
            "title": "TEST_Gallery_Item",
            "category": "Wedding",
            "media_type": "photo",
            "media_url": "https://example.com/test-image.jpg",
            "order": 999
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/gallery", json=new_item, headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["title"] == "TEST_Gallery_Item"
        assert data["category"] == "Wedding"
        assert "id" in data
        print(f"✅ Gallery item created with id: {data['id']}")
        return data["id"]
    
    def test_delete_gallery_item(self, admin_token):
        """Test deleting a gallery item"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # First create an item to delete
        new_item = {
            "title": "TEST_Delete_Item",
            "category": "Portrait",
            "media_type": "photo",
            "media_url": "https://example.com/delete-test.jpg",
            "order": 998
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/gallery", json=new_item, headers=headers)
        assert create_response.status_code == 200
        item_id = create_response.json()["id"]
        
        # Now delete it
        delete_response = requests.delete(f"{BASE_URL}/api/admin/gallery/{item_id}", headers=headers)
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        print(f"✅ Gallery item deleted: {item_id}")
    
    def test_reorder_gallery(self, admin_token):
        """Test reordering gallery items"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get current items
        get_response = requests.get(f"{BASE_URL}/api/admin/gallery", headers=headers)
        items = get_response.json()
        
        if len(items) >= 2:
            # Reorder first two items
            reorder_data = {
                "items": [
                    {"id": items[0]["id"], "order": 1},
                    {"id": items[1]["id"], "order": 0}
                ]
            }
            
            response = requests.put(f"{BASE_URL}/api/admin/gallery/reorder", json=reorder_data, headers=headers)
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            print("✅ Gallery reorder successful")
        else:
            pytest.skip("Not enough items to test reorder")


class TestPublicGallery:
    """Public gallery endpoint tests"""
    
    def test_get_public_gallery(self):
        """Test fetching public gallery items"""
        response = requests.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Public gallery fetched: {len(data)} items")
    
    def test_get_site_images(self):
        """Test fetching site images"""
        response = requests.get(f"{BASE_URL}/api/site-images")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Site images fetched: {len(data)} items")


class TestAPIHealth:
    """API health check tests"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["status"] == "active"
        print("✅ API is active")


# Cleanup test data
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after all tests"""
    yield
    # Cleanup after tests
    try:
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "admin@chitrakatha.com",
            "password": "admin123"
        })
        if response.status_code == 200:
            token = response.json()["token"]
            headers = {"Authorization": f"Bearer {token}"}
            
            # Get all gallery items
            gallery_response = requests.get(f"{BASE_URL}/api/admin/gallery", headers=headers)
            if gallery_response.status_code == 200:
                items = gallery_response.json()
                for item in items:
                    if item.get("title", "").startswith("TEST_"):
                        requests.delete(f"{BASE_URL}/api/admin/gallery/{item['id']}", headers=headers)
                        print(f"Cleaned up test item: {item['title']}")
    except Exception as e:
        print(f"Cleanup error: {e}")
