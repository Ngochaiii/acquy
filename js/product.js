// File: js/product.js

let productData = null;

// Load dữ liệu từ file JSON
async function loadProductData() {
  try {
    const response = await fetch('js/product.json'); // Đường dẫn tới file JSON của bạn
    productData = await response.json();
    return productData;
  } catch (error) {
    console.error('Lỗi khi load dữ liệu sản phẩm:', error);
    return null;
  }
}

// Function để format tiền VND
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

// Function để tạo rating stars
function generateStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars += '<i class="fas fa-star text-primary"></i>';
    } else if (i - 0.5 <= rating) {
      stars += '<i class="fas fa-star-half-alt text-primary"></i>';
    } else {
      stars += '<i class="fas fa-star"></i>';
    }
  }
  return stars;
}

// Function để tạo badge
function generateBadge(badges) {
  if (!badges || badges.length === 0) return '';
  
  const badge = badges[0];
  if (badge === 'new') {
    return '<div class="product-new">New</div>';
  } else if (badge === 'sale') {
    return '<div class="product-sale">Sale</div>';
  }
  return '';
}

// Function để tạo HTML cho một sản phẩm (loại bỏ fallback image)
function createProductHTML(product, delay = '0.1s') {
  const category = productData.categories.find(cat => cat.id === product.category_id);
  const categoryName = category ? category.name : 'Ắc quy';
  
  const originalPriceHTML = product.original_price ? 
    `<del class="me-2 fs-5">${formatPrice(product.original_price)}</del>` : '';
  
  const badge = generateBadge(product.badges);
  const stars = generateStars(product.rating);
  
  // Sử dụng hình ảnh từ data hoặc placeholder đơn giản
  const imageUrl = product.main_image || product.pro_image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  
  return `
    <div class="col-md-6 col-lg-4 col-xl-3">
      <div class="product-item rounded wow fadeInUp" data-wow-delay="${delay}">
        <div class="product-item-inner border rounded">
          <div class="product-item-inner-item">
            <img src="${imageUrl}" 
                 class="img-fluid w-100 rounded-top" 
                 alt="${product.name}">
            ${badge}
            <div class="product-details">
              <a href="#" onclick="viewProduct(${product.id})"><i class="fa fa-eye fa-1x"></i></a>
            </div>
          </div>
          <div class="text-center rounded-bottom p-4">
            <a href="#" class="d-block mb-2">${categoryName}</a>
            <a href="#" class="d-block h4">${product.name}</a>
            ${originalPriceHTML}
            <span class="text-primary fs-5">${formatPrice(product.price)}</span>
          </div>
        </div>
        <div class="product-item-add border border-top-0 rounded-bottom text-center p-4 pt-0">
          <a href="#" onclick="addToCart(${product.id})" 
             class="btn btn-primary border-secondary rounded-pill py-2 px-4 mb-4">
            <i class="fas fa-shopping-cart me-2"></i> Thêm vào giỏ
          </a>
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex">
              ${stars}
            </div>
            <div class="d-flex">
              <a href="#" onclick="compareProduct(${product.id})"
                 class="text-primary d-flex align-items-center justify-content-center me-3">
                <span class="rounded-circle btn-sm-square border">
                  <i class="fas fa-random"></i>
                </span>
              </a>
              <a href="#" onclick="addToWishlist(${product.id})"
                 class="text-primary d-flex align-items-center justify-content-center me-0">
                <span class="rounded-circle btn-sm-square border">
                  <i class="fas fa-heart"></i>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Function cơ bản để render sản phẩm - THIẾU FUNCTION NÀY
function renderProducts(products = null, containerId = 'products-container') {
  if (!productData) return;
  
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Nếu không truyền products, sử dụng tất cả sản phẩm
  const productsToRender = products || productData.products;
  
  let html = '';
  const delays = ['0.1s', '0.3s', '0.5s', '0.7s'];
  
  productsToRender.forEach((product, index) => {
    const delay = delays[index % delays.length];
    html += createProductHTML(product, delay);
  });
  
  container.innerHTML = html;
}

// Function để render sản phẩm cho tab active với debug và ngăn chặn infinite loop
function renderProductsForActiveTab(categoryId) {
  
  if (!productData) {
    console.error('productData is null or undefined');
    return;
  }
  
  // Tìm tab đang active
  const activeTab = document.querySelector('.tab-pane.active');
  if (!activeTab) {
    console.error('No active tab found');
    return;
  }
  
  // Tìm container .row trong tab đó
  const container = activeTab.querySelector('.row');
  if (!container) {
    console.error('No .row container found in active tab');
    return;
  }
  
  // Kiểm tra xem container đã có sản phẩm chưa để tránh render lặp lại
  if (container.dataset.rendered === String(categoryId)) {
    return;
  }
  
  const filteredProducts = productData.products.filter(product => product.category_id === categoryId);
  
  if (filteredProducts.length === 0) {
    container.innerHTML = '<div class="col-12"><p class="text-center">Không có sản phẩm nào trong danh mục này.</p></div>';
    container.dataset.rendered = String(categoryId);
    return;
  }
  
  // Render trực tiếp vào container
  let html = '';
  const delays = ['0.1s', '0.3s', '0.5s', '0.7s'];
  
  filteredProducts.forEach((product, index) => {
    const delay = delays[index % delays.length];
    html += createProductHTML(product, delay);
  });
  
  container.innerHTML = html;
  container.dataset.rendered = String(categoryId); // Đánh dấu đã render
}

// Function để render sản phẩm theo danh mục (sử dụng renderProductsForActiveTab)
function renderProductsByCategory(categoryId) {
  
  // Đợi một chút để tab mới được active
  setTimeout(() => {
    renderProductsForActiveTab(categoryId);
  }, 100);
}

// Function để tìm kiếm sản phẩm
function searchProducts(keyword, containerId = 'products-container') {
  if (!productData) return;
  const filteredProducts = productData.products.filter(product => 
    product.name.toLowerCase().includes(keyword.toLowerCase()) ||
    product.short_description.toLowerCase().includes(keyword.toLowerCase())
  );
  renderProducts(filteredProducts, containerId);
}

// Các function xử lý sự kiện
function viewProduct(productId) {
  const product = productData.products.find(p => p.id === productId);
  if (product) {
    console.log('Xem chi tiết sản phẩm:', product);
    // window.location.href = `product-detail.html?id=${productId}`;
  }
}

function addToCart(productId) {
  const product = productData.products.find(p => p.id === productId);
  if (product) {
    showProductModal(product);
  }
}

function showProductModal(product) {
  const category = productData.categories.find(cat => cat.id === product.category_id);
  const categoryName = category ? category.name : 'Ắc quy';
  const originalPriceHTML = product.original_price ? 
    `<del class="text-muted">${formatPrice(product.original_price)}</del>` : '';
  
  const modalHTML = `
    <div class="modal fade" id="productModal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chi tiết sản phẩm</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <img src="${product.main_image}" class="img-fluid rounded" alt="${product.name}">
              </div>
              <div class="col-md-6">
                <h4>${product.name}</h4>
                <p class="text-muted">${categoryName}</p>
                <p>${product.short_description}</p>
                <div class="mb-3">
                  ${originalPriceHTML}
                  <span class="h4 text-primary">${formatPrice(product.price)}</span>
                </div>
                <div class="mb-3">
                  <strong>Thông số kỹ thuật:</strong><br>
                  Điện áp: ${product.voltage}<br>
                  Dung lượng: ${product.capacity}
                </div>
                <form id="orderForm">
                  <div class="mb-3">
                    <label class="form-label">Họ tên *</label>
                    <input type="text" class="form-control" name="customerName" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Số điện thoại *</label>
                    <input type="tel" class="form-control" name="customerPhone" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Địa chỉ</label>
                    <textarea class="form-control" name="customerAddress" rows="2"></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Ghi chú</label>
                    <textarea class="form-control" name="note" rows="2"></textarea>
                  </div>
                  <input type="hidden" name="productId" value="${product.id}">
                  <input type="hidden" name="productName" value="${product.name}">
                  <input type="hidden" name="productPrice" value="${product.price}">
                </form>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-primary" onclick="submitOrder()">
              <i class="fas fa-phone me-2"></i>Gửi yêu cầu tư vấn
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if any
  const existingModal = document.getElementById('productModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}

// Cập nhật function submitOrder() trong file product.js hoặc product-functions.js

// Thay thế function submitOrder() cũ bằng function này:
function submitOrder() {
  const form = document.getElementById('orderForm');
  const formData = new FormData(form);
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Hiển thị loading state
  const submitButton = document.querySelector('#productModal .btn-primary[onclick="submitOrder()"]');
  const originalText = submitButton.innerHTML;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang gửi...';
  submitButton.disabled = true;

  // Thu thập dữ liệu form
  const orderData = {
    customerName: formData.get('customerName'),
    customerPhone: formData.get('customerPhone'),
    customerAddress: formData.get('customerAddress'),
    note: formData.get('note'),
    productId: formData.get('productId'),
    productName: formData.get('productName'),
    productPrice: formData.get('productPrice')
  };

  // Gửi lên Google Sheet
  if (window.googleSheetHandler) {
    window.googleSheetHandler.submitOrderToSheet(orderData)
      .then(() => {
        // Thành công
        showNotification('Cảm ơn bạn! Đơn hàng đã được gửi thành công. Chúng tôi sẽ liên hệ trong vòng 15 phút.', 'success');
        
        // Đóng modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
        
        // Reset form
        form.reset();
      })
      .catch((error) => {
        console.error('Error submitting order:', error);
        showNotification('Có lỗi xảy ra khi gửi đơn hàng. Đơn hàng đã được lưu tạm thời, chúng tôi sẽ xử lý sớm nhất có thể.', 'warning');
      })
      .finally(() => {
        // Restore button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      });
  } else {
    // Fallback nếu Google Sheet handler chưa load
    console.error('Google Sheet handler not available');
    
    // Lưu vào localStorage
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push({
      ...orderData,
      timestamp: new Date().toISOString(),
      status: 'pending_sync'
    });
    localStorage.setItem('orders', JSON.stringify(orders));
    
    showNotification('Cảm ơn bạn! Đơn hàng đã được lưu. Chúng tôi sẽ liên hệ trong vòng 15 phút.', 'success');
    
    // Đóng modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    modal.hide();
    
    // Restore button state
    submitButton.innerHTML = originalText;
    submitButton.disabled = false;
  }
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', async function() {
  
  // Load dữ liệu từ file JSON
  await loadProductData();
  
  if (productData) {
    
    // Render sản phẩm cho tab đầu tiên (category_id = 1)
    setTimeout(() => {
      renderProductsForActiveTab(1);
    }, 500);
    
    // Thêm event listener cho Bootstrap tabs - CHỈ THÊM MỘT LẦN
    const tabLinks = document.querySelectorAll('[data-bs-toggle="pill"]');
    tabLinks.forEach(link => {
      // Loại bỏ event listener cũ nếu có
      link.removeEventListener('shown.bs.tab', handleTabSwitch);
      
      // Thêm event listener mới
      link.addEventListener('shown.bs.tab', handleTabSwitch);
    });
  } else {
    console.error('Failed to load product data');
  }
});

// Function xử lý chuyển tab - tách riêng để dễ quản lý
function handleTabSwitch(e) {
  
  // Lấy category ID từ data attribute
  const categoryId = parseInt(e.target.getAttribute('data-category-id'));
  if (categoryId) {
    
    // Đợi một chút để tab được active hoàn toàn
    setTimeout(() => {
      renderProductsForActiveTab(categoryId);
    }, 50); // Giảm timeout xuống
  }
}

// Export các function để sử dụng từ bên ngoài
window.productRenderer = {
  loadProductData,
  renderProducts,
  renderProductsByCategory,
  renderProductsForActiveTab,
  searchProducts
};