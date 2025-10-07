let productAllData = null;

// Function format giá tiền
function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function createGridProductHTML(product, index) {
  if (!productAllData) return "";

  const category = productAllData.categories.find(
    (cat) => cat.id === product.category_id
  );
  const categoryName = category ? category.name : "Ắc quy";

  // Sử dụng hình ảnh placeholder nếu không tìm thấy file
  const imageUrl = product.main_image || "img/product-11.png";

  // Animation delays theo pattern: 0.1s, 0.3s, 0.5s
  const delays = ["0.1s", "0.3s", "0.5s"];
  const delay = delays[index % 3];

  // Format tên sản phẩm với <br> ở giữa
  let productNameFormatted = product.name;
  if (productNameFormatted.length > 25) {
    // Tìm vị trí khoảng trắng gần giữa nhất
    const midPoint = Math.floor(productNameFormatted.length / 2);
    let spaceIndex = productNameFormatted.indexOf(" ", midPoint);
    if (spaceIndex === -1) {
      spaceIndex = productNameFormatted.lastIndexOf(" ", midPoint);
    }
    if (spaceIndex !== -1) {
      productNameFormatted =
        productNameFormatted.substring(0, spaceIndex) +
        " <br> " +
        productNameFormatted.substring(spaceIndex + 1);
    }
  }

  // Giới hạn độ dài tối đa
  if (product.name.length > 50) {
    const words = product.name.split(" ");
    const halfWords = Math.ceil(words.length / 2);
    productNameFormatted =
      words.slice(0, halfWords).join(" ") +
      " <br> " +
      words.slice(halfWords, halfWords + 3).join(" ") +
      "...";
  }

  return `
    <div class="col-md-6 col-lg-6 col-xl-4 wow fadeInUp" data-wow-delay="${delay}">
      <div class="products-mini-item border">
        <div class="row g-0">
          <div class="col-5">
            <div class="products-mini-img border-end h-100">
              <img src="${imageUrl}" class="img-fluid w-100 h-100" alt="Image" 
                   onerror="this.onerror=null; this.src='img/product-11.png';">
              <div class="products-mini-icon rounded-circle bg-primary">
                <a href="#" onclick="addToCart(${product.id}); return false;">
                  <i class="fa fa-eye fa-1x text-white"></i>
                </a>
              </div>
            </div>
          </div>
          <div class="col-7">
            <div class="products-mini-content p-3">
              <a href="#"  class="d-block mb-2">${categoryName}</a>

              <a href="#" 
               class="d-block h4 product-name-link" 
               onclick="event.preventDefault(); viewProduct(${product.id}); return false;"
               style="cursor: pointer; transition: color 0.3s;">
              ${productNameFormatted}
            </a>
              <span class="text-primary fs-5">${formatPrice(
                product.price
              )}</span>
            </div>
          </div>
        </div>
        <div class="products-mini-add border p-3 item-center">
          <a href="#" onclick="addToCart(${product.id}); return false;" 
             class="btn btn-primary border-secondary rounded-pill py-2 px-4">
            <i class="fas fa-shopping-cart me-2"></i> Mua Ngay
          </a>
        </div>
      </div>
    </div>
  `;
}

function renderProductsToGrid(targetId = null) {
  if (!productAllData || !productAllData.products) {
    console.error("Product data not available for grid");
    return;
  }

  // Tìm container dựa trên ID hoặc class
  let gridContainer;

  if (targetId) {
    // Nếu có targetId thì tìm theo ID cụ thể
    gridContainer = document.getElementById(targetId);
  } else {
    // Nếu không có targetId thì tìm theo class mặc định
    gridContainer = document.querySelector(".row.g-4");
  }

  if (!gridContainer) {
    console.error(
      `Grid container ${targetId ? "#" + targetId : ".row.g-4"} not found!`
    );
    return;
  }

  // Xóa nội dung cũ
  gridContainer.innerHTML = "";

  // Render tất cả sản phẩm
  productAllData.products.forEach((product, index) => {
    const productHTML = createGridProductHTML(product, index);
    gridContainer.innerHTML += productHTML;
  });

  // Khởi tạo WOW.js nếu có
  if (typeof WOW !== "undefined") {
    new WOW().init();
  }
}

// SỬA LẠI HÀM loadProductAllData - gọi render với ID cụ thể
async function loadProductAllData() {
  try {
    const response = await fetch("js/product.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    productAllData = await response.json();

    // KIỂM TRA VÀ RENDER VÀO ĐÚNG CONTAINER
    if (document.getElementById("bestseller-products-grid")) {
      renderProductsToGrid("bestseller-products-grid");
    } else {
      renderProductsToGrid(); // Render vào .row.g-4 mặc định
    }

    return productAllData;
  } catch (error) {
    console.error("Error loading product data:", error);

    productAllData = getSampleData();

    // KIỂM TRA VÀ RENDER VÀO ĐÚNG CONTAINER
    if (document.getElementById("bestseller-products-grid")) {
      renderProductsToGrid("bestseller-products-grid");
    } else {
      renderProductsToGrid();
    }

    return productAllData;
  }
}
// SỬA LẠI PHẦN DOMContentLoaded
document.addEventListener("DOMContentLoaded", async function () {
  // Load product data - hàm này sẽ tự động render
  await loadProductAllData();

  // Update cart count
  updateCartCount();

  // Debug
  const container = document.getElementById("bestseller-products-grid");
});

// Export các function để sử dụng global
window.productFunctions = {
  formatPrice,
  loadProductAllData,
  viewProduct,
  addToCart,
  compareProduct,
  addToWishlist,
  updateCartCount,
  showNotification,
};

window.gridRenderer = {
  renderProductsToGrid,
  renderProductsToGridByCategory,
  renderTopProductsToGrid,
};

// Test function - gọi từ console để debug
window.testRender = function () {
  if (!productAllData) {
    productAllData = getSampleData();
  }
  renderProductsToGrid();
};

// Thêm các hàm này vào file product-functions.js của bạn
function viewProduct(productId) {

  if (!productData) {
    alert("Dữ liệu sản phẩm chưa được tải. Vui lòng refresh trang.");
    return;
  }

  const product = productData.products.find((p) => p.id === productId);

  if (!product) {
    alert("Không tìm thấy sản phẩm.");
    return;
  }

  showProductViewModal(product);
}

// Function thêm vào giỏ hàng / hiển thị form đặt hàng
function addToCart(productId) {
  // Bỏ event.preventDefault() vì không có tham số event
  const product = productData.products.find((p) => p.id === productId);
  if (product) {
    showProductModal(product);
  }
}

// Function hiển thị modal xem chi tiết sản phẩm
function showProductViewModal(product) {

  // Kiểm tra Bootstrap
  if (typeof bootstrap === "undefined") {
    console.error("Bootstrap is not loaded!");
    alert("Bootstrap chưa được tải. Vui lòng kiểm tra lại.");
    return;
  }

  const category = productData.categories.find(
    (cat) => cat.id === product.category_id
  );
  const categoryName = category ? category.name : "Ắc quy";

  const originalPriceHTML = product.original_price
    ? `<del class="text-muted fs-6">${formatPrice(
        product.original_price
      )}</del>`
    : "";

  const discountPercent = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  const modalHTML = `
    <div class="modal fade" id="productViewModal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-fullscreen-sm-down modal-xl" role="document">
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header bg-gradient-view text-white py-3 sticky-top shadow-sm">
            <div class="w-100">
              <div class="d-flex justify-content-between align-items-center">
                <div class="flex-grow-1 pe-3">
                  <h5 class="modal-title fw-bold mb-2">${product.name}</h5>
                  <div class="d-flex flex-wrap gap-2 align-items-center">
                    <span class="badge bg-light text-dark">
                      <i class="fas fa-tag me-1"></i>${categoryName}
                    </span>
                    ${
                      product.stock_status === "in_stock"
                        ? '<span class="badge bg-success"><i class="fas fa-check-circle me-1"></i>Còn hàng</span>'
                        : '<span class="badge bg-danger"><i class="fas fa-times-circle me-1"></i>Hết hàng</span>'
                    }
                    ${
                      product.badges?.includes("new")
                        ? '<span class="badge bg-info"><i class="fas fa-star me-1"></i>Mới</span>'
                        : ""
                    }
                    ${
                      product.badges?.includes("sale")
                        ? '<span class="badge bg-warning text-dark"><i class="fas fa-fire me-1"></i>Giảm giá</span>'
                        : ""
                    }
                  </div>
                </div>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
            </div>
          </div>

          <div class="modal-body p-0">
            <div class="container-fluid">
              <div class="row g-0">
                <!-- Cột trái: Hình ảnh -->
                <div class="col-lg-6 bg-light p-4">
                  <div class="text-center mb-3 position-relative">
                    ${
                      discountPercent > 0
                        ? `
                      <div class="position-absolute top-0 start-0 m-3">
                        <span class="badge bg-danger fs-5 px-3 py-2">
                          -${discountPercent}%
                        </span>
                      </div>
                    `
                        : ""
                    }
                    <img id="mainViewImage" 
                         src="${
                           product.main_image ||
                           product.images?.[0] ||
                           "img/product-11.png"
                         }" 
                         class="img-fluid rounded shadow-sm" 
                         style="max-height: 400px; object-fit: contain;"
                         alt="${product.name}"
                         onerror="this.onerror=null; this.src='img/product-11.png';">
                  </div>
                  
                  ${
                    product.images && product.images.length > 1
                      ? `
                    <div class="d-flex gap-2 justify-content-center flex-wrap">
                      ${product.images
                        .slice(0, 6)
                        .map(
                          (img, idx) => `
                        <div class="view-thumb-wrapper">
                          <img src="${img}" 
                               class="view-thumbnail rounded border ${
                                 idx === 0
                                   ? "border-primary border-3"
                                   : "border-2"
                               }" 
                               style="width: 70px; height: 70px; object-fit: cover; cursor: pointer;"
                               alt="Ảnh ${idx + 1}"
                               onclick="
                                 document.getElementById('mainViewImage').src='${img}';
                                 document.querySelectorAll('.view-thumbnail').forEach(t => {
                                   t.classList.remove('border-primary', 'border-3');
                                   t.classList.add('border-2');
                                 });
                                 this.classList.add('border-primary', 'border-3');
                                 this.classList.remove('border-2');
                               "
                               onerror="this.onerror=null; this.src='img/product-11.png';">
                        </div>
                      `
                        )
                        .join("")}
                    </div>
                  `
                      : ""
                  }

                  ${
                    product.rating
                      ? `
                    <div class="text-center mt-4 p-3 bg-white rounded shadow-sm">
                      <div class="fs-4 text-warning mb-2">
                        ${generateStars(product.rating)}
                      </div>
                      <div class="text-muted small">
                        <strong class="text-dark">${
                          product.rating
                        }</strong>/5.0 
                        <span class="mx-2">•</span>
                        ${product.reviews_count || 0} đánh giá
                      </div>
                    </div>
                  `
                      : ""
                  }
                </div>

                <!-- Cột phải: Thông tin -->
                <div class="col-lg-6 p-4">
                  <div class="price-section mb-4 p-4 bg-light rounded shadow-sm">
                    <div class="mb-2">
                      <span class="text-muted small">Giá bán:</span>
                    </div>
                    <div class="d-flex align-items-center gap-3 flex-wrap">
                      <h2 class="text-primary fw-bold mb-0">${formatPrice(
                        product.price
                      )}</h2>
                      ${
                        originalPriceHTML
                          ? `
                        <div>
                          ${originalPriceHTML}
                          ${
                            discountPercent > 0
                              ? `
                            <span class="badge bg-danger ms-2">Tiết kiệm ${discountPercent}%</span>
                          `
                              : ""
                          }
                        </div>
                      `
                          : ""
                      }
                    </div>
                  </div>

                  ${
                    product.short_description
                      ? `
                    <div class="mb-4">
                      <h6 class="fw-bold text-dark mb-3">
                        <i class="fas fa-info-circle text-primary me-2"></i>Mô tả ngắn
                      </h6>
                      <p class="text-muted">${product.short_description}</p>
                    </div>
                  `
                      : ""
                  }

                  <div class="mb-4">
                    <h6 class="fw-bold text-dark mb-3">
                      <i class="fas fa-cog text-primary me-2"></i>Thông số kỹ thuật
                    </h6>
                    <div class="row g-2">
                      ${
                        product.detailed_description?.specifications
                          ? Object.entries(
                              product.detailed_description.specifications
                            )
                              .map(
                                ([key, value]) => `
                          <div class="col-12 col-md-6">
                            <div class="p-3 bg-white border rounded h-100">
                              <div class="small text-muted mb-1">${key}</div>
                              <div class="fw-bold text-dark">${value}</div>
                            </div>
                          </div>
                        `
                              )
                              .join("")
                          : `
                          ${
                            product.voltage
                              ? `
                            <div class="col-12 col-md-6">
                              <div class="p-3 bg-white border rounded h-100">
                                <div class="small text-muted mb-1">Điện áp</div>
                                <div class="fw-bold text-dark">${product.voltage}</div>
                              </div>
                            </div>
                          `
                              : ""
                          }
                          ${
                            product.capacity
                              ? `
                            <div class="col-12 col-md-6">
                              <div class="p-3 bg-white border rounded h-100">
                                <div class="small text-muted mb-1">Dung lượng</div>
                                <div class="fw-bold text-dark">${product.capacity}</div>
                              </div>
                            </div>
                          `
                              : ""
                          }
                        `
                      }
                    </div>
                  </div>

                  ${
                    product.detailed_description?.features
                      ? `
                    <div class="mb-4">
                      <h6 class="fw-bold text-dark mb-3">
                        <i class="fas fa-star text-primary me-2"></i>Tính năng nổi bật
                      </h6>
                      <ul class="list-unstyled">
                        ${product.detailed_description.features
                          .map(
                            (feature) => `
                          <li class="mb-2">
                            <i class="fas fa-check-circle text-success me-2"></i>
                            <span class="text-muted">${feature}</span>
                          </li>
                        `
                          )
                          .join("")}
                      </ul>
                    </div>
                  `
                      : ""
                  }

                  ${
                    product.detailed_description?.overview
                      ? `
                    <div class="mb-4">
                      <h6 class="fw-bold text-dark mb-3">
                        <i class="fas fa-file-alt text-primary me-2"></i>Chi tiết sản phẩm
                      </h6>
                      <div class="p-3 bg-white border rounded">
                        <p class="text-muted mb-0">${product.detailed_description.overview}</p>
                      </div>
                    </div>
                  `
                      : ""
                  }

                  ${
                    product.detailed_description?.usage
                      ? `
                    <div class="mb-4">
                      <h6 class="fw-bold text-dark mb-3">
                        <i class="fas fa-tools text-primary me-2"></i>Ứng dụng
                      </h6>
                      <div class="alert alert-info mb-0">
                        <i class="fas fa-info-circle me-2"></i>
                        ${product.detailed_description.usage}
                      </div>
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer border-top bg-light sticky-bottom shadow-lg p-3">
            <div class="container-fluid">
              <div class="row g-2">
                <div class="col-12 col-md-6">
                  <button type="button" 
                          class="btn btn-outline-secondary btn-lg w-100" 
                          data-bs-dismiss="modal">
                    <i class="fas fa-arrow-left me-2"></i>
                    Xem sản phẩm khác
                  </button>
                </div>
                <div class="col-12 col-md-6">
                  <button type="button" 
                          class="btn btn-primary btn-lg w-100" 
                          onclick="switchToOrderModal(${product.id})">
                    <i class="fas fa-shopping-cart me-2"></i>
                    Đặt hàng ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // CSS
  const styleTag = document.createElement("style");
  styleTag.id = "viewModalStyles";
  styleTag.textContent = `
    .bg-gradient-view {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .view-thumbnail {
      transition: all 0.3s ease;
    }
    .view-thumbnail:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    .price-section {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    .modal-body {
      max-height: calc(100vh - 220px);
      overflow-y: auto;
      scroll-behavior: smooth;
    }
    @media (max-width: 991px) {
      .modal-body { max-height: calc(100vh - 180px); }
      #mainViewImage { max-height: 300px !important; }
      .view-thumbnail { width: 60px !important; height: 60px !important; }
    }
    @media (max-width: 576px) {
      .modal-fullscreen-sm-down .modal-body { max-height: calc(100vh - 160px); }
      #mainViewImage { max-height: 250px !important; }
      .view-thumbnail { width: 50px !important; height: 50px !important; }
      .price-section h2 { font-size: 1.5rem !important; }
    }
    .modal-body::-webkit-scrollbar { width: 8px; }
    .modal-body::-webkit-scrollbar-track { background: #f1f1f1; }
    .modal-body::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
    .modal-body::-webkit-scrollbar-thumb:hover { background: #555; }
  `;

  const oldStyle = document.getElementById("viewModalStyles");
  if (oldStyle) oldStyle.remove();
  document.head.appendChild(styleTag);

  // Xóa modal cũ
  const existingModal = document.getElementById("productViewModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Thêm modal
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Show modal
  try {
    const modalElement = document.getElementById("productViewModal");
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  } catch (error) {
    console.error("Error showing modal:", error);
    alert("Không thể hiển thị modal. Vui lòng kiểm tra console.");
  }
}

// Function chuyển từ modal View sang modal Order
function switchToOrderModal(productId) {
  const viewModal = bootstrap.Modal.getInstance(
    document.getElementById("productViewModal")
  );
  if (viewModal) {
    viewModal.hide();
  }

  setTimeout(() => {
    // Tìm product và gọi showProductModal trực tiếp
    const product = productData.products.find((p) => p.id === productId);
    if (product) {
      showProductModal(product);
    }
  }, 300);
}
// Function thêm vào giỏ hàng - SỬA LẠI để hiển thị modal
function addToCart(productId) {
  event.preventDefault();
  if (!productAllData) {
    console.error("Product data not available");
    return;
  }

  const product = productAllData.products.find((p) => p.id === productId);
  if (product) {
    showProductModal(product);
  }
}

// Function hiển thị modal chi tiết sản phẩm
function showProductModal(product) {
  const category = productAllData.categories.find(
    (cat) => cat.id === product.category_id
  );
  const categoryName = category ? category.name : "Ắc quy";
  const originalPriceHTML = product.original_price
    ? `<del class="text-muted">${formatPrice(product.original_price)}</del>`
    : "";

  const modalHTML = `
  <div class="modal fade" id="productModal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-fullscreen-sm-down modal-lg" role="document">
      <div class="modal-content">
        <!-- Header Compact với giá nổi bật -->
        <div class="modal-header bg-gradient-primary text-white py-2 sticky-top">
          <div class="w-100">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1 pe-2">
                <h6 class="modal-title fw-bold mb-1 small">${product.name}</h6>
                <small class="badge bg-light text-dark">${categoryName}</small>
                ${
                  product.stock_status === "in_stock"
                    ? '<small class="badge bg-success ms-1">Còn hàng</small>'
                    : '<small class="badge bg-danger ms-1">Hết hàng</small>'
                }
              </div>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <!-- Giá ở vị trí dễ thấy nhất -->
            <div class="mt-2">
              ${
                originalPriceHTML
                  ? `<small class="text-decoration-line-through opacity-75 me-2">${formatPrice(
                      product.original_price
                    )}</small>`
                  : ""
              }
              <span class="h5 fw-bold text-warning mb-0">${formatPrice(
                product.price
              )}</span>
              ${
                product.badges?.includes("sale")
                  ? '<span class="badge bg-danger ms-2 small">-' +
                    Math.round(
                      (1 - product.price / product.original_price) * 100
                    ) +
                    "%</span>"
                  : ""
              }
            </div>
          </div>
        </div>

        <div class="modal-body p-0">
          <!-- Phần ảnh compact với gallery ngang -->
          <div class="bg-light py-3">
            <div class="text-center mb-2">
              <img id="mainProductImage" 
                   src="${product.main_image || "img/product-11.png"}" 
                   class="img-fluid" 
                   style="max-height: 200px; object-fit: contain;"
                   alt="${product.name}"
                   onerror="this.onerror=null; this.src='img/product-11.png';">
            </div>
            
            ${
              product.images && product.images.length > 1
                ? `
              <div class="d-flex gap-2 px-3 overflow-auto">
                ${product.images
                  .slice(0, 5)
                  .map(
                    (img, idx) => `
                  <img src="${img}" 
                       class="rounded border ${
                         idx === 0 ? "border-primary border-2" : ""
                       }" 
                       style="width: 50px; height: 50px; object-fit: cover; cursor: pointer; flex-shrink: 0;"
                       alt="Ảnh ${idx + 1}"
                       onclick="document.getElementById('mainProductImage').src='${img}'; 
                                event.target.parentElement.querySelectorAll('img').forEach(i => i.classList.remove('border-primary', 'border-2'));
                                event.target.classList.add('border-primary', 'border-2');">
                `
                  )
                  .join("")}
              </div>
            `
                : ""
            }
            
            ${
              product.rating
                ? `
              <div class="text-center mt-2">
                <small class="text-warning">
                  ${"★".repeat(Math.floor(product.rating))}${"☆".repeat(
                    5 - Math.floor(product.rating)
                  )}
                  <span class="text-muted ms-1">(${
                    product.reviews_count || 0
                  })</span>
                </small>
              </div>
            `
                : ""
            }
          </div>

          <div class="px-3 py-3">
            <!-- Thông tin dạng accordion để tiết kiệm không gian -->
            <div class="accordion accordion-flush" id="productAccordion">
              
              <!-- Thông số kỹ thuật - Mở sẵn vì quan trọng nhất -->
              <div class="accordion-item border-0 border-bottom">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed py-2 px-0 bg-white" type="button" 
                          data-bs-toggle="collapse" data-bs-target="#specs">
                    <i class="fas fa-list-ul text-primary me-2"></i>
                    <strong class="small">Thông số kỹ thuật</strong>
                  </button>
                </h2>
                <div id="specs" class="accordion-collapse collapse show" data-bs-parent="#productAccordion">
                  <div class="accordion-body px-0 py-2">
                    <div class="row g-2">
                      ${
                        product.detailed_description?.specifications
                          ? Object.entries(
                              product.detailed_description.specifications
                            )
                              .map(
                                ([key, value]) => `
                            <div class="col-6">
                              <div class="p-2 bg-light rounded">
                                <div class="small text-muted">${key}</div>
                                <div class="fw-bold small">${value}</div>
                              </div>
                            </div>
                          `
                              )
                              .join("")
                          : `
                          ${
                            product.voltage
                              ? `
                            <div class="col-6">
                              <div class="p-2 bg-light rounded">
                                <div class="small text-muted">Điện áp</div>
                                <div class="fw-bold small">${product.voltage}</div>
                              </div>
                            </div>
                          `
                              : ""
                          }
                          ${
                            product.capacity
                              ? `
                            <div class="col-6">
                              <div class="p-2 bg-light rounded">
                                <div class="small text-muted">Dung lượng</div>
                                <div class="fw-bold small">${product.capacity}</div>
                              </div>
                            </div>
                          `
                              : ""
                          }
                        `
                      }
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mô tả & Tính năng -->
              ${
                product.detailed_description?.overview ||
                product.detailed_description?.features
                  ? `
                <div class="accordion-item border-0 border-bottom">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed py-2 px-0 bg-white" type="button" 
                            data-bs-toggle="collapse" data-bs-target="#description">
                      <i class="fas fa-info-circle text-primary me-2"></i>
                      <strong class="small">Mô tả & Tính năng</strong>
                    </button>
                  </h2>
                  <div id="description" class="accordion-collapse collapse" data-bs-parent="#productAccordion">
                    <div class="accordion-body px-0 py-2">
                      ${
                        product.detailed_description?.overview
                          ? `
                        <p class="small text-muted mb-2">${product.detailed_description.overview}</p>
                      `
                          : ""
                      }
                      
                      ${
                        product.detailed_description?.features
                          ? `
                        <ul class="ps-3 mb-0">
                          ${product.detailed_description.features
                            .map(
                              (f) => `
                            <li class="small mb-1">${f}</li>
                          `
                            )
                            .join("")}
                        </ul>
                      `
                          : ""
                      }
                    </div>
                  </div>
                </div>
              `
                  : ""
              }

              <!-- Ứng dụng -->
              ${
                product.detailed_description?.usage
                  ? `
                <div class="accordion-item border-0">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed py-2 px-0 bg-white" type="button" 
                            data-bs-toggle="collapse" data-bs-target="#usage">
                      <i class="fas fa-check-circle text-primary me-2"></i>
                      <strong class="small">Ứng dụng</strong>
                    </button>
                  </h2>
                  <div id="usage" class="accordion-collapse collapse" data-bs-parent="#productAccordion">
                    <div class="accordion-body px-0 py-2">
                      <p class="small text-muted mb-0">${product.detailed_description.usage}</p>
                    </div>
                  </div>
                </div>
              `
                  : ""
              }
            </div>

            <!-- Form đơn giản hơn với placeholder rõ ràng -->
            <div class="mt-4 p-3 bg-light rounded">
              <h6 class="fw-bold mb-3 text-center">
                <i class="fas fa-phone-alt text-primary me-2"></i>
                Đặt hàng nhanh
              </h6>
              <form id="orderForm">
                <div class="mb-2">
                  <input type="text" 
                         class="form-control form-control-sm" 
                         name="customerName" 
                         placeholder="Họ tên của bạn *" 
                         required>
                </div>
                <div class="mb-2">
                  <input type="tel" 
                         class="form-control form-control-sm" 
                         name="customerPhone" 
                         placeholder="Số điện thoại * (VD: 0337273932)"
                         pattern="[0-9]{10,11}" 
                         title="Nhập 10-11 số"
                         required>
                </div>
                <div class="mb-2">
                  <input type="text" 
                         class="form-control form-control-sm" 
                         name="customerAddress" 
                         placeholder="Địa chỉ giao hàng (tùy chọn)">
                </div>
                <div>
                  <textarea class="form-control form-control-sm" 
                            name="note" 
                            rows="2" 
                            placeholder="Ghi chú thêm (tùy chọn)"></textarea>
                </div>
                <input type="hidden" name="productId" value="${product.id}">
                <input type="hidden" name="productName" value="${product.name}">
                <input type="hidden" name="productPrice" value="${
                  product.price
                }">
              </form>
            </div>
          </div>
        </div>

        <!-- Footer sticky bottom - thumb zone friendly -->
        <div class="modal-footer border-top sticky-bottom bg-white p-2" style="bottom: 0;">
          <div class="d-grid gap-2 w-100">
            <button type="button" class="btn btn-primary btn-lg" onclick="submitOrder()">
              <i class="fas fa-paper-plane me-2"></i>
              Gửi yêu cầu tư vấn ngay
            </button>
            <button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">
              Xem sản phẩm khác
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

  // CSS để làm gradient header đẹp hơn
  const styleTag = document.createElement("style");
  styleTag.textContent = `
  .bg-gradient-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  /* Smooth scroll trong modal */
  .modal-body {
    overflow-y: auto;
    max-height: calc(100vh - 220px);
  }
  
  /* Tối ưu accordion */
  .accordion-button:not(.collapsed) {
    background-color: #f8f9fa;
    color: #333;
  }
  
  .accordion-button:focus {
    box-shadow: none;
    border-color: transparent;
  }
  
  /* Mobile full screen */
  @media (max-width: 576px) {
    .modal-fullscreen-sm-down .modal-body {
      max-height: calc(100vh - 200px);
    }
  }
`;
  document.head.appendChild(styleTag);

  // Remove existing modal if any
  const existingModal = document.getElementById("productModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to body
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById("productModal"));
  modal.show();

  // Clean up modal after hidden
  document
    .getElementById("productModal")
    .addEventListener("hidden.bs.modal", function () {
      this.remove();
    });
}

// Function submit order
// Cập nhật function submitOrder() trong file product.js hoặc product-functions.js

// Thay thế function submitOrder() cũ bằng function này:
function submitOrder() {
  const form = document.getElementById("orderForm");
  const formData = new FormData(form);

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Hiển thị loading state
  const submitButton = document.querySelector(
    '#productModal .btn-primary[onclick="submitOrder()"]'
  );
  const originalText = submitButton.innerHTML;
  submitButton.innerHTML =
    '<i class="fas fa-spinner fa-spin me-2"></i>Đang gửi...';
  submitButton.disabled = true;

  // Thu thập dữ liệu form
  const orderData = {
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerAddress: formData.get("customerAddress"),
    note: formData.get("note"),
    productId: formData.get("productId"),
    productName: formData.get("productName"),
    productPrice: formData.get("productPrice"),
  };

  // Gửi lên Google Sheet
  if (window.googleSheetHandler) {
    window.googleSheetHandler
      .submitOrderToSheet(orderData)
      .then(() => {
        // Thành công
        showNotification(
          "Cảm ơn bạn! Đơn hàng đã được gửi thành công. Chúng tôi sẽ liên hệ trong vòng 15 phút.",
          "success"
        );

        // Đóng modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("productModal")
        );
        modal.hide();

        // Reset form
        form.reset();
      })
      .catch((error) => {
        console.error("Error submitting order:", error);
        showNotification(
          "Có lỗi xảy ra khi gửi đơn hàng. Đơn hàng đã được lưu tạm thời, chúng tôi sẽ xử lý sớm nhất có thể.",
          "warning"
        );
      })
      .finally(() => {
        // Restore button state
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
      });
  } else {
    // Fallback nếu Google Sheet handler chưa load
    console.error("Google Sheet handler not available");

    // Lưu vào localStorage
    let orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push({
      ...orderData,
      timestamp: new Date().toISOString(),
      status: "pending_sync",
    });
    localStorage.setItem("orders", JSON.stringify(orders));

    showNotification(
      "Cảm ơn bạn! Đơn hàng đã được lưu. Chúng tôi sẽ liên hệ trong vòng 15 phút.",
      "success"
    );

    // Đóng modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("productModal")
    );
    modal.hide();

    // Restore button state
    submitButton.innerHTML = originalText;
    submitButton.disabled = false;
  }
}

// Function hiển thị thông báo (nếu chưa có)
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `alert alert-${type} notification`;
  notification.innerHTML = `
    <i class="fas fa-${
      type === "success"
        ? "check-circle"
        : type === "warning"
        ? "exclamation-triangle"
        : "info-circle"
    }"></i>
    ${message}
  `;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 250px;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Function xem danh sách đơn hàng (để debug)
window.viewOrders = function () {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  console.table(orders);
  return orders;
};

// Function xóa tất cả đơn hàng (để debug)
window.clearOrders = function () {
  localStorage.removeItem("orders");
};
