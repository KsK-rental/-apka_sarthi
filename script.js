// Wait for Google Maps script to load
function initAutocomplete() {
  if (typeof google === 'undefined') {
    setTimeout(initAutocomplete, 100); // Retry after 100ms if script not loaded
    return;
  }
  const pickupInput = document.getElementById('pickup');
  const dropoffInput = document.getElementById('dropoff');
  if (!document.getElementById('manualLocation').checked) {
    new google.maps.places.Autocomplete(pickupInput);
    new google.maps.places.Autocomplete(dropoffInput);
  }
}

// Call initAutocomplete after the script loads
document.addEventListener('DOMContentLoaded', function() {
  initAutocomplete();
});

// Toggle location inputs (disable Google Maps Autocomplete if manual)
function toggleLocationInputs() {
  const manual = document.getElementById('manualLocation').checked;
  const pickupInput = document.getElementById('pickup');
  const dropoffInput = document.getElementById('dropoff');
  pickupInput.value = '';
  dropoffInput.value = '';
  if (manual) {
    pickupInput.removeAttribute('autocomplete');
    dropoffInput.removeAttribute('autocomplete');
  } else {
    initAutocomplete();
  }
}

// Show popup
function showPopup(message) {
  const popup = document.getElementById('pricePopup');
  const popupContent = popup.querySelector('p');
  popupContent.textContent = message;
  popup.style.display = 'flex';
}

// Close popup
function closePopup() {
  const popup = document.getElementById('pricePopup');
  popup.style.display = 'none';
}

// Calculate Price
function calculatePrice() {
  const pickup = document.getElementById('pickup').value;
  const dropoff = document.getElementById('dropoff').value;
  const manual = document.getElementById('manualLocation').checked;

  if (!pickup || !dropoff) {
    alert('Please enter both pickup and drop-off locations');
    return;
  }

  if (manual) {
    showPopup('Since you entered the location manually, we cannot calculate the price right now. The price will be shared by the rider after confirming your booking. चूँकि आपने मैन्युअल रूप से स्थान दर्ज किया है, इसलिए हम अभी कीमत की गणना नहीं कर सकते। आपकी बुकिंग की पुष्टि करने के बाद राइडर द्वारा कीमत साझा की जाएगी।');
    document.getElementById('price').style.display = 'none';
  } else {
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [pickup],
        destinations: [dropoff],
        travelMode: 'DRIVING',
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === 'OK') {
          const distance = response.rows[0].elements[0].distance.value / 1000; // in km
          let pricePerKm;

          if (distance < 5) pricePerKm = 5;
          else if (distance <= 8) pricePerKm = 4;
          else if (distance <= 20) pricePerKm = 3;
          else pricePerKm = 2;

          const totalPrice = (distance * pricePerKm).toFixed(2);
          document.getElementById('price').textContent = `Estimated Price: ₹${totalPrice} for ${distance.toFixed(2)} km`;
          document.getElementById('price').style.display = 'block';
        } else {
          showPopup('Error calculating distance: ' + status + '. The price will be shared by the rider after confirming your booking.');
          document.getElementById('price').style.display = 'none';
        }
      }
    );
  }
}

// Store booking details globally for Instagram and WhatsApp
let bookingDetails = {};

// Instagram Redirect (Share details to group)
function shareToInstagramGroup() {
  const message = `New Bike Ride Booking:\nName: ${bookingDetails.name}\nPhone: ${bookingDetails.phone}\nPickup: ${bookingDetails.pickup}\nDrop-off: ${bookingDetails.dropoff}${bookingDetails.price ? `\n${bookingDetails.price}` : ''}`;
  const instagramUrl = `https://www.instagram.com/j/Abad473vQQZ5VPJO/?message=${encodeURIComponent(message)}`;
  window.open(instagramUrl, '_blank');
}

// Instagram Redirect (Join group link for user)
function redirectToInstagram() {
  const instagramUrl = `https://www.instagram.com/j/Abad473vQQZ5VPJO/`;
  window.open(instagramUrl, '_blank');
}

// WhatsApp Redirect
function redirectToWhatsApp() {
  const message = `New Bike Ride Booking:\nName: ${bookingDetails.name}\nPhone: ${bookingDetails.phone}\nPickup: ${bookingDetails.pickup}\nDrop-off: ${bookingDetails.dropoff}${bookingDetails.price ? `\n${bookingDetails.price}` : ''}`;
  const whatsappUrl = `https://wa.me/+919981971917?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

// Form Submission
document.getElementById('bookingForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const pickup = document.getElementById('pickup').value;
  const dropoff = document.getElementById('dropoff').value;
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const price = document.getElementById('price').textContent;

  // Store booking details
  bookingDetails = { pickup, dropoff, name, phone, price };

  // Share details to Instagram group
  shareToInstagramGroup();

  // Show success message and action buttons
  document.getElementById('success').style.display = 'block';
  document.getElementById('actionButtons').style.display = 'flex';
  document.getElementById('bookingForm').reset();
  document.getElementById('price').style.display = 'none';
  document.getElementById('manualLocation').checked = false;
});