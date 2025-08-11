#!/usr/bin/env python3
"""
Backend Test Suite for Blog Application Secret Key Authentication System
Tests all authentication endpoints and protected/public routes
"""

import requests
import json
import os
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://d0237854-4105-403e-8079-b69bcc3ded25.preview.emergentagent.com/api"
VALID_SECRET = "my-blog-secret-2024"  # From backend .env
INVALID_SECRET = "wrong-secret-key"

class BlogAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.valid_secret = VALID_SECRET
        self.invalid_secret = INVALID_SECRET
        self.test_results = []
        self.created_post_id = None
        self.created_project_id = None
        
    def log_test(self, test_name, passed, details=""):
        """Log test results"""
        status = "✅ PASS" if passed else "❌ FAIL"
        self.test_results.append(f"{status}: {test_name}")
        if details:
            self.test_results.append(f"   Details: {details}")
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def test_health_check(self):
        """Test basic health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            passed = response.status_code == 200
            self.log_test("Health Check", passed, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False
    
    def test_verify_secret_valid(self):
        """Test /api/verify-secret with valid secret key"""
        try:
            payload = {"blog_secret": self.valid_secret}
            response = requests.post(f"{self.base_url}/verify-secret", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                passed = data.get("valid") == True
                self.log_test("Verify Secret - Valid Key", passed, f"Response: {data}")
            else:
                passed = False
                self.log_test("Verify Secret - Valid Key", passed, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Verify Secret - Valid Key", False, f"Exception: {str(e)}")
            return False
    
    def test_verify_secret_invalid(self):
        """Test /api/verify-secret with invalid secret key"""
        try:
            payload = {"blog_secret": self.invalid_secret}
            response = requests.post(f"{self.base_url}/verify-secret", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                passed = data.get("valid") == False
                self.log_test("Verify Secret - Invalid Key", passed, f"Response: {data}")
            else:
                passed = False
                self.log_test("Verify Secret - Invalid Key", passed, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Verify Secret - Invalid Key", False, f"Exception: {str(e)}")
            return False
    
    def test_public_endpoints(self):
        """Test public endpoints that should work without authentication"""
        endpoints = [
            ("/posts", "GET Posts"),
            ("/projects", "GET Projects"), 
            ("/categories", "GET Categories"),
            ("/tags", "GET Tags")
        ]
        
        all_passed = True
        for endpoint, name in endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                passed = response.status_code == 200
                self.log_test(f"Public Endpoint - {name}", passed, f"Status: {response.status_code}")
                if not passed:
                    all_passed = False
            except Exception as e:
                self.log_test(f"Public Endpoint - {name}", False, f"Exception: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_create_post_valid_secret(self):
        """Test creating a post with valid secret key"""
        try:
            payload = {
                "title": "Test Blog Post for Authentication",
                "content": "This is a comprehensive test post to verify the secret key authentication system is working properly.",
                "excerpt": "Test post for authentication verification",
                "tags": ["test", "authentication", "blog"],
                "category": "Testing",
                "featured_image": None,
                "published": True,
                "blog_secret": self.valid_secret
            }
            
            response = requests.post(f"{self.base_url}/posts", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.created_post_id = data.get("id")
                passed = "id" in data and data.get("title") == payload["title"]
                self.log_test("Create Post - Valid Secret", passed, f"Created post ID: {self.created_post_id}")
            else:
                passed = False
                self.log_test("Create Post - Valid Secret", passed, f"Status: {response.status_code}, Response: {response.text}")
            return passed
        except Exception as e:
            self.log_test("Create Post - Valid Secret", False, f"Exception: {str(e)}")
            return False
    
    def test_create_post_invalid_secret(self):
        """Test creating a post with invalid secret key"""
        try:
            payload = {
                "title": "Test Post - Should Fail",
                "content": "This post should not be created due to invalid secret",
                "excerpt": "Should fail",
                "tags": ["test"],
                "category": "Testing",
                "blog_secret": self.invalid_secret
            }
            
            response = requests.post(f"{self.base_url}/posts", json=payload, timeout=10)
            passed = response.status_code == 401
            self.log_test("Create Post - Invalid Secret", passed, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Create Post - Invalid Secret", False, f"Exception: {str(e)}")
            return False
    
    def test_update_post_valid_secret(self):
        """Test updating a post with valid secret key"""
        if not self.created_post_id:
            self.log_test("Update Post - Valid Secret", False, "No post ID available for testing")
            return False
            
        try:
            payload = {
                "title": "Updated Test Blog Post",
                "content": "This post has been updated to test the authentication system.",
                "excerpt": "Updated test post",
                "tags": ["test", "authentication", "updated"],
                "category": "Testing",
                "featured_image": None,
                "published": True,
                "blog_secret": self.valid_secret
            }
            
            response = requests.put(f"{self.base_url}/posts/{self.created_post_id}", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                passed = data.get("title") == payload["title"]
                self.log_test("Update Post - Valid Secret", passed, f"Updated post title: {data.get('title')}")
            else:
                passed = False
                self.log_test("Update Post - Valid Secret", passed, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Update Post - Valid Secret", False, f"Exception: {str(e)}")
            return False
    
    def test_update_post_invalid_secret(self):
        """Test updating a post with invalid secret key"""
        if not self.created_post_id:
            self.log_test("Update Post - Invalid Secret", False, "No post ID available for testing")
            return False
            
        try:
            payload = {
                "title": "Should Not Update",
                "content": "This should fail",
                "excerpt": "Should fail",
                "tags": ["test"],
                "category": "Testing",
                "blog_secret": self.invalid_secret
            }
            
            response = requests.put(f"{self.base_url}/posts/{self.created_post_id}", json=payload, timeout=10)
            passed = response.status_code == 401
            self.log_test("Update Post - Invalid Secret", passed, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Update Post - Invalid Secret", False, f"Exception: {str(e)}")
            return False
    
    def test_create_project_valid_secret(self):
        """Test creating a project with valid secret key"""
        try:
            payload = {
                "title": "Test AI Project for Authentication",
                "description": "A test project to verify authentication system",
                "content": "Detailed content about this test AI project for authentication verification.",
                "technologies": ["Python", "FastAPI", "MongoDB"],
                "demo_url": "https://example.com/demo",
                "github_url": "https://github.com/test/project",
                "image_url": None,
                "featured": False,
                "blog_secret": self.valid_secret
            }
            
            response = requests.post(f"{self.base_url}/projects", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.created_project_id = data.get("id")
                passed = "id" in data and data.get("title") == payload["title"]
                self.log_test("Create Project - Valid Secret", passed, f"Created project ID: {self.created_project_id}")
            else:
                passed = False
                self.log_test("Create Project - Valid Secret", passed, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Create Project - Valid Secret", False, f"Exception: {str(e)}")
            return False
    
    def test_create_project_invalid_secret(self):
        """Test creating a project with invalid secret key"""
        try:
            payload = {
                "title": "Test Project - Should Fail",
                "description": "Should not be created",
                "content": "This should fail",
                "technologies": ["Test"],
                "blog_secret": self.invalid_secret
            }
            
            response = requests.post(f"{self.base_url}/projects", json=payload, timeout=10)
            passed = response.status_code == 401
            self.log_test("Create Project - Invalid Secret", passed, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Create Project - Invalid Secret", False, f"Exception: {str(e)}")
            return False
    
    def test_update_project_valid_secret(self):
        """Test updating a project with valid secret key"""
        if not self.created_project_id:
            self.log_test("Update Project - Valid Secret", False, "No project ID available for testing")
            return False
            
        try:
            payload = {
                "title": "Updated Test AI Project",
                "description": "Updated test project description",
                "content": "Updated content for the test project.",
                "technologies": ["Python", "FastAPI", "MongoDB", "React"],
                "demo_url": "https://example.com/updated-demo",
                "github_url": "https://github.com/test/updated-project",
                "image_url": None,
                "featured": True,
                "blog_secret": self.valid_secret
            }
            
            response = requests.put(f"{self.base_url}/projects/{self.created_project_id}", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                passed = data.get("title") == payload["title"]
                self.log_test("Update Project - Valid Secret", passed, f"Updated project title: {data.get('title')}")
            else:
                passed = False
                self.log_test("Update Project - Valid Secret", passed, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Update Project - Valid Secret", False, f"Exception: {str(e)}")
            return False
    
    def test_update_project_invalid_secret(self):
        """Test updating a project with invalid secret key"""
        if not self.created_project_id:
            self.log_test("Update Project - Invalid Secret", False, "No project ID available for testing")
            return False
            
        try:
            payload = {
                "title": "Should Not Update",
                "description": "Should fail",
                "content": "Should fail",
                "technologies": ["Test"],
                "blog_secret": self.invalid_secret
            }
            
            response = requests.put(f"{self.base_url}/projects/{self.created_project_id}", json=payload, timeout=10)
            passed = response.status_code == 401
            self.log_test("Update Project - Invalid Secret", passed, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Update Project - Invalid Secret", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_post_valid_secret(self):
        """Test deleting a post with valid secret key (query parameter)"""
        if not self.created_post_id:
            self.log_test("Delete Post - Valid Secret", False, "No post ID available for testing")
            return False
            
        try:
            params = {"blog_secret": self.valid_secret}
            response = requests.delete(f"{self.base_url}/posts/{self.created_post_id}", params=params, timeout=10)
            
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.log_test("Delete Post - Valid Secret", passed, f"Response: {data}")
                # Reset post ID since it's deleted
                self.created_post_id = None
            else:
                self.log_test("Delete Post - Valid Secret", passed, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Delete Post - Valid Secret", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_project_valid_secret(self):
        """Test deleting a project with valid secret key (query parameter)"""
        if not self.created_project_id:
            self.log_test("Delete Project - Valid Secret", False, "No project ID available for testing")
            return False
            
        try:
            params = {"blog_secret": self.valid_secret}
            response = requests.delete(f"{self.base_url}/projects/{self.created_project_id}", params=params, timeout=10)
            
            passed = response.status_code == 200
            if passed:
                data = response.json()
                self.log_test("Delete Project - Valid Secret", passed, f"Response: {data}")
                # Reset project ID since it's deleted
                self.created_project_id = None
            else:
                self.log_test("Delete Project - Valid Secret", passed, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Delete Project - Valid Secret", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_with_invalid_secret(self):
        """Test delete operations with invalid secret key"""
        # Create a temporary post for deletion test
        temp_post_payload = {
            "title": "Temp Post for Delete Test",
            "content": "Temporary post",
            "excerpt": "Temp",
            "tags": ["temp"],
            "category": "Testing",
            "blog_secret": self.valid_secret
        }
        
        try:
            # Create temp post
            response = requests.post(f"{self.base_url}/posts", json=temp_post_payload, timeout=10)
            if response.status_code != 200:
                self.log_test("Delete Post - Invalid Secret", False, "Could not create temp post for testing")
                return False
            
            temp_post_id = response.json().get("id")
            
            # Try to delete with invalid secret
            params = {"blog_secret": self.invalid_secret}
            response = requests.delete(f"{self.base_url}/posts/{temp_post_id}", params=params, timeout=10)
            
            passed = response.status_code == 401
            self.log_test("Delete Post - Invalid Secret", passed, f"Status: {response.status_code}")
            
            # Clean up - delete with valid secret
            if temp_post_id:
                params = {"blog_secret": self.valid_secret}
                requests.delete(f"{self.base_url}/posts/{temp_post_id}", params=params, timeout=10)
            
            return passed
        except Exception as e:
            self.log_test("Delete Post - Invalid Secret", False, f"Exception: {str(e)}")
            return False
    
    def test_get_individual_posts_projects(self):
        """Test getting individual posts and projects by ID (public endpoints)"""
        # First create a post to test retrieval
        temp_post_payload = {
            "title": "Test Post for Individual Retrieval",
            "content": "Testing individual post retrieval",
            "excerpt": "Test retrieval",
            "tags": ["test"],
            "category": "Testing",
            "blog_secret": self.valid_secret
        }
        
        try:
            # Create temp post
            response = requests.post(f"{self.base_url}/posts", json=temp_post_payload, timeout=10)
            if response.status_code != 200:
                self.log_test("GET Individual Post", False, "Could not create temp post for testing")
                return False
            
            temp_post_id = response.json().get("id")
            
            # Test getting individual post (should be public)
            response = requests.get(f"{self.base_url}/posts/{temp_post_id}", timeout=10)
            passed = response.status_code == 200
            self.log_test("GET Individual Post", passed, f"Status: {response.status_code}")
            
            # Clean up
            if temp_post_id:
                params = {"blog_secret": self.valid_secret}
                requests.delete(f"{self.base_url}/posts/{temp_post_id}", params=params, timeout=10)
            
            return passed
        except Exception as e:
            self.log_test("GET Individual Post", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all authentication tests"""
        print("=" * 60)
        print("BLOG APPLICATION BACKEND AUTHENTICATION TESTING")
        print("=" * 60)
        print(f"Backend URL: {self.base_url}")
        print(f"Valid Secret: {self.valid_secret}")
        print("=" * 60)
        
        tests = [
            self.test_health_check,
            self.test_verify_secret_valid,
            self.test_verify_secret_invalid,
            self.test_public_endpoints,
            self.test_create_post_valid_secret,
            self.test_create_post_invalid_secret,
            self.test_update_post_valid_secret,
            self.test_update_post_invalid_secret,
            self.test_create_project_valid_secret,
            self.test_create_project_invalid_secret,
            self.test_update_project_valid_secret,
            self.test_update_project_invalid_secret,
            self.test_delete_post_valid_secret,
            self.test_delete_project_valid_secret,
            self.test_delete_with_invalid_secret,
            self.test_get_individual_posts_projects
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test in tests:
            if test():
                passed_tests += 1
            print("-" * 40)
        
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        for result in self.test_results:
            print(result)
        
        print("=" * 60)
        print(f"TOTAL: {passed_tests}/{total_tests} tests passed")
        success_rate = (passed_tests / total_tests) * 100
        print(f"SUCCESS RATE: {success_rate:.1f}%")
        print("=" * 60)
        
        return passed_tests, total_tests, self.test_results

if __name__ == "__main__":
    tester = BlogAPITester()
    passed, total, results = tester.run_all_tests()
    
    # Exit with appropriate code
    if passed == total:
        print("🎉 ALL TESTS PASSED!")
        exit(0)
    else:
        print(f"⚠️  {total - passed} TESTS FAILED!")
        exit(1)