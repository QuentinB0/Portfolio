(function($) {
    // Variables pour fenêtre et corps du document
    let $window = $(window),
        $body = $('body'),
        browser = {
            // Fonction pour vérifier si le navigateur peut utiliser une propriété CSS
            canUse: function(prop) {
                let test = document.createElement('div');
                return (prop in test.style);
            },
            // Détection du navigateur (Edge, Trident pour IE)
            name: navigator.userAgent.match(/Edge\/|Trident\/|MSIE /) ? 'ie' : ''
        };

    // Fonction pour vérifier si un élément est dans la fenêtre visible
    function inViewport($el) {
        let rect = $el[0].getBoundingClientRect();
        return (
            rect.bottom >= 0 &&
            rect.right >= 0 &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Fonction de chargement paresseux des images avec effet de fondu
    function lazyLoadImages() {
        $('.lazy').each(function() {
            let $img = $(this);
            if (inViewport($img) && !$img.hasClass('loaded')) {
                $img.addClass('loaded');
            }
        });
    }

    // Jouer les animations initiales lors du chargement de la page
    $window.on('load', function() {
        setTimeout(function() {
            $body.removeClass('is-preload');
        }, 100);
    });

    // Hack : Activer les solutions de contournement pour IE
    if (browser.name == 'ie') {
        $body.addClass('is-ie');
    }

    // Détection mobile
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        $body.addClass('is-mobile');
    }

    // Effet de défilement
    $('.scrolly').scrolly({
        offset: 100
    });

    // Polyfill : Object fit
    if (!browser.canUse('object-fit')) {
        $('.image[data-position]').each(function() {
            let $this = $(this),
                $img = $this.children('img');

            $this.css({
                'background-image': `url(${$img.attr('src')})`,
                'background-position': $this.data('position'),
                'background-size': 'cover',
                'background-repeat': 'no-repeat'
            });
            $img.css('opacity', '0');
        });

        $('.gallery > a').each(function() {
            let $this = $(this),
                $img = $this.children('img');

            $this.css({
                'background-image': `url(${$img.attr('src')})`,
                'background-position': 'center',
                'background-size': 'cover',
                'background-repeat': 'no-repeat'
            });
            $img.css('opacity', '0');
        });
    } else {
        // Pour les navigateurs supportant object-fit, montrer les images directement
        $('.gallery > a > img').css('opacity', '1');
    }

    // Galerie
    $('.gallery').on('click', 'a', function(event) {
        let $a = $(this),
            $gallery = $a.parents('.gallery'),
            $modal = $gallery.children('.modal'),
            $modalImg = $modal.find('img'),
            href = $a.attr('href');

        // Si ce n'est pas une image, sortir
        if (!href.match(/\.(jpg|gif|webp|png|mp4)$/)) {
            return;
        }

        // Prévenir l'action par défaut
        event.preventDefault();
        event.stopPropagation();

        // Si la modal est verrouillée, sortir
        if ($modal[0]._locked) {
            return;
        }

        // Verrouiller la modal
        $modal[0]._locked = true;

        // Définir la source de l'image
        $modalImg.attr('src', href);

        // Rendre la modal visible
        $modal.addClass('visible');

        // Mettre la modal en focus
        $modal.focus();

        // Délai pour le déverrouillage
        setTimeout(function() {
            // Déverrouiller la modal
            $modal[0]._locked = false;
        }, 600);
    }).on('click', '.modal', function(event) {
        let $modal = $(this),
            $modalImg = $modal.find('img');

        // Si la modal est verrouillée, sortir
        if ($modal[0]._locked) {
            return;
        }

        // Si la modal est déjà cachée, sortir
        if (!$modal.hasClass('visible')) {
            return;
        }

        // Arrêter la propagation de l'événement
        event.stopPropagation();

        // Verrouiller la modal
        $modal[0]._locked = true;

        // Enlever la classe 'loaded' pour préparer l'animation de fermeture
        $modal.removeClass('loaded');

        // Délai pour rendre l'animation de fermeture plus rapide
        setTimeout(function() {
            $modal.removeClass('visible');
            // Effacer la source de l'image après que l'animation de fermeture soit terminée
            setTimeout(function() {
                // Effacer la source de l'image
                $modalImg.attr('src', '');

                // Déverrouiller la modal
                $modal[0]._locked = false;

                // Mettre le focus sur le body
                $body.focus();
            }, 200); // Réduit à 200ms pour éviter les artefacts visuels
        }, 300); // Fermeture plus rapide
    }).on('keypress', '.modal', function(event) {
        let $modal = $(this);

        // Si la touche échap est pressée, cacher la modal
        if (event.keyCode == 27) {
            $modal.trigger('click');
        }
    }).on('mouseup mousedown mousemove', '.modal', function(event) {
        // Arrêter la propagation de l'événement
        event.stopPropagation();
    }).prepend('<div class="modal" tabIndex="-1"><div class="inner"><img src="" /></div></div>')
      .find('img').on('load', function(event) {
          let $modalImg = $(this),
              $modal = $modalImg.parents('.modal');

          setTimeout(function() {
              // Si la modal n'est plus visible, sortir
              if (!$modal.hasClass('visible')) {
                  return;
              }

              // Ajouter la classe 'loaded' à la modal
              $modal.addClass('loaded');
          }, 275);
      });

    // Chargement fluide des images lors du défilement
    $window.on('scroll', function() {
        lazyLoadImages();
    });

    // Vérification initiale du chargement
    lazyLoadImages();

})(jQuery);
