document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Fade-in-up Animation on Scroll ---
  const fadeElems = document.querySelectorAll('.fade-in-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });

  fadeElems.forEach(elem => {
    observer.observe(elem);
  });

  // --- 2. Countdown Timer (Announcement Bar & Sticky Bar) ---
  function updateCountdown() {
    const now = new Date();
    
    // Target is 17:00 (5 PM) today
    const target = new Date();
    target.setHours(17, 0, 0, 0);
    
    // If it's already past 17:00, target is 17:00 tomorrow
    if (now > target) {
      target.setDate(target.getDate() + 1);
    }
    
    const diff = target - now;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const formatNum = (num) => num.toString().padStart(2, '0');
    
    const timerStr = `${formatNum(hours)} giờ ${formatNum(minutes)} phút ${formatNum(seconds)} giây`;
    
    const announcementTimer = document.getElementById('announcement-timer');
    const stickyTimer = document.getElementById('sticky-timer');
    
    if (announcementTimer) {
      announcementTimer.textContent = timerStr;
    }
    if (stickyTimer) {
      stickyTimer.textContent = timerStr;
    }
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // --- 3. Sticky Bottom CTA Bar Visibility ---
  const stickyBar = document.querySelector('.sticky-cta-bar');
  window.addEventListener('scroll', () => {
    const heroHeight = document.querySelector('.hero').offsetHeight;
    const scrollPos = window.scrollY;
    const bodyHeight = document.body.offsetHeight;
    const windowHeight = window.innerHeight;
    
    // Show sticky bar after scrolling past Hero, and hide it near footer
    if (scrollPos > heroHeight && (scrollPos + windowHeight) < (bodyHeight - 150)) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  });

  // --- 4. Interactive Calculator & Package Selector ---
  const pageInput = document.getElementById('calc-pages'); // Now represents quantity of businesses
  const packageSelect = document.getElementById('calc-package');
  const calcPrice = document.getElementById('calc-total-price');
  const calcTime = document.getElementById('calc-delivery-time');
  const calcBonusVal = document.getElementById('calc-bonus-value');
  const packageTabBtns = document.querySelectorAll('.pricing-tab-btn');
  const startupGrid = document.getElementById('startup-grid');
  const changeGrid = document.getElementById('change-grid');

  // Rates for official services
  const rates = {
    basics: 699000,
    household: 999000,
    startup: 2999000,
    change: 0,
    suspend: 0,
    dissolve: 0
  };

  // Delivery times in days
  const deliveryTimes = {
    basics: '07 ngày làm việc',
    household: '04 ngày làm việc',
    startup: '07 ngày làm việc',
    change: '03 - 05 ngày làm việc',
    suspend: '03 ngày làm việc',
    dissolve: '01 - 03 tháng (theo thuế)'
  };

  // Approximate bonus values
  const bonusValues = {
    basics: 1500000,
    household: 500000,
    startup: 5500000,
    change: 1500000,
    suspend: 500000,
    dissolve: 1500000
  };

  function calculateServices() {
    if (!packageSelect || !calcPrice) return;
    
    const qty = (pageInput && pageInput.value) ? (parseInt(pageInput.value) || 1) : 1;
    const selectedPkg = packageSelect.value;
    const rate = rates[selectedPkg];
    
    if (rate === 0) {
      calcPrice.textContent = 'Liên hệ báo giá';
      calcPrice.style.color = 'var(--accent-orange)';
    } else {
      const total = qty * rate;
      calcPrice.textContent = total.toLocaleString('vi-VN') + ' đ';
      calcPrice.style.color = 'var(--text-main)';
    }
    
    calcTime.textContent = deliveryTimes[selectedPkg] || 'Theo thỏa thuận';
    calcTime.style.color = selectedPkg === 'dissolve' ? 'var(--accent-red)' : 'var(--accent-blue)';
    
    const bonusVal = bonusValues[selectedPkg] || 0;
    if (calcBonusVal) {
      calcBonusVal.textContent = bonusVal === 0 ? 'Tư vấn miễn phí' : bonusVal.toLocaleString('vi-VN') + ' đ';
    }
  }

  if (packageSelect) {
    packageSelect.addEventListener('change', calculateServices);
    if (pageInput) {
      pageInput.addEventListener('input', calculateServices);
    }
    calculateServices(); // Initial run
  }

  // Handle Tab switches between main categories
  packageTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      packageTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tabTarget = btn.dataset.package;
      
      if (tabTarget === 'startup-packages') {
        startupGrid.style.display = 'grid';
        changeGrid.style.display = 'none';
        if (packageSelect) {
          packageSelect.value = 'startup';
          calculateServices();
        }
      } else if (tabTarget === 'change-packages') {
        startupGrid.style.display = 'none';
        changeGrid.style.display = 'grid';
        if (packageSelect) {
          packageSelect.value = 'change';
          calculateServices();
        }
      }
    });
  });

  // --- 4.5. Dynamic Package Selection from CTA Click ---
  const ctaLinks = document.querySelectorAll('a[href="#contact-form-section"], a[href="#translation-form"]');
  ctaLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const card = link.closest('.pricing-card');
      if (card && card.dataset.package) {
        const pkg = card.dataset.package;
        
        // Select package in dropdown
        if (packageSelect) {
          packageSelect.value = pkg;
          
          // Trigger tab change if package belongs to change category
          const isChangePkg = ['change', 'suspend', 'dissolve'].includes(pkg);
          const activeTabBtn = document.querySelector(`.pricing-tab-btn[data-package="${isChangePkg ? 'change-packages' : 'startup-packages'}"]`);
          if (activeTabBtn && !activeTabBtn.classList.contains('active')) {
            // Update active states
            packageTabBtns.forEach(b => b.classList.remove('active'));
            activeTabBtn.classList.add('active');
            
            if (isChangePkg) {
              startupGrid.style.display = 'none';
              changeGrid.style.display = 'grid';
            } else {
              startupGrid.style.display = 'grid';
              changeGrid.style.display = 'none';
            }
          }
          
          calculateServices();
        }
      }
      
      // Smooth scroll to the form section
      const targetSection = document.querySelector('.contact-card');
      if (targetSection) {
        e.preventDefault();
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  // --- 4.6. Footer Links navigation ---
  const footerLinks = document.querySelectorAll('.footer-links a[data-footer-pkg]');
  footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const pkg = link.dataset.footerPkg;
      
      // Select package in dropdown
      if (packageSelect) {
        packageSelect.value = pkg;
        calculateServices();
      }
      
      // Scroll to form section
      const targetSection = document.querySelector('.contact-card');
      if (targetSection) {
        e.preventDefault();
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- 5. FAQ Accordion (AREB) ---
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const faqItem = btn.parentElement;
      const answer = faqItem.querySelector('.faq-answer');
      const isActive = faqItem.classList.contains('active');
      
      // Close all other FAQs
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-answer').style.maxHeight = null;
      });
      
      if (!isActive) {
        faqItem.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // --- 6. Form Submission with Dynamic Redirect (Zalo/Email Option) ---
  const contactForm = document.getElementById('translation-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const selectedPkg = document.getElementById('calc-package').value;
      const qty = document.getElementById('calc-pages') ? document.getElementById('calc-pages').value : 1;
      const note = document.getElementById('message').value.trim();
      
      if (!name || !phone || !email) {
        alert('Vui lòng điền đầy đủ các thông tin bắt buộc: Họ tên, Số điện thoại và Email.');
        return;
      }
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Đang tiếp nhận thông tin... ⏳';
      
      const packageLabels = {
        basics: 'Thành lập công ty - Gói Cơ Bản (699k)',
        household: 'Đăng ký Hộ Kinh Doanh (999k)',
        startup: 'Thành lập công ty - Gói Khởi Nghiệp (2.999k)',
        change: 'Thay đổi nội dung ĐKKD',
        suspend: 'Tạm ngừng hoạt động doanh nghiệp',
        dissolve: 'Giải thể doanh nghiệp'
      };
      
      const selectedLabel = packageLabels[selectedPkg] || selectedPkg;

      fetch("https://formsubmit.co/ajax/Truongquoc.law@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          "_subject": `Khách hàng mới: ${name} - Đăng ký ${selectedLabel}`,
          "Họ và tên": name,
          "Số điện thoại Zalo": phone,
          "Email": email,
          "Dịch vụ đăng ký": selectedLabel,
          "Số lượng": qty,
          "Chi tiết yêu cầu": note
        })
      })
      .then(response => {
        submitBtn.innerHTML = 'Đăng ký thành công! ✓';
        
        const msgText = `Chào Trường Quốc - Trợ Lý Pháp Lý, tôi tên là ${name}. SĐT Zalo: ${phone}. Email: ${email}. Có nhu cầu đăng ký dịch vụ: ${selectedLabel} (Số lượng: ${qty} DN). Ghi chú yêu cầu: ${note}`;
        const encodedMsg = encodeURIComponent(msgText);
        
        // Show interactive modal
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';
        modal.style.padding = '1.5rem';
        
        modal.innerHTML = `
          <div style="background: white; padding: 2.5rem; border-radius: 1.5rem; max-width: 500px; width: 100%; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 1rem; color: var(--text-main);">GỬI YÊU CẦU THÀNH CÔNG!</h3>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.95rem;">
              Yêu cầu của bạn đã được gửi thành công đến Email của Trợ Lý Pháp Lý Trường Quốc. Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất. Để được hỗ trợ chat 1-1 trực tiếp qua Zalo ngay lập tức, bạn hãy bấm nút bên dưới.
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <a href="https://zalo.me/0335223015?text=${encodedMsg}" target="_blank" class="btn btn-blue" style="width: 100%;">
                💬 Chat Trực Tiếp Zalo Của Luật Sư
              </a>
              <button id="close-modal" class="btn" style="background: #E2E8F0; color: var(--text-main); font-size: 0.95rem;">
                Hoàn thành
              </button>
            </div>
          </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('close-modal').addEventListener('click', () => {
          modal.remove();
          contactForm.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        });
      })
      .catch(err => {
        console.error("Error sending form:", err);
        alert("Đã có lỗi xảy ra khi gửi thông tin qua Email. Xin vui lòng liên hệ trực tiếp qua Zalo: 0335.223.015 để được hỗ trợ nhanh nhất!");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      });
    });
  }

  // --- 8. Smooth scroll for all anchor links and prevent URL hash update ---
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (e.defaultPrevented) return;
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- 7. Lightbox for Feedback Images ---
  window.openLightbox = function(src) {
    const lightbox = document.getElementById('feedback-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightbox && lightboxImg) {
      lightboxImg.src = src;
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Disable scroll when open
    }
  };

  window.closeLightbox = function() {
    const lightbox = document.getElementById('feedback-lightbox');
    if (lightbox) {
      lightbox.style.display = 'none';
      document.body.style.overflow = 'auto'; // Enable scroll
    }
  };
});
