
// =============================================
// EMAILJS CONFIG - ĐÃ CÓ KEY ĐÚNG
// =============================================
const EMAILJS_SERVICE_ID = 'service_gcp0rrs';
const EMAILJS_TEMPLATE_ID = 'template_84bloy6';

// =============================================
// HERO LEAD FORM HANDLER
// =============================================
document.getElementById('heroLeadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    
    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang gửi...';
    
    // Dữ liệu form
    const templateParams = {
        customerName: this.customerName.value.trim(),
        customerPhone: this.customerPhone.value.trim(),
        vehicleType: this.vehicleType.value,
        timestamp: new Date().toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }),
        source: 'Hero Form - Trang chủ'
    };
    

    
    // GỬI EMAIL
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function(response) {
            
            // Success UI
            submitBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Đã gửi thành công!';
            submitBtn.classList.remove('btn-danger');
            submitBtn.classList.add('btn-success');
            
            // Notification
            showNotification('✅ Cảm ơn bạn! Chúng tôi sẽ gọi lại trong 5 phút.', 'success');
            
            // GA4 tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'generate_lead', {
                    event_category: 'form_submission',
                    event_label: 'hero_form_emailjs',
                    value: 1
                });
            }
            
            // Reset form
            setTimeout(() => {
                document.getElementById('heroLeadForm').reset();
                submitBtn.innerHTML = originalHTML;
                submitBtn.classList.remove('btn-success');
                submitBtn.classList.add('btn-danger');
                submitBtn.disabled = false;
            }, 3000);
            
        })
        .catch(function(error) {
            console.error('❌ Email sending failed:', error);
            
            // Error UI
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            
            // Error message
            let errorMsg = '⚠️ Có lỗi xảy ra. Vui lòng gọi: 0337.273.932';
            if (error.text) {
                console.error('Error details:', error.text);
                errorMsg = '⚠️ Lỗi: ' + error.text;
            }
            
            showNotification(errorMsg, 'danger');
            
            // Fallback: Save to localStorage
            saveToLocalStorage(templateParams);
        });
});

// =============================================
// BACKUP: Lưu vào localStorage nếu email fail
// =============================================
function saveToLocalStorage(data) {
    try {
        let leads = JSON.parse(localStorage.getItem('pendingLeads') || '[]');
        leads.push({
            ...data,
            savedAt: new Date().toISOString(),
            status: 'pending_retry'
        });
        localStorage.setItem('pendingLeads', JSON.stringify(leads));
    } catch (e) {
        console.error('LocalStorage error:', e);
    }
}

// =============================================
// NOTIFICATION HELPER
// =============================================
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.email-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} email-notification`;
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        min-width: 320px;
        max-width: 450px;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 6px 25px rgba(0,0,0,0.25);
        animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        font-size: 15px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease-in';
        setTimeout(() => notification.remove(), 400);
    }, 5000);
}

// CSS Animation
if (!document.getElementById('emailjs-animation-style')) {
    const style = document.createElement('style');
    style.id = 'emailjs-animation-style';
    style.textContent = `
        @keyframes slideInRight {
            from { 
                transform: translateX(450px); 
                opacity: 0; 
            }
            to { 
                transform: translateX(0); 
                opacity: 1; 
            }
        }
        @keyframes slideOutRight {
            from { 
                transform: translateX(0); 
                opacity: 1; 
            }
            to { 
                transform: translateX(450px); 
                opacity: 0; 
            }
        }
    `;
    document.head.appendChild(style);
}

// =============================================
// DEBUG FUNCTIONS (Xóa khi đã hoạt động)
// =============================================
window.testEmailJS = function() {
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        customerName: 'Test User',
        customerPhone: '0912345678',
        vehicleType: 'Ô tô 12V',
        timestamp: new Date().toLocaleString('vi-VN'),
        source: 'Manual Console Test'
    }).then(
        error => console.error('❌ Test FAILED:', error)
    );
};

window.viewPendingLeads = function() {
    const leads = JSON.parse(localStorage.getItem('pendingLeads') || '[]');
    return leads;
};

window.clearPendingLeads = function() {
    localStorage.removeItem('pendingLeads');
};
