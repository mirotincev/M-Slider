
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
                rtl: false,
                autoplay: true,
                easing: 'swing',
               
            };

            _.initials = {
                animating: false,
                currentX: 0,
                currentSlide: 0,
                animationTime: 500,
                direction: 'next',
                $wrap: null,
                $dots: null,
                $nextArrow: null,
                $prevArrow: null,
                paginate: [],
                slideCount: 1,
                $slideTrack: null,
                $slides: null,
                $sliderWidth: 0,
                $slidesLeft: 0,
                $slideWidth: 100,
                swipeLeft: null,
                touchObject: {},
                activeSlides:[],
                transformsEnabled: false
            };

            $.extend(_, _.initials);

            dataSettings = $(element).data('mslider') || {};

            _.options = $.extend({}, _.defaults, dataSettings, settings);

            _.$slider = $(element); 
            _.paused = false;
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
         _.$sliderWidth = _.$slider[0].scrollWidth;
         if( typeof _.options.items !== 'number' ) {
            _.slideCount = _.$slider.children().length;
         } else {
            _.slideCount = Math.ceil(_.$sliderWidth / _.options.items ); 
         }
         
         var slide = document.createElement('div'), 
            ul = document.createElement('ul'), 
            newDotes = document.createDocumentFragment();
            slide.className = [_.options.className,'dots'].join('__');
            ul.className = [_.options.className,'dots-list'].join('__');
            if (!_.options.dots) {
                ul.className += ' hidden'; 
            }

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
            
    };

    MSlider.prototype.buildArrow = function() {
        var _ = this;

        if (_.options.arrows === true ) {

            _.$prevArrow = $(_.options.prevArrow).addClass([_.options.className,'arrow'].join('__'));
            _.$nextArrow = $(_.options.nextArrow).addClass([_.options.className,'arrow'].join('__'));
            //if( _.slideCount > _.options.slidesToShow ) {
                $(_.options.appendArrows)
                    .prepend(_.$prevArrow)
                    .append(_.$nextArrow);
                
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

    MSlider.prototype.chankPage = function() {
        var _ = this;
        var itemSlide = _.options.element.children().length;
        var sliderCountArray = Array.apply(null, Array(itemSlide)).map(function (_, i) {return i;});
        var visibleItem = Math.ceil(itemSlide / _.slideCount);
        var j;
        for (var i = 0, j = sliderCountArray.length; i < j; i+=visibleItem) {
            var start = i,
                end = i+visibleItem;
            if(i+visibleItem > itemSlide ) {
                end = itemSlide;
                start = itemSlide - visibleItem;
            }
            _.paginate.push(sliderCountArray.slice(start, end));
        }
    }

    MSlider.prototype.unbindArrow = function() {
        var _ = this;
    }

    MSlider.prototype.buildWrap = function() {
        var _ = this;
        var slide = document.createElement('div');
        slide.className = [_.options.className,'wrap'].join('__') 
        _.options.element
            .addClass([_.options.className,'content'].join('__'))
            .wrapAll(slide);
        _.$wrap = $(_.options.element).parent(slide);
        //_.options.appendArrows = $(_.$wrap);  

        _.options.element.children().addClass([_.options.className,'item'].join('__') )
        
            _.buildDots();
            _.chankPage();
        if (_.options.arrows) {
            _.buildArrow();
        }
        _.setDotsClasses(_.currentSlide);
        
          
    };

    MSlider.prototype.unBuildWrap = function() {
        var _ = this;
         _.options.wrap.unwrap();
    };
 
    MSlider.prototype.changeSlide = function(e, data) {
        e.preventDefault();
        var _ = e.data.slider;
        if (_.animating === true) {
            return;
        }
        _[e.data.action](e.data);
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
        setTimeout(function () {
            _.buildWrap();
            _.initializeEvents();    
            _.setSlideClasses(true);
            if (_.options.autoplay === true) {
               _.autoPlay();
            }   
            _.$slider.trigger('m-slider:initialize', _);     
        }, 50)
        
    };

    MSlider.prototype.initializeEvents = function() {
        var _ = this,x1,y1,shiftX,shiftY, t1,
            currentX = 0; // initial index
            _.touchObject = {};
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

        _.$slider.children()
        .on({
            // start
            'touchstart.mslider': function(e) {
                /*console.log('touchstart')*/
                var eo = e.originalEvent.touches[0], swipeDirection;
                    x1 = eo.clientX;
                    y1 = eo.clientY;
                    _.paused = true;
                    _.touchObject.clientX = x1;
                    _.touchObject.clientY = y1;
                    //e.stopPropagation();
                    //e.preventDefault();
            },
            // move
            'touchmove.mslider': function(e) {
                /*console.log('touchmove')  */
                var eo = e.originalEvent.touches[0], swipeDirection;
                    shiftX = eo.clientX - x1;
                    shiftY = eo.clientY - y1;
                    _.touchObject.shiftX = eo.clientX;
                    _.touchObject.shiftY = eo.clientY;
                    swipeDirection = _.swipeDirection();
                    if( ['left', 'right'].indexOf( swipeDirection) !== -1 ){
                       e.stopPropagation();
                       e.preventDefault();
                    }
            },
            // end
            'touchend.mslider': function(e) {
                /*console.log('touchend');*/
                var swipeDirection;
                var scrollTop = $('body').scrollTop();
                _.paused = false;
                swipeDirection = _.swipeDirection();

                    /*console.log('swipeDirection', swipeDirection)*/
                /*console.log('shiftX', shiftX)*/
                    if( swipeDirection === 'left' ) {
                        _.nextSlide();
                    } else if( swipeDirection === 'right' ) {
                        _.prevSlide();
                    }

                    /*console.log('shiftY swipeDirection', swipeDirection , shiftY);*/
                    /* доводка страницы */
                    /*if( ['up', 'down'].indexOf( swipeDirection) !== -1 && Math.abs(shiftY) > 40 ) {
                        if( swipeDirection === 'up'  ) {
                            $('body').animate({
                                scrollTop: scrollTop + Math.abs(shiftY) * 1.9
                            })
                        } else {
                            $('body').animate({
                                scrollTop: scrollTop - Math.abs(shiftY) * 1.9
                            })
                        }
                    }*/
                    shiftX = undefined;
    
                /*console.log('touchend.touchSlides')  */
            },
            // cancel / reset
            'touchcancel.mslider': function() {
                /*console.log('touchcancel.touchSlides')*/
            },
            // left custom slide event
            'slideLeft.mslider': function(e, customStep) {
                console.info('slideLeft.touchSlides')  
            },
            // right custom slide event
            'slideRight.mslider': function(e, customStep) {
                console.info('slideRight.touchSlides')  
            }
        })

    };

    MSlider.prototype.swipeDirection = function() {

        var xDist, yDist, r, swipeAngle, _ = this;
        xDist = _.touchObject.clientX - _.touchObject.shiftX;
        yDist = _.touchObject.clientY - _.touchObject.shiftY;

        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }
        /*console.log('swipeAngle', swipeAngle)*/
        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return (_.options.rtl === false ? 'right' : 'left');
        }
        //if (_.options.verticalSwiping === true) {
            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                return 'up';
            } else {
                return 'down';
            }
        //}

        return 'vertical';

    };

    MSlider.prototype.slide = function (currentX) {
        var _ = this;
        /*console.log('currentX', currentX);*/
        _.currentX = currentX;

            _.animating = false;
            _.$slider.children().css({
                '-webkit-transition':'-webkit-transform '+ _.animationTime +'ms ease-out',
                '-webkit-transform': 'translate3d('+ currentX +'px, 0, 0)'
            });
            _.autoPlay();
            _.setDotsClasses();
            _.setSlideClasses();
            _.animating = false;
            _.$slider.trigger('m-slider:change', _);
    }

    MSlider.prototype.goToSlide = function(data) {
        var _ = this;    
        var widthSlide = _._widthSlide();
        //var sLeft = _.$slider.scrollLeft();
        var nextSlide = data.itemSlide * widthSlide;
        _.animating = true;
        _.direction = 'next';
        if( sLeft > 0 ) {
            if(_.currentSlide < data.itemSlide ){
                // nextSlide = nextSlide - sLeft;
            } else {
                 // nextSlide = sLeft - nextSlide;
                _.direction = 'prev';
            }
        } else {
            _.currentSlide = data.itemSlide - 1;
        }
        _.currentSlide = data.itemSlide;   
        _.animationTime = 200;
        _.slide(-Math.abs(_.currentSlide * widthSlide));
    }

    MSlider.prototype.prevSlide = function() {
        var _ = this;    
        _.direction = 'prev';
         _.animating = true;
         _.animationTime = 500;
         _.autoPlayTimer = 0;
         --_.currentSlide;
        if( _.currentSlide < 0 ) {
            _.animationTime = 200;
            _.currentSlide = _.slideCount -1;
        } 
        var widthSlide = _._widthSlide();
        _.$slider.trigger('m-slider:prevSlide', _ );
        _.slide( -Math.abs(_.currentSlide * widthSlide) );
    };

    MSlider.prototype.nextSlide = function() {
        var _ = this;    
         var widthSlide = _._widthSlide();
         //var sLeft = _.$slider.scrollLeft();
         _.autoPlayTimer = 5;
         _.direction = 'next';
         _.animating = true;
         _.animationTime = 500;
         ++_.currentSlide;
         if( _.slideCount === _.currentSlide ) {
            _.animationTime = 200;
            _.currentSlide = 0;
         }
         
         _.$slider.trigger('m-slider:nextSlide', _ );
         _.slide(-Math.abs(_.currentSlide * widthSlide));
    };

    MSlider.prototype._correctWidth = function(nextSlide, direction) {
        var _ = this;    
        var widthSlide = _._widthSlide(nextSlide);
        // var sLeft = _.$slider.scrollLeft();
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
            widthSlide = 0;
            if( typeof _.options.items === 'number' ) {
                var nextItems = 0;
                if( _.direction === 'next' ) {
                    nextItems = _.currentSlide < _.slideCount ? ( _.currentSlide + 1 ) * _.options.items : _.slideCount * _.options.items;
                } else {
                    nextItems = _.currentSlide > 0 ? ( _.currentSlide - 1 ) * _.options.items : (_.slideCount - 1 ) *_.options.items;
                }

                for (var i = 0; i < _.$slider.children().length; i++) {
                    if( i < nextItems && i >= nextItems - _.options.items){
                        widthSlide = widthSlide + $(_.$slider.children()[i]).outerWidth(true); 
                    }
                }
            } else {
                widthSlide = _.$slider.children().eq(0).innerWidth();        
            }
        return widthSlide;
    };

    MSlider.prototype.setSlideClasses = function( isInit ) {
        var _ = this;
        if (_.options.arrows) {
            var classNameActive = [_.options.className,'item--active'].join('__');
            _.activeSlides = _.paginate[_.currentSlide];   
            _.$slider.children().removeClass(classNameActive);
            $.each(_.activeSlides, function (index, item) {
                _.$slider.children().eq(item).addClass(classNameActive);
            })      
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

        if ( _.paused !== true && _.options.autoplay === true) {
            _.autoPlayTimer = setInterval(function() {
                if(_.direction === 'next') {
                    _.nextSlide();
                } else {
                    _.prevSlide();
                }
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
