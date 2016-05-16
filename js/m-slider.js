
(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function($) {
    'use strict';
    var MSlider = window.MSlider || {};

    MSlider = (function() {

        var instanceUid = 0;

        function MSlider(element, settings) {

            var _ = this, dataSettings;

            _.defaults = {
                element: $(element),
                wrap: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                dots: true,
                className: 'm-slider',
                prevArrow: '<button type="button" data-role="none" class="m-slider__arrow m-slider__arrow--prev" aria-label="Previous" tabindex="0" role="button">Previous</button>',
                nextArrow: '<button type="button" data-role="none" class="m-slider__arrow m-slider__arrow--next" aria-label="Next" tabindex="0" role="button">Next</button>',
                items: 1,
                autoplaySpeed: 5000,
                autoPlayTimer: null,
                autoplay: true,
                easing: 'swing',
               
            };

            _.initials = {
                animating: false,
                currentSlide: 0,
                animationTime: 1000,
                direction: '',
                $wrap: null,
                $dots: null,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                $slideTrack: null,
                $slides: null,
                $sliderWidth: 0,
                $slidesLeft: 0,
                $slideWidth: 100,
                swipeLeft: null,
                touchObject: {},
                activeSlides:{
                    start: 0,
                    end: 0
                },
                transformsEnabled: false
            };

            $.extend(_, _.initials);

            dataSettings = $(element).data('mslider') || {};

            _.options = $.extend({}, _.defaults, dataSettings, settings);

            _.$slider = $(element); 
            _.paused = false;
            _.$sliderWidth = _.$slider[0].scrollWidth;
            _.$slideWidth = _.$slider.children().eq(0).innerWidth();

            _.autoPlay = $.proxy(_.autoPlay, _);

            _.$slider.trigger('m-slider:init', _);    
            _.init(true);

        }

        return MSlider;

    }());


    MSlider.prototype.buildDots = function() {
         var _ = this;
         var widthSlide = _._widthSlide();
         _.slideCount = Math.ceil(_.$sliderWidth / widthSlide);
         var slide = document.createElement('div'),
            ul = document.createElement('ul'), 
            newDotes = document.createDocumentFragment();
            slide.className = [_.options.className,'dots'].join('__');
            ul.className = [_.options.className,'dots-list'].join('__');

            for (var i = 1; i < _.slideCount + 1; i++) {
                var li = $(document.createElement('li')).append($(document.createElement('span')).text(i));
                    li.addClass([_.options.className,'dot'].join('__'));
                li.on('click.slider', { 
                    slider: _,
                    itemSlide: i - 1,
                    action: "goToSlide" 
                }, _.changeSlide );
                $(ul).append(li);
            }
            _.$slideDotes = $(ul);
            newDotes.appendChild(ul);
            _.$slider.after(newDotes);
            _.setDotsClasses(_.currentSlide);
    };

    MSlider.prototype.buildArrow = function() {
        var _ = this;

        if (_.options.arrows === true ) {

            _.$prevArrow = $(_.options.prevArrow).addClass([_.options.className,'arrow'].join('__'));
            _.$nextArrow = $(_.options.nextArrow).addClass([_.options.className,'arrow'].join('__'));
            //if( _.slideCount > _.options.slidesToShow ) {
                _.$wrap.append(_.$nextArrow);
                _.$wrap.prepend(_.$prevArrow);
            //} 

                _.$prevArrow.on('click.slider', { 
                    slider: _,
                    action: "prevSlide" 
                }, _.changeSlide );
                _.$nextArrow.on('click.slider', { 
                    slider: _,
                    action: "nextSlide" 
                }, _.changeSlide );
        }
    };

    MSlider.prototype.buildWrap = function() {
        var _ = this;
        var slide = document.createElement('div');
        slide.className = [_.options.className,'wrap'].join('__') 
        _.options.element.wrapAll(slide);
        _.$wrap = $(_.options.element).parent(slide);
        _.options.appendArrows = $(_.$wrap);
        if (_.options.dots) {
            _.buildDots();
        }
        if (_.options.arrows) {
            _.buildArrow();
        }
        
    };

    MSlider.prototype.unBuildWrap = function() {
        var _ = this;
         _.options.wrap.unwrap();
    };
 
    MSlider.prototype.changeSlide = function(e, data) {
        e.preventDefault();
        var slider = e.data.slider;
        slider[e.data.action](e.data);
    };

    MSlider.prototype.reinit = function(creation) {
        var _ = this;
        _.$wrap.find(document.getElementsByClassName([_.options.className,'dots-list'].join('__'))).remove();
        if (_.options.dots) {
            _.buildDots();
        }
    
        _.setSlideClasses();
        _.$slider.trigger('m-slider:reinit', _);
    }

    MSlider.prototype.init = function(creation) {
        var _ = this;
        _.buildWrap();
        _.initializeEvents();    
        _.setSlideClasses(true);
        if (_.options.autoplay === true) {
            _.autoPlay();
        }
        _.$slider.trigger('m-slider:initialize', _); 
    };

    MSlider.prototype.initializeEvents = function() {
        var _ = this;
        _.$slider
        .on('mouseenter', function(event) {
            _.paused = true;
            _.autoPlay();
        })
        .on('mouseleave', function(event) {
            _.paused = false;
            _.autoPlay();
        })
        .on('scroll', function(event) {
            
        }).trigger('scroll');

        $(window).on('resize', function (event) {
             _.reinit();   
        });

    };

    MSlider.prototype.slide = function (currentX) {
        var _ = this;
        var animationTime = 1000;
        var nextScroll = _.direction === 'next' ? '+=' : '-=';
        _.$slider
            .animate( 
            { 
                scrollLeft: nextScroll + currentX 
            }, 
            _.animationTime ,
            _.options.easing, 
            function (param) {
                _.autoPlay();
                _.setDotsClasses();
                _.setSlideClasses();
                _.$slider.trigger('m-slider:change', _);
            });
    }
    //currentSlide
    MSlider.prototype.goToSlide = function(data) {
        var _ = this;    
        var widthSlide = _._widthSlide();
        var sLeft = _.$slider.scrollLeft();
        var nextSlide = data.itemSlide * widthSlide;
        _.direction = 'next';
        if( sLeft > 0 ) {
            if(_.currentSlide < data.itemSlide ){
                nextSlide = nextSlide - sLeft;
            } else {
                 nextSlide = sLeft - nextSlide;
                _.direction = 'prev';
            }
        } else {
            _.currentSlide = data.itemSlide - 1;
        }
        _.currentSlide = data.itemSlide;   
        _.slide(nextSlide);
    }

    MSlider.prototype.prevSlide = function() {
        var _ = this;    
        var widthSlide = _._widthSlide();
        var sLeft = _.$slider.scrollLeft();
        var nextSlide = sLeft === 0 ? _.$sliderWidth - widthSlide : widthSlide ;
        if( _.$slider.scrollLeft() === 0 ) {
            _.direction = 'next';
            _.animationTime = 300;
            _.currentSlide = _.slideCount;
        } else {
            _.direction = 'prev';
            _.animationTime = 1000;
            --_.currentSlide;
            nextSlide = _._correctWidth(nextSlide, 'prev');
        }
        _.$slider.trigger('m-slider:prevSlide', _);
         _.slide(nextSlide);
    };

    MSlider.prototype.nextSlide = function() {
        var _ = this;    
         var widthSlide = _._widthSlide();
         var sLeft = _.$slider.scrollLeft();
         var nextSlide = sLeft + _.$slider.innerWidth() < _.$sliderWidth ? widthSlide : _.$sliderWidth;
         if( nextSlide === _.$sliderWidth ) {
            _.direction = 'prev';
            _.animationTime = 300;
            _.currentSlide = 0;
         } else {
            _.animationTime = 1000;
            _.direction = 'next';   
            ++_.currentSlide;
            nextSlide = _._correctWidth(nextSlide, 'next');
         }
         _.$slider.trigger('m-slider:nextSlide', _);
         _.slide(nextSlide);
    };

    MSlider.prototype._correctWidth = function(nextSlide, direction) {
        var _ = this;    
        var widthSlide = _._widthSlide(nextSlide);
        var sLeft = _.$slider.scrollLeft();
        var correctWidth = sLeft / nextSlide ;
            correctWidth = correctWidth.toString().split('.')[1];
            if( typeof correctWidth === 'string' ){
                if( direction === 'prev' ) {
                    nextSlide = nextSlide * Number([0,correctWidth].join('.'));
                } else {
                    nextSlide = nextSlide - nextSlide * Number([0,correctWidth].join('.'));    
                }    
            }
        return Math.abs(nextSlide).toFixed(0);    
    }

    MSlider.prototype._widthSlide = function() {
        var _ = this,
            widthSlide;
            if( typeof _.options.items === 'number' ) {
                widthSlide = _.$slideWidth * _.options.items;
            } else {
                widthSlide = _.$slider.innerWidth();        
            }
        return widthSlide;
    };

    MSlider.prototype.setSlideClasses = function( isInit ) {
        var _ = this;
        if (_.options.arrows) {
            
            var classNameActive = [_.options.className,'item--active'].join('__');
            var widthSlider = _.$slider.innerWidth();
            var widthSlide = _._widthSlide();
            var countInSlide = Math.floor(widthSlide / _.$slideWidth );
            var countInSlider = Math.floor(widthSlider / _.$slideWidth );
            _.activeSlides.start = _.currentSlide * countInSlide, 
            _.activeSlides.end = (_.currentSlide + 1) * countInSlide;

            if( typeof _.options.items === 'number' ) {
                if( _.currentSlide === 0 ) {
                    _.activeSlides.start = 0;
                    _.activeSlides.end = widthSlider / _.$slideWidth;
                } else {
                    _.activeSlides.start = _.activeSlides.start + _.options.items;
                    _.activeSlides.end = _.activeSlides.end + _.options.items;
                }

                if( _.slideCount === _.currentSlide + 1 ) {
                    _.activeSlides.start = _.$slider.children().length - countInSlider, 
                    _.activeSlides.end = _.$slider.children().length
                } else {
                    _.activeSlides.start = _.activeSlides.start;
                    _.activeSlides.end = _.activeSlides.end;   
                }
               
            } else {
                if( _.slideCount === _.currentSlide + 1 ) {
                    _.activeSlides.start = _.$slider.children().length - countInSlide, 
                    _.activeSlides.end = _.$slider.children().length
                }
            }

            _.$slider.children()
                .removeClass(classNameActive)            
                .slice( _.activeSlides.start , _.activeSlides.end)
                .addClass(classNameActive);
        }

    }

    MSlider.prototype.setDotsClasses = function() {
        var _ = this;
        if (_.options.dots) {
            var classNameActive = [_.options.className,'dot--active'].join('__'); 
            _.$slideDotes.children().removeClass(classNameActive);
            _.$slideDotes.children().eq(_.currentSlide).addClass(classNameActive);
        }
    }

    MSlider.prototype.autoPlay = function() {

        var _ = this;
        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

        if ( _.paused !== true) {
            _.autoPlayTimer = setInterval(function() {
                _.nextSlide();
            }, _.options.autoplaySpeed);
        }

    };


    $.fn.MSlider = function() {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].MSlider = new MSlider(_[i], opt);
            else
                ret = _[i].mslider[opt].apply(_[i].mslider, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));
