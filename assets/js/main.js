(function($) {
    var $window = $(window),
        $body = $('body'),
        browser = {
            canUse: function(prop) {
                var test = document.createElement('div');
                return (prop in test.style);
            },
            name: navigator.userAgent.match(/Edge\/|Trident\/|MSIE /) ? 'ie' : ''
        };

    // Function to check if element is in viewport
    function inViewport($el) {
        var rect = $el[0].getBoundingClientRect();
        return (
            rect.bottom >= 0 &&
            rect.right >= 0 &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Lazy load images with fade-in effect
    function lazyLoadImages() {
        $('.lazy').each(function() {
            var $img = $(this);
            if (inViewport($img) && !$img.hasClass('loaded')) {
                $img.addClass('loaded');
            }
        });
    }

    // Play initial animations on page load.
    $window.on('load', function() {
        setTimeout(function() {
            $body.removeClass('is-preload');
        }, 100);
    });

    // Hack: Enable IE workarounds.
    if (browser.name == 'ie') {
        $body.addClass('is-ie');
    }

    // Mobile detection.
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        $body.addClass('is-mobile');
    }

    // Scrolly.
    $('.scrolly').scrolly({
        offset: 100
    });

    // Polyfill: Object fit.
    if (!browser.canUse('object-fit')) {
        $('.image[data-position]').each(function() {
            var $this = $(this),
                $img = $this.children('img');

            $this.css({
                'background-image': 'url("' + $img.attr('src') + '")',
                'background-position': $this.data('position'),
                'background-size': 'cover',
                'background-repeat': 'no-repeat'
            });
            $img.css('opacity', '0');
        });

        $('.gallery > a').each(function() {
            var $this = $(this),
                $img = $this.children('img');

            $this.css({
                'background-image': 'url("' + $img.attr('src') + '")',
                'background-position': 'center',
                'background-size': 'cover',
                'background-repeat': 'no-repeat'
            });
            $img.css('opacity', '0');
        });
    } else {
        // For browsers supporting object-fit, show images directly
        $('.gallery > a > img').css('opacity', '1');
    }

    // Gallery.
    $('.gallery').on('click', 'a', function(event) {
        var $a = $(this),
            $gallery = $a.parents('.gallery'),
            $modal = $gallery.children('.modal'),
            $modalImg = $modal.find('img'),
            href = $a.attr('href');

        // Not an image? Bail.
        if (!href.match(/\.(jpg|gif|webp|png|mp4)$/)) {
            return;
        }

        // Prevent default.
        event.preventDefault();
        event.stopPropagation();

        // Locked? Bail.
        if ($modal[0]._locked) {
            return;
        }

        // Lock.
        $modal[0]._locked = true;

        // Set src.
        $modalImg.attr('src', href);

        // Set visible.
        $modal.addClass('visible');

        // Focus.
        $modal.focus();

        // Delay.
        setTimeout(function() {
            // Unlock.
            $modal[0]._locked = false;
        }, 600);
    }).on('click', '.modal', function(event) {
        var $modal = $(this),
            $modalImg = $modal.find('img');

        // Locked? Bail.
        if ($modal[0]._locked) {
            return;
        }

        // Already hidden? Bail.
        if (!$modal.hasClass('visible')) {
            return;
        }

        // Stop propagation.
        event.stopPropagation();

        // Lock.
        $modal[0]._locked = true;

        // Clear visible, loaded.
        $modal.removeClass('loaded');

        // Delay.
        setTimeout(function() {
            $modal.removeClass('visible');
            setTimeout(function() {
                // Clear src.
                $modalImg.attr('src', '');

                // Unlock.
                $modal[0]._locked = false;

                // Focus.
                $body.focus();
            }, 475);
        }, 125);
    }).on('keypress', '.modal', function(event) {
        var $modal = $(this);

        // Escape? Hide modal.
        if (event.keyCode == 27) {
            $modal.trigger('click');
        }
    }).on('mouseup mousedown mousemove', '.modal', function(event) {
        // Stop propagation.
        event.stopPropagation();
    }).prepend('<div class="modal" tabIndex="-1"><div class="inner"><img src="" /></div></div>')
      .find('img').on('load', function(event) {
          var $modalImg = $(this),
              $modal = $modalImg.parents('.modal');

          setTimeout(function() {
              // No longer visible? Bail.
              if (!$modal.hasClass('visible')) {
                  return;
              }

              // Set loaded.
              $modal.addClass('loaded');
          }, 275);
      });

    // Smooth image loading on scroll.
    $window.on('scroll', function() {
        lazyLoadImages();
    });

    // Initial load check
    lazyLoadImages();

})(jQuery);
