document.addEventListener("DOMContentLoaded", function() {

  $(".opensLayer").hammer().on("tap", function() {
    // Create a new WebView that...
    webView = new steroids.views.WebView({ location: this.getAttribute("data-location") });

    // ...is pushed to the navigation stack, opening on top of the current WebView.
    steroids.layers.push({ view: webView });
  });

  $(".opensModal").hammer().on("tap", function() {
    // Create a new webview that...
    webView = new steroids.views.WebView({ location: this.getAttribute("data-location") });

    // ...opens as a modal window on top of the current WebView.
    steroids.modal.show({ view: webView });
  });

  $(".closesModal").hammer().on("tap", function() {
    steroids.modal.hide();
  });

});
