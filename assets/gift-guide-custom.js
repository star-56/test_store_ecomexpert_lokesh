document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('productModal');
  const modalOverlay = modal.querySelector('.modal-overlay');
  const modalClose = modal.querySelector('.modal-close');
  
  // Mobile menu elements
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  
  // Soft Winter Jacket configuration
  const SOFT_WINTER_JACKET_HANDLE = 'soft-winter-jacket';
  const AUTO_ADD_CONDITIONS = {
    color: 'Black',
    size: 'Medium'
  };

  // Mobile menu functionality
  function openMobileMenu() {
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
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
      
      // Add event listener
      hotspot.addEventListener('click', function(e) {
        e.preventDefault();
        const productHandle = this.dataset.productHandle;
        if (productHandle) {
          openModal(productHandle);
        }
      });
    });
  }

  // Modal functionality
  function openModal(productHandle) {
    fetch(`/products/${productHandle}.js`)
      .then(response => response.json())
      .then(product => {
        console.log('Product data:', product); // Debug log
        console.log('Product variants:', product.variants); // Debug log
        populateModal(product);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      })
      .catch(error => console.error('Error loading product:', error));
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function populateModal(product) {
    // Set basic product info
    document.getElementById('modalProductTitle').textContent = product.title;
    document.getElementById('modalProductPrice').textContent = formatMoney(product.price);
    document.getElementById('modalProductDescription').textContent = product.description || 
      'This one-piece swimsuit is crafted from jersey featuring an allover micro Monogram motif in relief.';
    
    // Set product image
    if (product.featured_image) {
      document.getElementById('modalProductImage').src = product.featured_image;
      document.getElementById('modalProductImage').alt = product.title;
    }

    // COMPREHENSIVE DEBUG: Log ALL product data structure
    console.log('=== COMPLETE PRODUCT DATA ===');
    console.log('Full product object:', product);
    console.log('Product options:', product.options);
    console.log('Product variants:', product.variants);
    
    // Log each variant's structure
    if (product.variants && product.variants.length > 0) {
      console.log('=== VARIANT ANALYSIS ===');
      product.variants.forEach((variant, index) => {
        console.log(`Variant ${index}:`, {
          id: variant.id,
          title: variant.title,
          option1: variant.option1,
          option2: variant.option2,
          option3: variant.option3,
          available: variant.available
        });
      });
    }

    // Try to determine which option contains colors
    let colorOptionKey = null;
    let sizeOptionKey = null;
    
    // Check option names to determine which is color and which is size
    if (product.options && product.options.length > 0) {
      console.log('=== OPTION ANALYSIS ===');
      product.options.forEach((option, index) => {
        console.log(`Option ${index + 1}:`, option);
        const optionName = option.name ? option.name.toLowerCase() : '';
        const optionKey = `option${index + 1}`;
        
        if (optionName.includes('color') || optionName.includes('colour')) {
          colorOptionKey = optionKey;
          console.log(`🎨 Found COLOR in ${optionKey}: ${option.name}`);
        } else if (optionName.includes('size')) {
          sizeOptionKey = optionKey;
          console.log(`📏 Found SIZE in ${optionKey}: ${option.name}`);
        }
      });
    }

    // Fallback: if we can't determine from option names, try your original specification
    if (!colorOptionKey) {
      colorOptionKey = 'option2';
      console.log('🔄 Falling back to option2 for colors');
    }
    if (!sizeOptionKey) {
      sizeOptionKey = 'option1';
      console.log('🔄 Falling back to option1 for sizes');
    }

    console.log(`Final decision: Colors from ${colorOptionKey}, Sizes from ${sizeOptionKey}`);

    // Build color options dynamically
    const colorOptions = document.getElementById('colorOptions');
    colorOptions.innerHTML = ''; // Clear existing options
    
    // Get unique colors using the determined option key
    const colors = getUniqueOptionValues(product.variants, colorOptionKey);
    console.log('🎨 EXTRACTED COLORS:', colors);
    
    if (colors.length > 0) {
      colors.forEach((color, index) => {
        console.log(`Creating color button for: "${color}"`);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'color-option';
        button.dataset.color = color;
        if (index === 0) button.classList.add('selected');
        
        // Create color bar with dynamic color
        const colorBar = document.createElement('div');
        colorBar.className = 'color-bar';
        const colorValue = getColorValue(color);
        colorBar.style.backgroundColor = colorValue;
        console.log(`Color "${color}" mapped to: ${colorValue}`);
        
        // Create color text with the actual color name from the product
        const colorText = document.createElement('span');
        colorText.textContent = color;
        
        button.appendChild(colorBar);
        button.appendChild(colorText);
        button.addEventListener('click', () => selectColor(button, product));
        colorOptions.appendChild(button);
      });
    } else {
      // Fallback if no colors found
      console.warn('❌ NO COLORS FOUND! Creating default option');
      const defaultButton = document.createElement('button');
      defaultButton.type = 'button';
      defaultButton.className = 'color-option selected';
      defaultButton.dataset.color = 'Default';
      defaultButton.innerHTML = '<div class="color-bar" style="background-color: #CCCCCC;"></div><span>No Color Options</span>';
      colorOptions.appendChild(defaultButton);
    }

    // Build size options dynamically
    const sizeSelect = document.getElementById('sizeOptions');
    sizeSelect.innerHTML = '<option value="">Choose your size</option>';
    
    // Get unique sizes using the determined option key
    const sizes = getUniqueOptionValues(product.variants, sizeOptionKey);
    console.log('📏 EXTRACTED SIZES:', sizes);
    
    sizes.forEach(size => {
      console.log(`Creating size option for: "${size}"`);
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size;
      sizeSelect.appendChild(option);
    });

    // Store the option keys for later use in addToCart
    window.currentProductConfig = {
      colorOptionKey,
      sizeOptionKey,
      product
    };

    // Set up form submission
    const form = document.getElementById('modalProductForm');
    form.onsubmit = (e) => {
      e.preventDefault();
      addToCart(product);
    };
  }

  function selectColor(button, product) {
    // Remove selected class from all color options
    document.querySelectorAll('.color-option').forEach(btn => {
      btn.classList.remove('selected');
    });
    // Add selected class to clicked button
    button.classList.add('selected');
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
    
    // Try exact match first, then lowercase match
    return colorMap[colorName] || colorMap[colorName.toLowerCase()] || '#CCCCCC';
  }

  function getUniqueOptionValues(variants, optionKey) {
    if (!variants || !Array.isArray(variants)) {
      console.warn('No variants found or variants is not an array');
      return [];
    }
    
    const values = new Set();
    variants.forEach(variant => {
      if (variant && variant[optionKey] && variant[optionKey].trim() !== '') {
        values.add(variant[optionKey].trim()); // Trim whitespace
      }
    });
    
    const uniqueValues = Array.from(values);
    console.log(`Unique ${optionKey} values:`, uniqueValues); // Debug log
    return uniqueValues;
  }

  function addToCart(product) {
    const selectedColor = document.querySelector('.color-option.selected')?.dataset.color;
    const selectedSize = document.getElementById('sizeOptions').value;

    console.log('Selected options:', { color: selectedColor, size: selectedSize }); // Debug log

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    if (!selectedColor) {
      alert('Please select a color');
      return;
    }

    // Find the matching variant - FIXED: Using correct option mapping
    const variant = product.variants.find(v => {
      const match = v.option1 === selectedSize && v.option2 === selectedColor;
      console.log(`Checking variant: ${v.option1} === ${selectedSize} && ${v.option2} === ${selectedColor} = ${match}`);
      return match;
    });

    console.log('Found variant:', variant); // Debug log

    if (!variant) {
      alert('This combination is not available');
      return;
    }

    if (!variant.available) {
      alert('This variant is out of stock');
      return;
    }

    // Add main product to cart
    const formData = {
      items: [{
        id: variant.id,
        quantity: 1
      }]
    };

    // Check if we need to auto-add Soft Winter Jacket
    if (selectedColor === AUTO_ADD_CONDITIONS.color && 
        selectedSize === AUTO_ADD_CONDITIONS.size) {
      // Fetch Soft Winter Jacket and add it
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
          // If winter jacket fetch fails, just add the main product
          submitToCart(formData);
        });
    } else {
      submitToCart(formData);
    }
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
      closeModal();
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
      });
  }

  function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  function formatMoney(cents) {
    return '€' + (cents / 100).toFixed(2);
  }

  // Event listeners
  modalOverlay.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);

  // ESC key to close modal and mobile menu
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (modal.classList.contains('active')) {
        closeModal();
      }
      if (mobileMenuOverlay && mobileMenuOverlay.classList.contains('active')) {
        closeMobileMenu();
      }
    }
  });

  // Initialize hotspots with random positioning
  initializeHotspots();
});