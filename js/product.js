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

// Function để tạo HTML cho một sản phẩm
function createProductHTML(product, delay = '0.1s') {
  const category = productData.categories.find(cat => cat.id === product.category_id);
  const categoryName = category ? category.name : 'Ắc quy';
  
  const originalPriceHTML = product.original_price ? 
    `<del class="me-2 fs-5">${formatPrice(product.original_price)}</del>` : '';
  
  const badge = generateBadge(product.badges);
  const stars = generateStars(product.rating);
  
  return `
    <div class="col-md-6 col-lg-4 col-xl-3">
      <div class="product-item rounded wow fadeInUp" data-wow-delay="${delay}">
        <div class="product-item-inner border rounded">
          <div class="product-item-inner-item">
            <img src="${product.main_image}" class="img-fluid w-100 rounded-top" alt="${product.name}">
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

// Function để render tất cả sản phẩm
function renderProducts(products = null, containerId = 'products-container') {
  if (!productData) {
    console.error('Dữ liệu sản phẩm chưa được load');
    return;
  }
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container với id "${containerId}" không tồn tại`);
    return;
  }
  
  const productsToRender = products || productData.products;
  let html = '';
  const delays = ['0.1s', '0.3s', '0.5s', '0.7s'];
  
  productsToRender.forEach((product, index) => {
    const delay = delays[index % delays.length];
    html += createProductHTML(product, delay);
  });
  
  container.innerHTML = html;
}

// Function để render sản phẩm theo danh mục
function renderProductsByCategory(categoryId, containerId = 'products-container') {
  if (!productData) return;
  const filteredProducts = productData.products.filter(product => product.category_id === categoryId);
  renderProducts(filteredProducts, containerId);
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
    console.log('Thêm vào giỏ hàng:', product);
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  }
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', async function() {
  // Load dữ liệu từ file JSON
  await loadProductData();
  
  if (productData) {
    // Render sản phẩm
    const productContainer = document.querySelector('#tab-1 .row');
    if (productContainer) {
      productContainer.id = 'products-container';
      renderProducts();
    }
  }
});

// Export các function
window.productRenderer = {
  loadProductData,
  renderProducts,
  renderProductsByCategory,
  searchProducts
};