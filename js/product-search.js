// File: js/product-search.js
// Thêm file này vào sau product.js trong HTML

// Biến lưu trữ bộ lọc hiện tại
let currentFilters = {
  priceRange: null,
  keyword: '',
  category: null
};

// Function tìm kiếm theo giá
function filterByPrice(maxPrice) {
  if (!productData) return;
  
  currentFilters.priceRange = maxPrice;
  applyFilters();
}

// Function tìm kiếm theo từ khóa
function searchByKeyword(keyword, categoryFilter = 'All Category') {
  if (!productData) return;
  
  currentFilters.keyword = keyword.toLowerCase();
  currentFilters.category = categoryFilter === 'All Category' ? null : categoryFilter;
  applyFilters();
}

// Function áp dụng tất cả bộ lọc
function applyFilters() {
  if (!productData) return;
  
  let filteredProducts = [...productData.products];
  
  // Lọc theo giá
  if (currentFilters.priceRange && currentFilters.priceRange > 0) {
    // Chuyển đổi giá từ triệu VND
    const maxPriceInVND = currentFilters.priceRange * 10000; // Slider từ 0-500 = 0-5 triệu
    filteredProducts = filteredProducts.filter(p => p.price <= maxPriceInVND);
  }
  
  // Lọc theo từ khóa
  if (currentFilters.keyword) {
    filteredProducts = filteredProducts.filter(product => {
      const searchIn = [
        product.name,
        product.short_description,
        product.capacity,
        product.voltage
      ].join(' ').toLowerCase();
      
      return searchIn.includes(currentFilters.keyword);
    });
  }
  
  // Lọc theo danh mục nếu có
  if (currentFilters.category) {
    const category = productData.categories.find(c => 
      c.name.toLowerCase() === currentFilters.category.toLowerCase()
    );
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category_id === category.id);
    }
  }
  
  // Hiển thị kết quả
  displayFilteredProducts(filteredProducts);
}

// Function hiển thị sản phẩm đã lọc
// Function hiển thị sản phẩm đã lọc
function displayFilteredProducts(products) {
  // Tìm tab đang active
  const activeTab = document.querySelector('.tab-pane.active');
  if (!activeTab) {
    console.error('Không tìm thấy tab active');
    return;
  }
  
  // Tìm container trong tab active
  const container = activeTab.querySelector('.row.g-4');
  if (!container) {
    console.error('Không tìm thấy container');
    return;
  }
  
  console.log(`Hiển thị ${products.length} sản phẩm`);
  
  if (products.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center">
        <p class="h5 text-muted">Không tìm thấy sản phẩm phù hợp</p>
      </div>
    `;
    return;
  }
  
  // Clear và render sản phẩm mới
  container.innerHTML = '';
  let html = '';
  
  products.forEach((product, index) => {
    html += createProductHTML(product, '0.1s');
  });
  
  container.innerHTML = html;
  console.log('Đã cập nhật giao diện với sản phẩm lọc');
}

// Khởi tạo event listeners khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
  
  // 1. Price Range Slider
  const priceSlider = document.getElementById('rangeInput');
  const priceOutput = document.getElementById('amount');
  
  if (priceSlider) {
    // Cập nhật hiển thị giá trị
    priceSlider.addEventListener('input', function() {
      const value = this.value;
      const priceInVND = value * 10000; // 0-500 = 0-5 triệu VND
      priceOutput.textContent = formatPrice(priceInVND);
    });
    
    // Áp dụng bộ lọc khi thả chuột
    priceSlider.addEventListener('change', function() {
      filterByPrice(this.value);
    });
  }
  
  // 2. Search Box trong header
  const headerSearchBtn = document.querySelector('.col-md-4.col-lg-6 .btn-primary');
  if (headerSearchBtn) {
    headerSearchBtn.addEventListener('click', function() {
      const searchInput = this.parentElement.querySelector('input[type="text"]');
      const categorySelect = this.parentElement.querySelector('select');
      
      if (searchInput && categorySelect) {
        searchByKeyword(searchInput.value, categorySelect.value);
      }
    });
    
    // Cho phép tìm kiếm bằng Enter
    const searchInput = document.querySelector('.col-md-4.col-lg-6 input[type="text"]');
    if (searchInput) {
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          const categorySelect = this.parentElement.querySelector('select');
          searchByKeyword(this.value, categorySelect.value);
        }
      });
    }
  }
  
  // 3. Search Box trong trang Shop
  const shopSearchBtn = document.querySelector('#search-icon-1');
  if (shopSearchBtn) {
    shopSearchBtn.addEventListener('click', function() {
      const searchInput = this.previousElementSibling;
      if (searchInput) {
        searchByKeyword(searchInput.value);
      }
    });
    
    // Cho phép tìm kiếm bằng Enter
    const shopSearchInput = document.querySelector('.input-group input[type="search"]');
    if (shopSearchInput) {
      shopSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          searchByKeyword(this.value);
        }
      });
    }
  }
  
  // 4. Xử lý click danh mục sản phẩm (sidebar)
  const categoryLinks = document.querySelectorAll('.product-categories a');
  categoryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const categoryName = this.textContent.trim();
      currentFilters.category = categoryName;
      applyFilters();
    });
  });
  
  // 5. Reset filters button (optional)
  const resetButton = document.createElement('button');
  resetButton.className = 'btn btn-outline-primary w-100 mt-3';
  resetButton.textContent = 'Xóa bộ lọc';
  resetButton.addEventListener('click', function() {
    // Reset tất cả bộ lọc
    currentFilters = {
      priceRange: null,
      keyword: '',
      category: null
    };
    
    // Reset UI
    if (priceSlider) {
      priceSlider.value = 0;
      priceOutput.textContent = '0';
    }
    
    const searchInputs = document.querySelectorAll('input[type="text"], input[type="search"]');
    searchInputs.forEach(input => input.value = '');
    
    // Hiển thị lại tất cả sản phẩm
    if (productData) {
      displayFilteredProducts(productData.products);
    }
  });
  
  // Thêm nút reset vào sau slider giá
  const priceSection = document.querySelector('.price.mb-4');
  if (priceSection) {
    priceSection.appendChild(resetButton);
  }
  
  // 6. Sắp xếp sản phẩm
  const sortSelect = document.getElementById('electronics');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      sortProducts(this.value);
    });
  }
});

// Function sắp xếp sản phẩm
function sortProducts(sortBy) {
  const container = document.querySelector('#tab-5 .row.g-4.product');
  if (!container) return;
  
  // Lấy danh sách sản phẩm hiện tại đang hiển thị
  let products = [];
  const productElements = container.querySelectorAll('.col-lg-4');
  
  if (productElements.length === 0) return;
  
  // Áp dụng filters hiện tại để lấy sản phẩm
  let filteredProducts = [...productData.products];
  
  if (currentFilters.priceRange && currentFilters.priceRange > 0) {
    const maxPriceInVND = currentFilters.priceRange * 10000;
    filteredProducts = filteredProducts.filter(p => p.price <= maxPriceInVND);
  }
  
  if (currentFilters.keyword) {
    filteredProducts = filteredProducts.filter(product => {
      const searchIn = [
        product.name,
        product.short_description,
        product.capacity,
        product.voltage
      ].join(' ').toLowerCase();
      return searchIn.includes(currentFilters.keyword);
    });
  }
  
  // Sắp xếp
  switch(sortBy) {
    case 'audio': // Low to high
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'audi': // High to low
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'opel': // Average Rating
      filteredProducts.sort((a, b) => b.rating - a.rating);
      break;
    case 'saab': // Newness
      filteredProducts.sort((a, b) => {
        const aNew = a.badges && a.badges.includes('new') ? 1 : 0;
        const bNew = b.badges && b.badges.includes('new') ? 1 : 0;
        return bNew - aNew;
      });
      break;
    case 'sab': // Popularity (by reviews count)
      filteredProducts.sort((a, b) => b.reviews_count - a.reviews_count);
      break;
    default: // Default sorting (by ID)
      filteredProducts.sort((a, b) => a.id - b.id);
  }
  
  displayFilteredProducts(filteredProducts);
}

// Export functions để sử dụng từ bên ngoài
window.productSearch = {
  filterByPrice,
  searchByKeyword,
  applyFilters,
  sortProducts
};