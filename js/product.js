// File: js/product.js

let productData = null;

// Load dữ liệu từ file JSON
async function loadProductData() {
  try {
    const response = await fetch("js/product.json"); // Đường dẫn tới file JSON của bạn
    productData = await response.json();
    return productData;
  } catch (error) {
    console.error("Lỗi khi load dữ liệu sản phẩm:", error);
    return null;
  }
}

// Function để format tiền VND
function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

// Function để tạo rating stars
function generateStars(rating) {
  let stars = "";
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
  if (!badges || badges.length === 0) return "";

  const badge = badges[0];
  if (badge === "new") {
    return '<div class="product-new">New</div>';
  } else if (badge === "sale") {
    return '<div class="product-sale">Sale</div>';
  }
  return "";
}

// Function để tạo HTML cho một sản phẩm (loại bỏ fallback image)
function createProductHTML(product, delay = "0.1s") {
  const category = productData.categories.find(
    (cat) => cat.id === product.category_id
  );
  const categoryName = category ? category.name : "Ắc quy";

  const originalPriceHTML = product.original_price
    ? `<del class="me-2 fs-5">${formatPrice(product.original_price)}</del>`
    : "";

  const badge = generateBadge(product.badges);
  const stars = generateStars(product.rating);

  // Sử dụng hình ảnh từ data hoặc placeholder đơn giản
  const imageUrl =
    product.main_image ||
    product.pro_image ||
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

  return `
    <div class="col-6 col-md-6 col-lg-4 col-xl-3">
      <div class="product-item rounded wow fadeInUp" data-wow-delay="${delay}">
        <div class="product-item-inner border rounded">
          <div class="product-item-inner-item">
            <img src="${imageUrl}" 
                 class="img-fluid w-100 rounded-top" 
                 alt="${product.name}">
            ${badge}
            <div class="product-details">
              <a href="#" onclick="viewProduct(${
                product.id
              })"><i class="fa fa-eye fa-1x"></i></a>
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

          </div>
        </div>
      </div>
    </div>
  `;
}

// Function cơ bản để render sản phẩm - THIẾU FUNCTION NÀY
function renderProducts(products = null, containerId = "products-container") {
  if (!productData) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  // Nếu không truyền products, sử dụng tất cả sản phẩm
  const productsToRender = products || productData.products;

  let html = "";
  const delays = ["0.1s", "0.3s", "0.5s", "0.7s"];

  productsToRender.forEach((product, index) => {
    const delay = delays[index % delays.length];
    html += createProductHTML(product, delay);
  });

  container.innerHTML = html;
}

// Function để render sản phẩm cho tab active với debug và ngăn chặn infinite loop
function renderProductsForActiveTab(categoryId) {
  if (!productData) {
    console.error("productData is null or undefined");
    return;
  }

  // Tìm tab đang active
  const activeTab = document.querySelector(".tab-pane.active");
  if (!activeTab) {
    console.error("No active tab found");
    return;
  }

  // Tìm container .row trong tab đó
  const container = activeTab.querySelector(".row");
  if (!container) {
    console.error("No .row container found in active tab");
    return;
  }

  // Kiểm tra xem container đã có sản phẩm chưa để tránh render lặp lại
  if (container.dataset.rendered === String(categoryId)) {
    return;
  }

  const filteredProducts = productData.products.filter(
    (product) => product.category_id === categoryId
  );

  if (filteredProducts.length === 0) {
    container.innerHTML =
      '<div class="col-12"><p class="text-center">Không có sản phẩm nào trong danh mục này.</p></div>';
    container.dataset.rendered = String(categoryId);
    return;
  }

  // Render trực tiếp vào container
  let html = "";
  const delays = ["0.1s", "0.3s", "0.5s", "0.7s"];

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
function searchProducts(keyword, containerId = "products-container") {
  if (!productData) return;
  const filteredProducts = productData.products.filter(
    (product) =>
      product.name.toLowerCase().includes(keyword.toLowerCase()) ||
      product.short_description.toLowerCase().includes(keyword.toLowerCase())
  );
  renderProducts(filteredProducts, containerId);
}

// Các function xử lý sự kiện
function viewProduct(productId) {
  event.preventDefault();
  const product = productData.products.find((p) => p.id === productId);
  if (product) {
    console.log("Xem chi tiết sản phẩm:", product);
    // window.location.href = `product-detail.html?id=${productId}`;
  }
}

function addToCart(productId) {
  event.preventDefault();
  const product = productData.products.find((p) => p.id === productId);
  if (product) {
    showProductModal(product);
  }
}

function showProductModal(product) {
  const category = productData.categories.find(
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
}

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

// Khởi tạo khi trang load
document.addEventListener("DOMContentLoaded", async function () {
  // Load dữ liệu từ file JSON
  await loadProductData();

  if (productData) {
    // Render sản phẩm cho tab đầu tiên (category_id = 1)
    setTimeout(() => {
      renderProductsForActiveTab(1);
    }, 500);

    // Thêm event listener cho Bootstrap tabs - CHỈ THÊM MỘT LẦN
    const tabLinks = document.querySelectorAll('[data-bs-toggle="pill"]');
    tabLinks.forEach((link) => {
      // Loại bỏ event listener cũ nếu có
      link.removeEventListener("shown.bs.tab", handleTabSwitch);

      // Thêm event listener mới
      link.addEventListener("shown.bs.tab", handleTabSwitch);
    });
  } else {
    console.error("Failed to load product data");
  }
});

// Function xử lý chuyển tab - tách riêng để dễ quản lý
function handleTabSwitch(e) {
  // Lấy category ID từ data attribute
  const categoryId = parseInt(e.target.getAttribute("data-category-id"));
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
  searchProducts,
};
