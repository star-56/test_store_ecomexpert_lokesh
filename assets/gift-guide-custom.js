document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu elements
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  
  // Product card container - get existing or create
  let productCardContainer = document.getElementById('productCardContainer');
  if (!productCardContainer) {
    productCardContainer = document.createElement('div');
    productCardContainer.id = 'productCardContainer';
    productCardContainer.className = 'product-card-overlay';
    productCardContainer.setAttribute('role', 'dialog');
    productCardContainer.setAttribute('aria-modal', 'true');
    productCardContainer.style.display = 'none';
    document.body.appendChild(productCardContainer);
  }

  // Soft Winter Jacket configuration
  const SOFT_WINTER_JACKET_HANDLE = 'soft-winter-jacket';
  const AUTO_ADD_CONDITIONS = {
    color: 'Black',
    size: 'Medium'
  };

  // Mobile menu functionality
  function openMobileMenu() {
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileMenu() {
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Mobile menu event listeners
  if (menuToggle) {
    menuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      openMobileMenu();
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', function(e) {
      e.preventDefault();
      closeMobileMenu();
    });
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', function(e) {
      if (e.target === mobileMenuOverlay) {
        closeMobileMenu();
      }
    });
  }

  // Random hotspot positioning
  function initializeHotspots() {
    const hotspots = document.querySelectorAll('.product-hotspot-overlay');
    const positionClasses = [
      'hotspot-pos-1', 'hotspot-pos-2', 'hotspot-pos-3', 'hotspot-pos-4', 
      'hotspot-pos-5', 'hotspot-pos-6', 'hotspot-pos-7', 'hotspot-pos-8',
      'hotspot-pos-9', 'hotspot-pos-10'
    ];
    
    hotspots.forEach((hotspot, index) => {
      // Remove any existing position classes
      hotspot.classList.remove(...positionClasses);
      
      // Add a random position class
      const randomPosition = positionClasses[Math.floor(Math.random() * positionClasses.length)];
      hotspot.classList.add(randomPosition);
      
      // Add event listener to render product card
      hotspot.addEventListener('click', function(e) {
        e.preventDefault();
        const productHandle = this.dataset.productHandle;
        if (productHandle) {
          renderProductCard(productHandle);
        }
      });
    });
  }

  // Product Card functionality
  function renderProductCard(productHandle) {
    console.log('Loading product card for:', productHandle);
    
    fetch(`/products/${productHandle}.js`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Product not found');
        }
        return response.json();
      })
      .then(product => {
        console.log('Product data loaded:', product);
        createAndShowProductCard(product);
      })
      .catch(error => {
        console.error('Error loading product:', error);
        showError('Failed to load product details');
      });
  }

  function createAndShowProductCard(product) {
    // Use the template if it exists, otherwise create HTML
    const template = document.getElementById('product-card-template');
    let productCardHTML;
    
    if (template) {
      // Clone the template content
      const templateContent = template.content.cloneNode(true);
      productCardContainer.innerHTML = '';
      productCardContainer.appendChild(templateContent);
    } else {
      // Fallback: create HTML manually
      productCardHTML = `
        <div class="product-card-wrapper">
          <div class="product-card-close">
            <button class="close-btn" type="button" aria-label="Close product card">&times;</button>
          </div>
          <div class="product-card" data-product-handle="${product.handle}" data-product-id="${product.id}">
            <!-- Product Image -->
            <div class="product-image">
              <img id="productImage" src="${product.featured_image || ''}" alt="${product.title}" style="${product.featured_image ? '' : 'display: none;'}">
              <div class="placeholder-image" id="placeholderImage" style="${product.featured_image ? 'display: none;' : ''}"></div>
            </div>

            <!-- Product Details -->
            <div class="product-details">
              <h3 class="product-title" id="productTitle">${product.title}</h3>
              <div class="product-price" id="productPrice">${formatMoney(product.price)}</div>
              <p class="product-description" id="productDescription">${product.description || 'This premium product offers exceptional quality and style.'}</p>
            </div>

            <!-- Color Selection -->
            <div class="color-section">
              <label class="section-label">Color</label>
              <div class="color-options" id="colorOptions">
                <!-- Will be populated via JavaScript -->
              </div>
            </div>

            <!-- Size Selection -->
            <div class="size-section">
              <label class="section-label">Size</label>
              <div class="size-dropdown">
                <select class="size-select" id="sizeSelect" aria-label="Select size">
                  <option value="">Choose your size</option>
                </select>
                <div class="dropdown-arrow">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                    <path d="M1 1L6 6L11 1" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Add to Cart Button -->
            <form class="add-to-cart-form" id="addToCartForm">
              <input type="hidden" name="variant_id" id="variantId">
              <button type="submit" class="add-to-cart-btn" id="addToCartBtn">
                <span>Add to Cart</span>
                <svg width="20" height="2" viewBox="0 0 20 2" fill="none" aria-hidden="true">
                  <path d="M0 1H20" stroke="white" stroke-width="1.5"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      `;
      productCardContainer.innerHTML = productCardHTML;
    }
    
    // Show the product card container
    productCardContainer.style.display = 'flex';
    // Force reflow
    productCardContainer.offsetHeight;
    productCardContainer.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Populate the product card with dynamic data
    populateProductCard(product);

    // Add close functionality
    const closeBtn = productCardContainer.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeProductCard);
    }
    
    // Close on overlay click
    productCardContainer.addEventListener('click', function(e) {
      if (e.target === productCardContainer) {
        closeProductCard();
      }
    });

    // Focus management for accessibility
    const cardWrapper = productCardContainer.querySelector('.product-card-wrapper');
    if (cardWrapper) {
      cardWrapper.focus();
    }
  }

  function populateProductCard(product) {
    console.log('Populating product card with:', product);

    // Update basic product info
    const productImage = productCardContainer.querySelector('#productImage');
    const placeholderImage = productCardContainer.querySelector('#placeholderImage');
    const productTitle = productCardContainer.querySelector('#productTitle');
    const productPrice = productCardContainer.querySelector('#productPrice');
    const productDescription = productCardContainer.querySelector('#productDescription');

    if (product.featured_image && productImage) {
      productImage.src = product.featured_image;
      productImage.alt = product.title;
      productImage.style.display = 'block';
      if (placeholderImage) placeholderImage.style.display = 'none';
    }

    if (productTitle) productTitle.textContent = product.title;
    if (productPrice) productPrice.textContent = formatMoney(product.price);
    if (productDescription) productDescription.textContent = product.description || 'This premium product offers exceptional quality and style.';

    // Update product card attributes
    const productCard = productCardContainer.querySelector('.product-card');
    if (productCard) {
      productCard.setAttribute('data-product-handle', product.handle);
      productCard.setAttribute('data-product-id', product.id);
    }

    // Determine which options contain colors and sizes
    let colorOptionKey = 'option2'; // Default
    let sizeOptionKey = 'option1';  // Default
    
    // Try to determine from option names
    if (product.options && product.options.length > 0) {
      product.options.forEach((option, index) => {
        const optionName = option.name ? option.name.toLowerCase() : '';
        const optionKey = `option${index + 1}`;
        
        if (optionName.includes('color') || optionName.includes('colour')) {
          colorOptionKey = optionKey;
        } else if (optionName.includes('size')) {
          sizeOptionKey = optionKey;
        }
      });
    }

    // Build color options
    const colorOptions = productCardContainer.querySelector('#colorOptions');
    if (colorOptions) {
      colorOptions.innerHTML = '';
      
      const colors = getUniqueOptionValues(product.variants, colorOptionKey);
      console.log('Available colors:', colors);
      
      if (colors.length > 0) {
        colors.forEach((color, index) => {
          const colorDiv = document.createElement('div');
          colorDiv.className = 'color-option';
          if (index === 0) colorDiv.classList.add('selected');
          colorDiv.dataset.color = color;
          
          const colorIndicator = document.createElement('div');
          colorIndicator.className = 'color-indicator';
          colorIndicator.style.backgroundColor = getColorValue(color);
          
          const colorName = document.createElement('span');
          colorName.className = 'color-name';
          colorName.textContent = color;
          
          colorDiv.appendChild(colorIndicator);
          colorDiv.appendChild(colorName);
          
          colorDiv.addEventListener('click', () => selectColor(colorDiv, product));
          colorOptions.appendChild(colorDiv);
        });
      } else {
        // Default color option if none found
        colorOptions.innerHTML = `
          <div class="color-option selected" data-color="Default">
            <div class="color-indicator" style="background-color: #CCCCCC;"></div>
            <span class="color-name">Standard</span>
          </div>
        `;
      }
    }

    // Build size options
    const sizeSelect = productCardContainer.querySelector('#sizeSelect');
    if (sizeSelect) {
      sizeSelect.innerHTML = '<option value="">Choose your size</option>';
      
      const sizes = getUniqueOptionValues(product.variants, sizeOptionKey);
      console.log('Available sizes:', sizes);
      
      sizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        sizeSelect.appendChild(option);
      });
    }

    // Store configuration for form submission
    window.currentProductConfig = {
      colorOptionKey,
      sizeOptionKey,
      product
    };

    // Set up form submission
    const form = productCardContainer.querySelector('#addToCartForm');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        addToCartFromProductCard(product, colorOptionKey, sizeOptionKey);
      });
    }

    // Update variant when selections change
    if (sizeSelect) {
      sizeSelect.addEventListener('change', () => updateSelectedVariant(product, colorOptionKey, sizeOptionKey));
    }

    // Initial variant update
    updateSelectedVariant(product, colorOptionKey, sizeOptionKey);
  }

  function selectColor(colorDiv, product) {
    // Remove selected class from all color options
    productCardContainer.querySelectorAll('.color-option').forEach(div => {
      div.classList.remove('selected');
    });
    // Add selected class to clicked option
    colorDiv.classList.add('selected');
    
    // Update selected variant
    const { colorOptionKey, sizeOptionKey } = window.currentProductConfig;
    updateSelectedVariant(product, colorOptionKey, sizeOptionKey);
  }

  function updateSelectedVariant(product, colorOptionKey, sizeOptionKey) {
    const selectedColorDiv = productCardContainer.querySelector('.color-option.selected');
    const selectedColor = selectedColorDiv ? selectedColorDiv.dataset.color : null;
    const sizeSelect = productCardContainer.querySelector('#sizeSelect');
    const selectedSize = sizeSelect ? sizeSelect.value : null;
    const variantIdInput = productCardContainer.querySelector('#variantId');
    const addToCartBtn = productCardContainer.querySelector('#addToCartBtn');

    if (!addToCartBtn) return;

    if (selectedColor && selectedSize) {
      const variant = findVariant(product.variants, selectedSize, selectedColor, sizeOptionKey, colorOptionKey);
      if (variant && variant.available) {
        if (variantIdInput) variantIdInput.value = variant.id;
        addToCartBtn.disabled = false;
        const btnText = addToCartBtn.querySelector('span');
        if (btnText) btnText.textContent = 'Add to Cart';
      } else {
        if (variantIdInput) variantIdInput.value = '';
        addToCartBtn.disabled = true;
        const btnText = addToCartBtn.querySelector('span');
        if (btnText) btnText.textContent = variant ? 'Out of Stock' : 'Not Available';
      }
    } else {
      if (variantIdInput) variantIdInput.value = '';
      addToCartBtn.disabled = true;
      const btnText = addToCartBtn.querySelector('span');
      if (btnText) btnText.textContent = 'Select Options';
    }
  }

  function findVariant(variants, selectedSize, selectedColor, sizeOptionKey, colorOptionKey) {
    return variants.find(variant => {
      return variant[sizeOptionKey] === selectedSize && variant[colorOptionKey] === selectedColor;
    });
  }

  function addToCartFromProductCard(product, colorOptionKey, sizeOptionKey) {
    const selectedColorDiv = productCardContainer.querySelector('.color-option.selected');
    const selectedColor = selectedColorDiv ? selectedColorDiv.dataset.color : null;
    const sizeSelect = productCardContainer.querySelector('#sizeSelect');
    const selectedSize = sizeSelect ? sizeSelect.value : null;

    if (!selectedSize || !selectedColor) {
      alert('Please select all options');
      return;
    }

    const variant = findVariant(product.variants, selectedSize, selectedColor, sizeOptionKey, colorOptionKey);

    if (!variant) {
      alert('This combination is not available');
      return;
    }

    if (!variant.available) {
      alert('This variant is out of stock');
      return;
    }

    // Prepare cart data
    const formData = {
      items: [{
        id: variant.id,
        quantity: 1
      }]
    };

    // Check if we need to auto-add Soft Winter Jacket
    if (selectedColor === AUTO_ADD_CONDITIONS.color && 
        selectedSize === AUTO_ADD_CONDITIONS.size) {
      fetch(`/products/${SOFT_WINTER_JACKET_HANDLE}.js`)
        .then(response => response.json())
        .then(winterJacket => {
          if (winterJacket && winterJacket.variants.length > 0) {
            formData.items.push({
              id: winterJacket.variants[0].id,
              quantity: 1
            });
          }
          submitToCart(formData);
        })
        .catch(() => {
          submitToCart(formData);
        });
    } else {
      submitToCart(formData);
    }
  }

  function closeProductCard() {
    productCardContainer.classList.remove('active');
    document.body.style.overflow = '';
    
    setTimeout(() => {
      productCardContainer.style.display = 'none';
      productCardContainer.innerHTML = '';
    }, 300);
  }

  function getColorValue(colorName) {
    if (!colorName) return '#CCCCCC';
    
    const colorMap = {
      'red': '#B20F36',
      'grey': '#AFAFB7',
      'gray': '#AFAFB7',
      'black': '#000000',
      'white': '#FFFFFF',
      'blue': '#0066CC',
      'green': '#00AA44',
      'yellow': '#FFDD00',
      'pink': '#FF69B4',
      'purple': '#8A2BE2',
      'orange': '#FF8800',
      'brown': '#8B4513',
      'beige': '#F5F5DC',
      'navy': '#000080',
      'maroon': '#800000',
      'teal': '#008080',
      'lime': '#00FF00',
      'olive': '#808000',
      'silver': '#C0C0C0',
      'gold': '#FFD700',
      'coral': '#FF7F50',
      'salmon': '#FA8072',
      'khaki': '#F0E68C',
      'tan': '#D2B48C',
      'crimson': '#DC143C',
      'indigo': '#4B0082',
      'violet': '#EE82EE',
      'turquoise': '#40E0D0',
      'mint': '#98FB98'
    };
    
    return colorMap[colorName] || colorMap[colorName.toLowerCase()] || '#CCCCCC';
  }

  function getUniqueOptionValues(variants, optionKey) {
    if (!variants || !Array.isArray(variants)) return [];
    
    const values = new Set();
    variants.forEach(variant => {
      if (variant && variant[optionKey] && variant[optionKey].trim() !== '') {
        values.add(variant[optionKey].trim());
      }
    });
    
    return Array.from(values);
  }

  function submitToCart(formData) {
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      closeProductCard();
      updateCartCount();
      showCartNotification('Product added to cart!');
    })
    .catch(error => {
      console.error('Error adding to cart:', error);
      alert('Error adding product to cart');
    });
  }

  function updateCartCount() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          cartCount.textContent = cart.item_count;
        }
      })
      .catch(error => {
        console.error('Error updating cart count:', error);
      });
  }

  function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 15px 20px;
      border-radius: 6px;
      z-index: 10000;
      font-family: 'Jost', sans-serif;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  function showError(message) {
    const error = document.createElement('div');
    error.className = 'error-notification';
    error.textContent = message;
    error.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 15px 20px;
      border-radius: 6px;
      z-index: 10000;
      font-family: 'Jost', sans-serif;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(error);
    
    setTimeout(() => {
      error.remove();
    }, 5000);
  }

  function formatMoney(cents) {
    return '€' + (cents / 100).toFixed(2);
  }

  // ESC key to close product card and mobile menu
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (productCardContainer.classList.contains('active')) {
        closeProductCard();
      }
      if (mobileMenuOverlay && mobileMenuOverlay.classList.contains('active')) {
        closeMobileMenu();
      }
    }
  });

  // Initialize hotspots with random positioning
  initializeHotspots();
});