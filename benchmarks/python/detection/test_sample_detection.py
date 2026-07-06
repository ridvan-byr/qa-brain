import pytest
from selenium import webdriver

class TestSampleDetection:
    @pytest.fixture(scope="function")
    def driver(self):
        driver = webdriver.Chrome()
        yield driver
        driver.quit()

    def test_search_verification(self, driver):
        driver.get("https://example.com/search")
        assert "Search" in driver.title
