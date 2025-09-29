// File: js/google-sheet-submit.js
// Xử lý gửi đơn hàng lên Google Sheet

// URL Apps Script với Deployment ID
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJhT1Tcz9cUTnPpRgUjKv3DRD4L1lT_1yiIep0-tv7nzL3Se1orAiT9FnzIHGWXgDq/exec';

// Function gửi đơn hàng lên Google Sheet
async function submitOrderToGoogleSheet(orderData) {
  try {

    
    // Chuẩn bị dữ liệu gửi
    const formData = new URLSearchParams();
    formData.append('form_type', 'product_order');
    formData.append('name', orderData.customerName || '');
    formData.append('phone', orderData.customerPhone || '');
    formData.append('address', orderData.customerAddress || '');
    formData.append('message', orderData.note || '');
    formData.append('product_name', orderData.productName || '');
    formData.append('product_price', orderData.productPrice || '');
    formData.append('product_id', orderData.productId || '');
    formData.append('traffic_source', getTrafficSource());
    formData.append('user_platform', getUserPlatform());
    
    // Gửi request
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
    

    
    // Lưu backup vào localStorage
    saveOrderToLocal(orderData);
    
    return true;
    
  } catch (error) {
    console.error('Error sending order:', error);
    
    // Lưu vào localStorage nếu gửi thất bại
    saveOrderToLocal(orderData, true);
    
    throw error;
  }
}

// Function lấy nguồn traffic
function getTrafficSource() {
  const referrer = document.referrer;
  const utmSource = new URLSearchParams(window.location.search).get('utm_source');
  
  if (utmSource) return `utm_${utmSource}`;
  if (referrer.includes('google')) return 'google';
  if (referrer.includes('facebook')) return 'facebook';
  if (referrer.includes('zalo')) return 'zalo';
  if (referrer) return 'referral';
  return 'direct';
}

// Function lấy platform
function getUserPlatform() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad/.test(userAgent)) return 'mobile';
  if (/tablet/.test(userAgent)) return 'tablet';
  return 'desktop';
}

// Function lưu vào localStorage
function saveOrderToLocal(orderData, isFailed = false) {
  try {
    const storageKey = isFailed ? 'failed_orders' : 'orders';
    let orders = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const orderWithMeta = {
      ...orderData,
      timestamp: new Date().toISOString(),
      traffic_source: getTrafficSource(),
      user_platform: getUserPlatform(),
      page_url: window.location.href,
      status: isFailed ? 'failed' : 'sent'
    };
    
    orders.push(orderWithMeta);
    localStorage.setItem(storageKey, JSON.stringify(orders));
    

  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Function sửa lại submitOrder() gốc
function submitOrder() {
  const form = document.getElementById('orderForm');
  const formData = new FormData(form);
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Hiển thị loading
  const submitButton = document.querySelector('#productModal .btn-primary[onclick="submitOrder()"]');
  const originalText = submitButton.innerHTML;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang gửi...';
  submitButton.disabled = true;

  // Thu thập dữ liệu
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
  submitOrderToGoogleSheet(orderData)
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
      console.error('Error:', error);
      showNotification('Có lỗi xảy ra khi gửi đơn hàng. Đơn hàng đã được lưu tạm thời, chúng tôi sẽ xử lý sớm nhất có thể.', 'warning');
    })
    .finally(() => {
      // Restore button
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    });
}

// Function retry đơn hàng thất bại
async function retryFailedOrders() {
  try {
    const failedOrders = JSON.parse(localStorage.getItem('failed_orders') || '[]');
    
    if (failedOrders.length === 0) {

      return;
    }


    
    for (const order of failedOrders) {
      try {
        await submitOrderToGoogleSheet(order);

      } catch (error) {
        console.error('Retry failed for order:', order.customerName, error);
      }
    }

    // Xóa failed orders sau khi retry
    localStorage.removeItem('failed_orders');


  } catch (error) {
    console.error('Error retrying failed orders:', error);
  }
}

// Auto retry khi trang load
document.addEventListener('DOMContentLoaded', function() {
  // Retry sau 3 giây
  setTimeout(() => {
    retryFailedOrders();
  }, 3000);
});

// Retry mỗi 5 phút
setInterval(() => {
  retryFailedOrders();
}, 5 * 60 * 1000);

// Debug functions
window.debugOrders = {
  viewAll: () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const failed = JSON.parse(localStorage.getItem('failed_orders') || '[]');
    console.table([...orders, ...failed]);
    return { successful: orders, failed: failed };
  },
  
  retry: () => retryFailedOrders(),
  
  clear: () => {
    localStorage.removeItem('orders');
    localStorage.removeItem('failed_orders');

  },
  
  test: () => {
    const testData = {
      customerName: 'Nguyễn Test',
      customerPhone: '0123456789',
      customerAddress: 'Hà Nội',
      note: 'Test đơn hàng',
      productId: '1',
      productName: 'Ắc quy test',
      productPrice: '1000000'
    };
    return submitOrderToGoogleSheet(testData);
  }
};