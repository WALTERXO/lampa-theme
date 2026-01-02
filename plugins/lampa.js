(function () {
    'use strict';

    // ============================================================================
    // ПОЛИФИЛЛЫ
    // ============================================================================
    
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    // ============================================================================
    // ЛОКАЛИЗАЦИЯ
    // ============================================================================
    
    Lampa.Lang.add({
        interface_mod_new_plugin_name: {
            ru: 'Интерфейс MOD',
            en: 'Interface MOD'
        },
        interface_mod_new_about_plugin: {
            ru: 'О плагине',
            en: 'About plugin'
        },
        interface_mod_new_show_movie_type: {
            ru: 'Показывать лейблы типа',
            en: 'Show type labels'
        },
        interface_mod_new_show_movie_type_desc: {
            ru: 'Показывать лейблы "Фильм" и "Сериал" на постере',
            en: 'Show "Movie" and "Series" labels on poster'
        },
        interface_mod_new_label_serial: {
            ru: 'Сериал',
            en: 'Series'
        },
        interface_mod_new_label_movie: {
            ru: 'Фильм',
            en: 'Movie'
        },
        interface_mod_new_info_panel: {
            ru: 'Новая инфо-панель',
            en: 'New info panel'
        },
        interface_mod_new_info_panel_desc: {
            ru: 'Цветная и перефразированная строка информации о фильме/сериале',
            en: 'Colored and rephrased info line about movie/series'
        },
        interface_mod_new_colored_ratings: {
            ru: 'Цветной рейтинг',
            en: 'Colored rating'
        },
        interface_mod_new_colored_ratings_desc: {
            ru: 'Включить цветовое выделение рейтинга',
            en: 'Enable colored rating highlight'
        },
        interface_mod_new_colored_status: {
            ru: 'Цветные статусы',
            en: 'Colored statuses'
        },
        interface_mod_new_colored_status_desc: {
            ru: 'Включить цветовое выделение статуса сериала',
            en: 'Enable colored series status'
        },
        interface_mod_new_colored_age: {
            ru: 'Цветные возрастные ограничения',
            en: 'Colored age ratings'
        },
        interface_mod_new_colored_age_desc: {
            ru: 'Включить цветовое выделение возрастных ограничений',
            en: 'Enable colored age rating highlight'
        },
        interface_mod_new_buttons_style_mode: {
            ru: 'Стиль кнопок',
            en: 'Button style'
        },
        interface_mod_new_buttons_style_mode_default: {
            ru: 'По умолчанию',
            en: 'Default'
        },
        interface_mod_new_buttons_style_mode_all: {
            ru: 'Показывать все кнопки',
            en: 'Show all buttons'
        },
        interface_mod_new_buttons_style_mode_custom: {
            ru: 'Пользовательский',
            en: 'Custom'
        },
        interface_mod_new_theme_select: {
            ru: 'Тема интерфейса',
            en: 'Interface theme'
        },
        interface_mod_new_theme_select_desc: {
            ru: 'Выберите тему оформления интерфейса',
            en: 'Choose interface theme'
        },
        interface_mod_new_theme_default: {
            ru: 'По умолчанию',
            en: 'Default'
        },
        interface_mod_new_theme_neon: {
            ru: 'Neon Style',
            en: 'Neon Style'
        },
        interface_mod_new_stylize_titles: {
            ru: 'Новый стиль заголовков',
            en: 'New titles style'
        },
        interface_mod_new_stylize_titles_desc: {
            ru: 'Включает стильное оформление заголовков подборок с анимацией и спецэффектами',
            en: 'Enables stylish titles with animation and special effects'
        },
        interface_mod_new_watch_progress: {
            ru: 'Виджет просмотра',
            en: 'Watch progress widget'
        },
        interface_mod_new_watch_progress_desc: {
            ru: 'Показывать виджет с прогрессом просмотра',
            en: 'Show watch progress widget'
        },
        interface_mod_new_lazy_load: {
            ru: 'Ленивая загрузка',
            en: 'Lazy loading'
        },
        interface_mod_new_lazy_load_desc: {
            ru: 'Загружать изображения только при появлении на экране',
            en: 'Load images only when visible on screen'
        },
        interface_mod_new_webp_conversion: {
            ru: 'WebP формат',
            en: 'WebP format'
        },
        interface_mod_new_webp_conversion_desc: {
            ru: 'Использовать WebP для постеров (экономия трафика)',
            en: 'Use WebP for posters (saves traffic)'
        }
    });

    // ============================================================================
    // НАСТРОЙКИ ПО УМОЛЧАНИЮ
    // ============================================================================
    
    var settings = {
        show_movie_type: Lampa.Storage.get('interface_mod_new_show_movie_type', true),
        info_panel: Lampa.Storage.get('interface_mod_new_info_panel', true),
        colored_ratings: Lampa.Storage.get('interface_mod_new_colored_ratings', true),
        buttons_style_mode: Lampa.Storage.get('interface_mod_new_buttons_style_mode', 'default'),
        theme: Lampa.Storage.get('interface_mod_new_theme_select', 'neon'),
        stylize_titles: Lampa.Storage.get('interface_mod_new_stylize_titles', true),
        watch_progress: Lampa.Storage.get('interface_mod_new_watch_progress', true),
        lazy_load: Lampa.Storage.get('interface_mod_new_lazy_load', true),
        webp_conversion: Lampa.Storage.get('interface_mod_new_webp_conversion', true)
    };

    // ============================================================================
    // УТИЛИТЫ
    // ============================================================================
    
    var Utils = {
        // Склонение слов
        plural: function(number, one, two, five) {
            var n = Math.abs(number);
            n %= 100;
            if (n >= 5 && n <= 20) return five;
            n %= 10;
            if (n === 1) return one;
            if (n >= 2 && n <= 4) return two;
            return five;
        },

        // Дебаунсинг
        debounce: function(func, wait) {
            var timeout;
            return function() {
                var context = this;
                var args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    func.apply(context, args);
                }, wait);
            };
        },

        // Форматирование длительности
        formatDuration: function(minutes) {
            if (!minutes || minutes <= 0) return '';
            var hours = Math.floor(minutes / 60);
            var mins = minutes % 60;
            var result = '';
            if (hours > 0) {
                result += hours + ' ' + this.plural(hours, 'час', 'часа', 'часов');
                if (mins > 0) result += ' ' + mins + ' ' + this.plural(mins, 'минута', 'минуты', 'минут');
            } else {
                result += mins + ' ' + this.plural(mins, 'минута', 'минуты', 'минут');
            }
            return result;
        },

        // Расчет средней длительности серии
        calculateAverageEpisodeDuration: function(movie) {
            if (!movie || typeof movie !== 'object') return 0;
            var totalDuration = 0;
            var episodeCount = 0;
            
            if (movie.episode_run_time && Array.isArray(movie.episode_run_time) && movie.episode_run_time.length > 0) {
                var filtered = movie.episode_run_time.filter(function(duration) {
                    return duration > 0 && duration <= 200;
                });
                if (filtered.length > 0) {
                    filtered.forEach(function(duration) {
                        totalDuration += duration;
                        episodeCount++;
                    });
                }
            } else if (movie.seasons && Array.isArray(movie.seasons)) {
                movie.seasons.forEach(function(season) {
                    if (season.episodes && Array.isArray(season.episodes)) {
                        season.episodes.forEach(function(episode) {
                            if (episode.runtime && episode.runtime > 0 && episode.runtime <= 200) {
                                totalDuration += episode.runtime;
                                episodeCount++;
                            }
                        });
                    }
                });
            }
            
            if (episodeCount > 0) return Math.round(totalDuration / episodeCount);
            
            if (movie.last_episode_to_air && movie.last_episode_to_air.runtime && 
                movie.last_episode_to_air.runtime > 0 && movie.last_episode_to_air.runtime <= 200) {
                return movie.last_episode_to_air.runtime;
            }
            
            return 0;
        },

        // Конвертация URL в WebP
        toWebP: function(url) {
            if (!settings.webp_conversion || !url) return url;
            
            // Проверяем, поддерживается ли WebP
            if (!this.isWebPSupported()) return url;
            
            // Если это TMDB изображение, используем параметр для WebP
            if (url.indexOf('image.tmdb.org') !== -1) {
                // TMDB не поддерживает WebP напрямую, но можно использовать прокси
                return url;
            }
            
            // Для других источников пытаемся заменить расширение
            if (url.match(/\.(jpg|jpeg|png)$/i)) {
                return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            }
            
            return url;
        },

        // Проверка поддержки WebP
        isWebPSupported: function() {
            if (typeof this._webpSupported !== 'undefined') {
                return this._webpSupported;
            }
            
            var elem = document.createElement('canvas');
            if (!!(elem.getContext && elem.getContext('2d'))) {
                this._webpSupported = elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            } else {
                this._webpSupported = false;
            }
            
            return this._webpSupported;
        }
    };

    // ============================================================================
    // ЦЕНТРАЛИЗОВАННЫЙ DOM НАБЛЮДАТЕЛЬ
    // ============================================================================
    
    var DOMWatcher = {
        observers: [],
        callbacks: [],
        
        init: function() {
            var self = this;
            
            // Единый наблюдатель для всех изменений DOM
            var mainObserver = new MutationObserver(function(mutations) {
                self.callbacks.forEach(function(callback) {
                    callback(mutations);
                });
            });
            
            mainObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'data-card', 'data-type']
            });
            
            this.observers.push(mainObserver);
        },
        
        addCallback: function(callback) {
            this.callbacks.push(callback);
        },
        
        destroy: function() {
            this.observers.forEach(function(observer) {
                observer.disconnect();
            });
            this.observers = [];
            this.callbacks = [];
        }
    };

    // ============================================================================
    // КЭШИРОВАНИЕ DOM ЭЛЕМЕНТОВ
    // ============================================================================
    
    var DOMCache = {
        cache: {},
        
        get: function(selector, refresh) {
            if (!refresh && this.cache[selector]) {
                return this.cache[selector];
            }
            var elements = document.querySelectorAll(selector);
            this.cache[selector] = elements;
            return elements;
        },
        
        clear: function(selector) {
            if (selector) {
                delete this.cache[selector];
            } else {
                this.cache = {};
            }
        }
    };

    // ============================================================================
    // ЛЕНИВАЯ ЗАГРУЗКА ИЗОБРАЖЕНИЙ
    // ============================================================================
    
    var LazyLoader = {
        observer: null,
        loadedImages: new Set(),
        
        init: function() {
            if (!settings.lazy_load) return;
            
            // Используем IntersectionObserver для определения видимости
            var options = {
                root: null,
                rootMargin: '200px', // Начинаем загрузку за 200px до появления
                threshold: 0.01
            };
            
            var self = this;
            this.observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        self.loadImage(entry.target);
                    }
                });
            }, options);
            
            // Обрабатываем существующие изображения
            this.processExistingImages();
            
            // Слушаем новые изображения
            DOMWatcher.addCallback(Utils.debounce(function(mutations) {
                self.processNewImages(mutations);
            }, 100));
        },
        
        processExistingImages: function() {
            var images = document.querySelectorAll('img[src*="image.tmdb.org"], .card__img, .full-start__img');
            var self = this;
            
            images.forEach(function(img) {
                self.setupLazyLoad(img);
            });
        },
        
        processNewImages: function(mutations) {
            var self = this;
            
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            if (node.tagName === 'IMG') {
                                self.setupLazyLoad(node);
                            }
                            
                            var images = node.querySelectorAll('img[src*="image.tmdb.org"], .card__img, .full-start__img');
                            images.forEach(function(img) {
                                self.setupLazyLoad(img);
                            });
                        }
                    });
                }
            });
        },
        
        setupLazyLoad: function(img) {
            if (this.loadedImages.has(img)) return;
            
            var src = img.getAttribute('src') || img.getAttribute('data-src');
            if (!src) return;
            
            // Сохраняем оригинальный URL
            if (!img.hasAttribute('data-original-src')) {
                img.setAttribute('data-original-src', src);
                
                // Конвертируем в WebP если нужно
                var webpSrc = Utils.toWebP(src);
                img.setAttribute('data-src', webpSrc);
                
                // Устанавливаем placeholder
                img.setAttribute('src', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"%3E%3Crect width="400" height="600" fill="%23222"%3E%3C/rect%3E%3C/svg%3E');
                img.style.backgroundColor = '#1a1a1a';
            }
            
            this.observer.observe(img);
        },
        
        loadImage: function(img) {
            if (this.loadedImages.has(img)) return;
            
            var src = img.getAttribute('data-src');
            if (!src) return;
            
            var self = this;
            var tempImg = new Image();
            
            tempImg.onload = function() {
                img.src = src;
                img.style.backgroundColor = '';
                img.classList.add('lazy-loaded');
                self.loadedImages.add(img);
                self.observer.unobserve(img);
            };
            
            tempImg.onerror = function() {
                // Если WebP не загрузился, пробуем оригинал
                var originalSrc = img.getAttribute('data-original-src');
                if (originalSrc && originalSrc !== src) {
                    img.src = originalSrc;
                }
                self.loadedImages.add(img);
                self.observer.unobserve(img);
            };
            
            tempImg.src = src;
        },
        
        destroy: function() {
            if (this.observer) {
                this.observer.disconnect();
            }
            this.loadedImages.clear();
        }
    };

    // ============================================================================
    // D-PAD НАВИГАЦИЯ С ВИЗУАЛЬНЫМ ФИДБЭКОМ
    // ============================================================================
    
    var DPadNavigation = {
        currentFocused: null,
        
        init: function() {
            this.addStyles();
            this.enhanceFocusVisibility();
            
            // Слушаем изменения фокуса
            var self = this;
            DOMWatcher.addCallback(function(mutations) {
                self.enhanceFocusVisibility();
            });
            
            // Обработка клавиш
            document.addEventListener('keydown', function(e) {
                self.handleKeyPress(e);
            });
        },
        
        addStyles: function() {
            if (document.getElementById('dpad-navigation-styles')) return;
            
            var style = document.createElement('style');
            style.id = 'dpad-navigation-styles';
            style.textContent = `
                /* Неоновый фокус для карточек */
                .card.focus .card__view,
                .card.hover .card__view {
                    box-shadow: 
                        0 0 20px rgba(0, 255, 255, 0.6),
                        0 0 40px rgba(0, 255, 255, 0.4),
                        0 0 60px rgba(0, 255, 255, 0.2),
                        inset 0 0 20px rgba(0, 255, 255, 0.1) !important;
                    border: 2px solid #00ffff !important;
                    transform: scale(1.08);
                }
                
                /* Неоновый фокус для кнопок */
                .selector.focus,
                button.focus,
                .full-start__button.focus,
                .settings-param.focus,
                .menu__item.focus {
                    box-shadow: 
                        0 0 15px rgba(255, 0, 255, 0.6),
                        0 0 30px rgba(255, 0, 255, 0.4),
                        inset 0 0 15px rgba(255, 0, 255, 0.2) !important;
                    border: 2px solid #ff00ff !important;
                    background: linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(0, 255, 255, 0.2)) !important;
                }
                
                /* Неоновый фокус для элементов меню */
                .menu__item.focus .menu__ico,
                .menu__item.hover .menu__ico {
                    filter: drop-shadow(0 0 10px #00ffff) drop-shadow(0 0 20px #00ffff);
                }
                
                /* Пульсация для активного элемента */
                .card.focus .card__view::before,
                .selector.focus::before,
                button.focus::before {
                    content: '';
                    position: absolute;
                    top: -4px;
                    left: -4px;
                    right: -4px;
                    bottom: -4px;
                    border-radius: inherit;
                    background: linear-gradient(45deg, #00ffff, #ff00ff, #00ffff);
                    z-index: -1;
                    opacity: 0.3;
                }
                
                /* Breadcrumbs для навигации */
                .navigation-breadcrumbs {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    background: rgba(0, 0, 0, 0.8);
                    padding: 10px 20px;
                    border-radius: 20px;
                    border: 1px solid #00ffff;
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
                    z-index: 10000;
                    font-size: 1.2em;
                    color: #00ffff;
                    font-family: 'Courier New', monospace;
                }
                
                /* Индикатор направления */
                .direction-indicator {
                    position: fixed;
                    bottom: 40px;
                    right: 40px;
                    width: 80px;
                    height: 80px;
                    background: rgba(0, 0, 0, 0.8);
                    border-radius: 50%;
                    border: 2px solid #00ffff;
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    pointer-events: none;
                }
                
                .direction-indicator.active {
                    opacity: 1;
                }
                
                .direction-indicator svg {
                    width: 40px;
                    height: 40px;
                    fill: #00ffff;
                    filter: drop-shadow(0 0 5px #00ffff);
                }
                
                /* Плавные переходы */
                .card, .selector, button, .menu__item {
                    transition: transform 0.15s ease, box-shadow 0.15s ease, border 0.15s ease;
                }
            `;
            document.head.appendChild(style);
            
            // Добавляем breadcrumbs
            this.createBreadcrumbs();
            this.createDirectionIndicator();
        },
        
        createBreadcrumbs: function() {
            if (document.querySelector('.navigation-breadcrumbs')) return;
            
            var breadcrumbs = document.createElement('div');
            breadcrumbs.className = 'navigation-breadcrumbs';
            breadcrumbs.textContent = 'Главная';
            document.body.appendChild(breadcrumbs);
        },
        
        createDirectionIndicator: function() {
            if (document.querySelector('.direction-indicator')) return;
            
            var indicator = document.createElement('div');
            indicator.className = 'direction-indicator';
            indicator.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2l9 9-9 9V2z"/></svg>';
            document.body.appendChild(indicator);
        },
        
        enhanceFocusVisibility: function() {
            var focusedElement = document.querySelector('.focus');
            
            if (focusedElement && focusedElement !== this.currentFocused) {
                this.currentFocused = focusedElement;
                this.updateBreadcrumbs(focusedElement);
                
                // Прокручиваем к элементу если нужно
                this.scrollToFocused(focusedElement);
            }
        },
        
        updateBreadcrumbs: function(element) {
            var breadcrumbs = document.querySelector('.navigation-breadcrumbs');
            if (!breadcrumbs) return;
            
            var path = 'Главная';
            
            if (element.closest('.menu')) {
                path = 'Меню';
            } else if (element.closest('.full-start')) {
                path = 'Детали фильма';
            } else if (element.closest('.settings')) {
                path = 'Настройки';
            } else if (element.closest('.search')) {
                path = 'Поиск';
            } else if (element.classList.contains('card')) {
                var title = element.querySelector('.card__title');
                if (title) {
                    path = 'Каталог > ' + title.textContent.substring(0, 20);
                }
            }
            
            breadcrumbs.textContent = path;
        },
        
        scrollToFocused: function(element) {
            var rect = element.getBoundingClientRect();
            var windowHeight = window.innerHeight;
            var windowWidth = window.innerWidth;
            
            // Если элемент не полностью видим, прокручиваем
            if (rect.top < 100 || rect.bottom > windowHeight - 100 ||
                rect.left < 100 || rect.right > windowWidth - 100) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
            }
        },
        
        handleKeyPress: function(e) {
            var indicator = document.querySelector('.direction-indicator');
            if (!indicator) return;
            
            var arrow = indicator.querySelector('svg');
            var rotation = 0;
            
            switch(e.keyCode) {
                case 38: // Up
                    rotation = -90;
                    break;
                case 40: // Down
                    rotation = 90;
                    break;
                case 37: // Left
                    rotation = 180;
                    break;
                case 39: // Right
                    rotation = 0;
                    break;
                default:
                    return;
            }
            
            arrow.style.transform = 'rotate(' + rotation + 'deg)';
            indicator.classList.add('active');
            
            setTimeout(function() {
                indicator.classList.remove('active');
            }, 300);
        }
    };

    // ============================================================================
    // МЕНЕДЖЕР ЛЕЙБЛОВ
    // ============================================================================
    
    var LabelManager = {
        init: function() {
            if (!settings.show_movie_type) return;
            
            this.addStyles();
            this.processExistingCards();
            
            var self = this;
            DOMWatcher.addCallback(Utils.debounce(function(mutations) {
                self.handleMutations(mutations);
            }, 100));
            
            // Слушатель для детальной страницы
            Lampa.Listener.follow('full', function(data) {
                if (data.type === 'complite' && data.data.movie) {
                    self.handleDetailPage(data);
                }
            });
        },
        
        addStyles: function() {
            if (document.getElementById('movie_type_styles_new')) return;
            
            var style = document.createElement('style');
            style.id = 'movie_type_styles_new';
            style.textContent = `
                .content-label-new {
                    position: absolute !important;
                    left: 0.5em !important;
                    bottom: 0.5em !important;
                    background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.3)) !important;
                    backdrop-filter: blur(10px);
                    color: #fff !important;
                    font-size: 1.2em !important;
                    padding: 0.3em 0.8em !important;
                    border-radius: 20px !important;
                    font-weight: 700;
                    z-index: 10 !important;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
                    text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
                }
                
                .serial-label-new {
                    background: linear-gradient(135deg, rgba(0, 255, 255, 0.4), rgba(0, 128, 255, 0.4)) !important;
                    border-color: #00ffff !important;
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
                }
                
                .movie-label-new {
                    background: linear-gradient(135deg, rgba(255, 0, 255, 0.4), rgba(255, 0, 128, 0.4)) !important;
                    border-color: #ff00ff !important;
                    box-shadow: 0 0 20px rgba(255, 0, 255, 0.6);
                }
                
                body[data-movie-labels-new="on"] .card--tv .card__type {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
            
            document.body.setAttribute('data-movie-labels-new', settings.show_movie_type ? 'on' : 'off');
        },
        
        processExistingCards: function() {
            var cards = document.querySelectorAll('.card');
            var self = this;
            cards.forEach(function(card) {
                self.addLabelToCard(card);
            });
        },
        
        handleMutations: function(mutations) {
            if (!settings.show_movie_type) return;
            
            var self = this;
            var cardsToUpdate = new Set();
            
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('card')) {
                                cardsToUpdate.add(node);
                            }
                            var cards = node.querySelectorAll('.card');
                            cards.forEach(function(card) {
                                cardsToUpdate.add(card);
                            });
                        }
                    });
                }
                
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'class' || 
                     mutation.attributeName === 'data-card' || 
                     mutation.attributeName === 'data-type')) {
                    var targetNode = mutation.target;
                    if (targetNode.classList && targetNode.classList.contains('card')) {
                        cardsToUpdate.add(targetNode);
                    }
                }
            });
            
            cardsToUpdate.forEach(function(card) {
                self.updateCardLabel(card);
            });
        },
        
        addLabelToCard: function(card) {
            if (!settings.show_movie_type || !card) return;
            
            var view = card.querySelector('.card__view');
            if (!view || card.querySelector('.content-label-new')) return;
            
            var isTv = false;
            var cardText = card.textContent.toLowerCase();
            
            if (card.classList.contains('card--tv') || 
                (card.querySelector('.card__type') && card.querySelector('.card__type').textContent.trim() === 'TV')) {
                isTv = true;
            }
            
            // Фильтрация нежелательного контента
            var isUnwantedContent = false;
            if (card.closest('.sisi-results, .sisi-videos, .sisi-section') ||
                card.closest('[data-component="sisi"]') ||
                card.closest('[data-name*="sisi"]')) {
                isUnwantedContent = true;
            }
            
            if (window.location.href.indexOf('sisi') !== -1) {
                isUnwantedContent = true;
            }
            
            if (card.querySelector('.card__quality, .card__time')) {
                isUnwantedContent = true;
            }
            
            if (/(xxx|porn|эрот|секс|порно|для взрослых|sex|adult|erotica)/i.test(cardText)) {
                isUnwantedContent = true;
            }
            
            if (!isUnwantedContent) {
                var label = document.createElement('div');
                label.className = 'content-label-new';
                var shouldAddLabel = false;
                
                if (isTv) {
                    label.classList.add('serial-label-new');
                    label.textContent = Lampa.Lang.translate('interface_mod_new_label_serial');
                    shouldAddLabel = true;
                } else {
                    var hasMovieTraits = card.querySelector('.card__age') ||
                        card.querySelector('.card__vote') ||
                        /\b(19|20)\d{2}\b/.test(cardText) ||
                        /(фильм|movie|полнометражный)/i.test(cardText);
                    
                    if (hasMovieTraits) {
                        label.classList.add('movie-label-new');
                        label.textContent = Lampa.Lang.translate('interface_mod_new_label_movie');
                        shouldAddLabel = true;
                    }
                }
                
                if (shouldAddLabel) {
                    view.appendChild(label);
                }
            }
        },
        
        updateCardLabel: function(card) {
            if (!settings.show_movie_type || !card) return;
            var existingLabel = card.querySelector('.content-label-new');
            if (existingLabel) {
                existingLabel.remove();
            }
            this.addLabelToCard(card);
        },
        
        handleDetailPage: function(data) {
            if (!settings.show_movie_type) return;
            
            var movie = data.data.movie;
            var posterContainer = data.object.activity.render().find('.full-start__poster');
            
            if (posterContainer.length && movie) {
                var isTv = false;
                if (movie.number_of_seasons > 0 || movie.seasons || movie.season_count > 0) {
                    isTv = true;
                } else if (movie.type === 'tv' || movie.card_type === 'tv') {
                    isTv = true;
                }
                
                var existingLabel = posterContainer.find('.content-label-new');
                if (existingLabel.length) {
                    existingLabel.remove();
                }
                
                var label = $('<div class="content-label-new"></div>');
                if (isTv) {
                    label.addClass('serial-label-new');
                    label.text(Lampa.Lang.translate('interface_mod_new_label_serial'));
                } else {
                    label.addClass('movie-label-new');
                    label.text(Lampa.Lang.translate('interface_mod_new_label_movie'));
                }
                
                posterContainer.css('position', 'relative');
                posterContainer.append(label);
            }
        }
    };

    // ============================================================================
    // ИНФОРМАЦИОННАЯ ПАНЕЛЬ
    // ============================================================================
    
    var InfoPanel = {
        colors: {
            seasons: { bg: 'linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 200, 255, 0.3))', text: '#00ffff', border: '#00ffff' },
            episodes: { bg: 'linear-gradient(135deg, rgba(255, 0, 255, 0.3), rgba(200, 0, 255, 0.3))', text: '#ff00ff', border: '#ff00ff' },
            duration: { bg: 'linear-gradient(135deg, rgba(0, 255, 128, 0.3), rgba(0, 200, 100, 0.3))', text: '#00ff80', border: '#00ff80' },
            next: { bg: 'linear-gradient(135deg, rgba(255, 128, 0, 0.3), rgba(255, 100, 0, 0.3))', text: '#ff8000', border: '#ff8000' },
            genres: {
                'Боевик': { bg: 'linear-gradient(135deg, rgba(255, 0, 0, 0.3), rgba(200, 0, 0, 0.3))', text: '#ff0000', border: '#ff0000' },
                'Приключения': { bg: 'linear-gradient(135deg, rgba(0, 255, 128, 0.3), rgba(0, 200, 100, 0.3))', text: '#00ff80', border: '#00ff80' },
                'Мультфильм': { bg: 'linear-gradient(135deg, rgba(255, 0, 255, 0.3), rgba(200, 0, 200, 0.3))', text: '#ff00ff', border: '#ff00ff' },
                'Комедия': { bg: 'linear-gradient(135deg, rgba(255, 255, 0, 0.3), rgba(200, 200, 0, 0.3))', text: '#ffff00', border: '#ffff00' },
                'Криминал': { bg: 'linear-gradient(135deg, rgba(128, 0, 0, 0.3), rgba(100, 0, 0, 0.3))', text: '#ff4444', border: '#ff4444' },
                'Документальный': { bg: 'linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 200, 200, 0.3))', text: '#00ffff', border: '#00ffff' },
                'Драма': { bg: 'linear-gradient(135deg, rgba(128, 0, 255, 0.3), rgba(100, 0, 200, 0.3))', text: '#8800ff', border: '#8800ff' },
                'Семейный': { bg: 'linear-gradient(135deg, rgba(0, 255, 128, 0.3), rgba(0, 200, 100, 0.3))', text: '#00ff80', border: '#00ff80' },
                'Фэнтези': { bg: 'linear-gradient(135deg, rgba(255, 0, 255, 0.3), rgba(200, 0, 200, 0.3))', text: '#ff00ff', border: '#ff00ff' },
                'История': { bg: 'linear-gradient(135deg, rgba(255, 128, 0, 0.3), rgba(200, 100, 0, 0.3))', text: '#ff8000', border: '#ff8000' },
                'Ужасы': { bg: 'linear-gradient(135deg, rgba(128, 0, 0, 0.3), rgba(100, 0, 0, 0.3))', text: '#ff0000', border: '#ff0000' },
                'Музыка': { bg: 'linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 200, 200, 0.3))', text: '#00ffff', border: '#00ffff' },
                'Детектив': { bg: 'linear-gradient(135deg, rgba(0, 128, 255, 0.3), rgba(0, 100, 200, 0.3))', text: '#0080ff', border: '#0080ff' },
                'Мелодрама': { bg: 'linear-gradient(135deg, rgba(255, 0, 128, 0.3), rgba(200, 0, 100, 0.3))', text: '#ff0080', border: '#ff0080' },
                'Фантастика': { bg: 'linear-gradient(135deg, rgba(0, 128, 255, 0.3), rgba(0, 100, 200, 0.3))', text: '#0080ff', border: '#0080ff' },
                'Триллер': { bg: 'linear-gradient(135deg, rgba(255, 0, 0, 0.3), rgba(200, 0, 0, 0.3))', text: '#ff0000', border: '#ff0000' },
                'Военный': { bg: 'linear-gradient(135deg, rgba(128, 128, 128, 0.3), rgba(100, 100, 100, 0.3))', text: '#888888', border: '#888888' },
                'Вестерн': { bg: 'linear-gradient(135deg, rgba(255, 128, 0, 0.3), rgba(200, 100, 0, 0.3))', text: '#ff8000', border: '#ff8000' }
            }
        },
        
        init: function() {
            if (!settings.info_panel) return;
            
            var self = this;
            Lampa.Listener.follow('full', function(data) {
                if (data.type === 'complite' && settings.info_panel) {
                    setTimeout(function() {
                        self.renderInfoPanel(data);
                    }, 100);
                }
            });
        },
        
        renderInfoPanel: function(data) {
            var details = document.querySelector('.full-start-new__details');
            if (!details) return;
            
            var movie = data.data.movie;
            var isTvShow = movie && (movie.number_of_seasons > 0 || 
                (movie.seasons && movie.seasons.length > 0) || 
                movie.type === 'tv' || movie.type === 'serial');
            
            var originalDetails = details.innerHTML;
            details.innerHTML = '';
            
            var newContainer = document.createElement('div');
            newContainer.style.cssText = 'display: flex; flex-direction: column; width: 100%; gap: 0.8em; margin: 0.8em 0 0.8em 0';
            
            var firstRow = document.createElement('div');
            firstRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.6em; align-items: center; margin: 0 0 0.4em 0';
            
            var secondRow = document.createElement('div');
            secondRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.6em; align-items: center; margin: 0 0 0.4em 0';
            
            var thirdRow = document.createElement('div');
            thirdRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.6em; align-items: center; margin: 0 0 0.4em 0';
            
            if (isTvShow && movie && movie.seasons && Array.isArray(movie.seasons)) {
                this.renderTvShowInfo(movie, firstRow, secondRow, thirdRow, originalDetails);
            } else if (!isTvShow && movie && movie.runtime > 0) {
                this.renderMovieInfo(movie, secondRow, originalDetails);
            }
            
            this.renderGenres(originalDetails, thirdRow);
            
            newContainer.appendChild(firstRow);
            if (secondRow.children.length) newContainer.appendChild(secondRow);
            if (thirdRow.children.length) newContainer.appendChild(thirdRow);
            
            details.appendChild(newContainer);
        },
        
        renderTvShowInfo: function(movie, firstRow, secondRow, thirdRow, originalDetails) {
            var totalEpisodes = 0;
            var airedEpisodes = 0;
            var currentDate = new Date();
            var hasEpisodes = false;
            
            movie.seasons.forEach(function(season) {
                if (season.season_number === 0) return;
                if (season.episode_count) totalEpisodes += season.episode_count;
                
                if (season.episodes && Array.isArray(season.episodes) && season.episodes.length) {
                    hasEpisodes = true;
                    season.episodes.forEach(function(episode) {
                        if (episode.air_date) {
                            var epAirDate = new Date(episode.air_date);
                            if (epAirDate <= currentDate) airedEpisodes++;
                        }
                    });
                } else if (season.air_date) {
                    var airDate = new Date(season.air_date);
                    if (airDate <= currentDate && season.episode_count) {
                        airedEpisodes += season.episode_count;
                    }
                }
            });
            
            if (!hasEpisodes && movie.next_episode_to_air && movie.next_episode_to_air.season_number && movie.next_episode_to_air.episode_number) {
                var nextSeason = movie.next_episode_to_air.season_number;
                var nextEpisode = movie.next_episode_to_air.episode_number;
                var remainingEpisodes = 0;
                
                movie.seasons.forEach(function(season) {
                    if (season.season_number === nextSeason) {
                        remainingEpisodes = (season.episode_count || 0) - nextEpisode + 1;
                    } else if (season.season_number > nextSeason) {
                        remainingEpisodes += season.episode_count || 0;
                    }
                });
                
                if (remainingEpisodes > 0 && totalEpisodes > 0) {
                    var calculatedAired = totalEpisodes - remainingEpisodes;
                    if (calculatedAired >= 0 && calculatedAired <= totalEpisodes) {
                        airedEpisodes = calculatedAired;
                    }
                }
            }
            
            // Первая строка: сезоны и серии
            var seasonCount = movie.number_of_seasons || movie.seasons.filter(function(s) { return s.season_number !== 0; }).length;
            if (seasonCount > 0) {
                var seasonBadge = this.createBadge(
                    seasonCount + ' ' + Utils.plural(seasonCount, 'Сезон', 'Сезона', 'Сезонов'),
                    this.colors.seasons
                );
                firstRow.appendChild(seasonBadge);
            }
            
            var episodesText = '';
            if (totalEpisodes > 0 && airedEpisodes > 0 && airedEpisodes < totalEpisodes) {
                episodesText = airedEpisodes + ' ' + Utils.plural(airedEpisodes, 'Серия', 'Серии', 'Серий') + ' из ' + totalEpisodes;
            } else if (totalEpisodes > 0) {
                episodesText = totalEpisodes + ' ' + Utils.plural(totalEpisodes, 'Серия', 'Серии', 'Серий');
            }
            
            if (episodesText) {
                var episodeBadge = this.createBadge(episodesText, this.colors.episodes);
                firstRow.appendChild(episodeBadge);
            }
            
            // Вторая строка: метка о следующей серии
            if (movie.next_episode_to_air && movie.next_episode_to_air.air_date && airedEpisodes < totalEpisodes) {
                var nextDate = new Date(movie.next_episode_to_air.air_date);
                var today = new Date();
                nextDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                var diffDays = Math.floor((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                var nextText = '';
                if (diffDays === 0) nextText = 'Следующая серия уже сегодня';
                else if (diffDays === 1) nextText = 'Следующая серия уже завтра';
                else if (diffDays > 1) nextText = 'Следующая серия через ' + diffDays + ' ' + Utils.plural(diffDays, 'день', 'дня', 'дней');
                
                if (nextText) {
                    var nextBadge = this.createBadge(nextText, this.colors.next);
                    secondRow.appendChild(nextBadge);
                }
            }
            
            // Третья строка: длительность серии
            var avgDuration = Utils.calculateAverageEpisodeDuration(movie);
            if (avgDuration > 0) {
                var durationText = 'Длительность серии ≈ ' + Utils.formatDuration(avgDuration);
                var durationBadge = this.createBadge(durationText, this.colors.duration);
                thirdRow.appendChild(durationBadge);
            }
        },
        
        renderMovieInfo: function(movie, secondRow, originalDetails) {
            var mins = movie.runtime;
            var hours = Math.floor(mins / 60);
            var min = mins % 60;
            var text = 'Длительность фильма: ';
            
            if (hours > 0) text += hours + ' ' + Utils.plural(hours, 'час', 'часа', 'часов');
            if (min > 0) text += (hours > 0 ? ' ' : '') + min + ' мин.';
            
            var badge = this.createBadge(text, this.colors.duration);
            secondRow.appendChild(badge);
        },
        
        renderGenres: function(originalDetails, thirdRow) {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = originalDetails;
            
            var spans = tempDiv.querySelectorAll('span');
            var self = this;
            
            spans.forEach(function(span) {
                var text = span.textContent.trim();
                if (span.classList.contains('full-start-new__split')) return;
                
                // Пропускаем информацию о сезонах, сериях и времени
                if (text.match(/Сезон(?:ы)?:?\s*\d+/i) || 
                    text.match(/Серии?:?\s*\d+/i) ||
                    text.match(/Длительность/i) ||
                    text.match(/\d{2}:\d{2}/)) {
                    return;
                }
                
                var genres = text.split(' | ');
                if (genres.length > 1) {
                    genres.forEach(function(genre) {
                        genre = genre.trim();
                        var color = self.colors.genres[genre] || { 
                            bg: 'linear-gradient(135deg, rgba(128, 128, 128, 0.3), rgba(100, 100, 100, 0.3))', 
                            text: '#888888',
                            border: '#888888'
                        };
                        var badge = self.createBadge(genre, color);
                        thirdRow.appendChild(badge);
                    });
                } else {
                    var genre = text.trim();
                    if (genre) {
                        var color = self.colors.genres[genre] || { 
                            bg: 'linear-gradient(135deg, rgba(128, 128, 128, 0.3), rgba(100, 100, 100, 0.3))', 
                            text: '#888888',
                            border: '#888888'
                        };
                        var badge = self.createBadge(genre, color);
                        thirdRow.appendChild(badge);
                    }
                }
            });
        },
        
        createBadge: function(text, colors) {
            var badge = document.createElement('span');
            badge.textContent = text;
            badge.style.cssText = 'border-radius: 20px; border: 1px solid ' + colors.border + '; font-size: 1.3em; padding: 0.4em 1em; ' +
                'display: inline-block; white-space: nowrap; line-height: 1.4em; margin-right: 0.6em; ' +
                'margin-bottom: 0.4em; background: ' + colors.bg + '; color: ' + colors.text + '; ' +
                'box-shadow: 0 0 15px ' + colors.border.replace(')', ', 0.4)') + '; ' +
                'text-shadow: 0 0 10px ' + colors.text + '; ' +
                'backdrop-filter: blur(10px);';
            return badge;
        }
    };

    // ============================================================================
    // ЦВЕТНЫЕ РЕЙТИНГИ, СТАТУСЫ И ВОЗРАСТНЫЕ ОГРАНИЧЕНИЯ
    // ============================================================================
    
    var ColorManager = {
        init: function() {
            if (!settings.colored_ratings) return;
            
            var self = this;
            
            // Применяем цвета при загрузке
            setTimeout(function() {
                self.updateAllColors();
            }, 500);
            
            // Наблюдаем за изменениями
            DOMWatcher.addCallback(Utils.debounce(function() {
                self.updateAllColors();
            }, 100));
            
            // Слушатель для детальной страницы
            Lampa.Listener.follow('full', function(data) {
                if (data.type === 'complite') {
                    setTimeout(function() {
                        self.updateAllColors();
                    }, 100);
                }
            });
        },
        
        updateAllColors: function() {
            if (!settings.colored_ratings) return;
            
            this.updateVoteColors();
            this.colorizeSeriesStatus();
            this.colorizeAgeRating();
        },
        
        updateVoteColors: function() {
            var selectors = [
                '.card__vote',
                '.full-start__rate',
                '.full-start-new__rate',
                '.info__rate',
                '.card__imdb-rate',
                '.card__kinopoisk-rate'
            ];
            
            var elements = document.querySelectorAll(selectors.join(', '));
            elements.forEach(this.applyColorByRating);
        },
        
        applyColorByRating: function(element) {
            var voteText = element.textContent.trim();
            var match = voteText.match(/(\d+(\.\d+)?)/);
            if (!match) return;
            
            var vote = parseFloat(match[0]);
            var color = '';
            var glow = '';
            
            if (vote >= 0 && vote <= 3) {
                color = '#ff0000';
                glow = '0 0 15px rgba(255, 0, 0, 0.8)';
            } else if (vote > 3 && vote < 6) {
                color = '#ff8000';
                glow = '0 0 15px rgba(255, 128, 0, 0.8)';
            } else if (vote >= 6 && vote < 8) {
                color = '#00ffff';
                glow = '0 0 15px rgba(0, 255, 255, 0.8)';
            } else if (vote >= 8 && vote <= 10) {
                color = '#00ff80';
                glow = '0 0 15px rgba(0, 255, 128, 0.8)';
            }
            
            if (color) {
                element.style.color = color;
                element.style.textShadow = glow;
            }
        },
        
        colorizeSeriesStatus: function() {
            var statusColors = {
                completed: { bg: 'linear-gradient(135deg, rgba(0, 255, 128, 0.3), rgba(0, 200, 100, 0.3))', text: '#00ff80', border: '#00ff80' },
                canceled: { bg: 'linear-gradient(135deg, rgba(255, 0, 0, 0.3), rgba(200, 0, 0, 0.3))', text: '#ff0000', border: '#ff0000' },
                ongoing: { bg: 'linear-gradient(135deg, rgba(255, 128, 0, 0.3), rgba(200, 100, 0, 0.3))', text: '#ff8000', border: '#ff8000' },
                production: { bg: 'linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 200, 200, 0.3))', text: '#00ffff', border: '#00ffff' },
                planned: { bg: 'linear-gradient(135deg, rgba(255, 0, 255, 0.3), rgba(200, 0, 200, 0.3))', text: '#ff00ff', border: '#ff00ff' }
            };
            
            var statusElements = document.querySelectorAll('.full-start__status');
            statusElements.forEach(function(element) {
                var statusText = element.textContent.trim();
                var bgColor = '';
                var textColor = '';
                var borderColor = '';
                
                if (statusText.includes('Заверш') || statusText.includes('Ended')) {
                    bgColor = statusColors.completed.bg;
                    textColor = statusColors.completed.text;
                    borderColor = statusColors.completed.border;
                } else if (statusText.includes('Отмен') || statusText.includes('Canceled')) {
                    bgColor = statusColors.canceled.bg;
                    textColor = statusColors.canceled.text;
                    borderColor = statusColors.canceled.border;
                } else if (statusText.includes('Онгоинг') || statusText.includes('Выход') || 
                           statusText.includes('В процессе') || statusText.includes('Return')) {
                    bgColor = statusColors.ongoing.bg;
                    textColor = statusColors.ongoing.text;
                    borderColor = statusColors.ongoing.border;
                } else if (statusText.includes('производстве') || statusText.includes('Production')) {
                    bgColor = statusColors.production.bg;
                    textColor = statusColors.production.text;
                    borderColor = statusColors.production.border;
                } else if (statusText.includes('Запланировано') || statusText.includes('Planned')) {
                    bgColor = statusColors.planned.bg;
                    textColor = statusColors.planned.text;
                    borderColor = statusColors.planned.border;
                }
                
                if (bgColor) {
                    element.style.cssText = 'background: ' + bgColor + '; color: ' + textColor + '; ' +
                        'border-radius: 20px; border: 1px solid ' + borderColor + '; font-size: 1.3em; display: inline-block; ' +
                        'padding: 0.4em 1em; box-shadow: 0 0 15px ' + borderColor.replace(')', ', 0.6)') + '; ' +
                        'text-shadow: 0 0 10px ' + textColor + '; backdrop-filter: blur(10px);';
                }
            });
        },
        
        colorizeAgeRating: function() {
            var ageRatings = {
                kids: ['G', 'TV-Y', 'TV-G', '0+', '3+', '0', '3'],
                children: ['PG', 'TV-PG', 'TV-Y7', '6+', '7+', '6', '7'],
                teens: ['PG-13', 'TV-14', '12+', '13+', '14+', '12', '13', '14'],
                almostAdult: ['R', 'TV-MA', '16+', '17+', '16', '17'],
                adult: ['NC-17', '18+', '18', 'X']
            };
            
            var colors = {
                kids: { bg: 'linear-gradient(135deg, rgba(0, 255, 128, 0.3), rgba(0, 200, 100, 0.3))', text: '#00ff80', border: '#00ff80' },
                children: { bg: 'linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 200, 200, 0.3))', text: '#00ffff', border: '#00ffff' },
                teens: { bg: 'linear-gradient(135deg, rgba(255, 255, 0, 0.3), rgba(200, 200, 0, 0.3))', text: '#ffff00', border: '#ffff00' },
                almostAdult: { bg: 'linear-gradient(135deg, rgba(255, 128, 0, 0.3), rgba(200, 100, 0, 0.3))', text: '#ff8000', border: '#ff8000' },
                adult: { bg: 'linear-gradient(135deg, rgba(255, 0, 0, 0.3), rgba(200, 0, 0, 0.3))', text: '#ff0000', border: '#ff0000' }
            };
            
            var ratingElements = document.querySelectorAll('.full-start__pg');
            ratingElements.forEach(function(element) {
                var ratingText = element.textContent.trim();
                var group = null;
                
                for (var groupKey in ageRatings) {
                    if (ageRatings[groupKey].includes(ratingText)) {
                        group = groupKey;
                        break;
                    }
                    for (var i = 0; i < ageRatings[groupKey].length; i++) {
                        if (ratingText.includes(ageRatings[groupKey][i])) {
                            group = groupKey;
                            break;
                        }
                    }
                    if (group) break;
                }
                
                if (group) {
                    element.style.cssText = 'background: ' + colors[group].bg + '; color: ' + colors[group].text + '; ' +
                        'border-radius: 20px; border: 1px solid ' + colors[group].border + '; font-size: 1.3em; ' +
                        'padding: 0.4em 1em; box-shadow: 0 0 15px ' + colors[group].border.replace(')', ', 0.6)') + '; ' +
                        'text-shadow: 0 0 10px ' + colors[group].text + '; backdrop-filter: blur(10px);';
                }
            });
        }
    };

    // ============================================================================
    // ВИДЖЕТ ПРОГРЕССА ПРОСМОТРА
    // ============================================================================
    
    var WatchProgressWidget = {
        storageKey: 'interface_mod_watch_progress',
        
        init: function() {
            if (!settings.watch_progress) return;
            
            this.addStyles();
            this.renderWidget();
            
            // Обновляем виджет при изменении активности
            var self = this;
            Lampa.Activity.listener.follow('activity', function(e) {
                if (e.type === 'start' && e.component === 'main') {
                    setTimeout(function() {
                        self.renderWidget();
                    }, 500);
                }
            });
        },
        
        addStyles: function() {
            if (document.getElementById('watch-progress-styles')) return;
            
            var style = document.createElement('style');
            style.id = 'watch-progress-styles';
            style.textContent = `
                .watch-progress-widget {
                    display: flex;
                    align-items: center;
                    background: linear-gradient(135deg, rgba(20, 20, 20, 0.9), rgba(40, 40, 40, 0.9));
                    border-radius: 15px;
                    padding: 1.5em;
                    margin: 1.5em 0;
                    border: 2px solid rgba(0, 255, 255, 0.3);
                    box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
                    backdrop-filter: blur(10px);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                
                .watch-progress-widget:hover,
                .watch-progress-widget.focus {
                    transform: translateY(-4px);
                    box-shadow: 0 0 40px rgba(0, 255, 255, 0.5), 0 0 60px rgba(255, 0, 255, 0.3);
                    border-color: #00ffff;
                }
                
                .widget-poster {
                    position: relative;
                    width: 140px;
                    height: 210px;
                    border-radius: 10px;
                    overflow: hidden;
                    flex-shrink: 0;
                    border: 2px solid rgba(255, 0, 255, 0.3);
                    box-shadow: 0 0 20px rgba(255, 0, 255, 0.4);
                }
                
                .widget-poster img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .progress-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent);
                    padding: 0.8em;
                }
                
                .progress-bar {
                    height: 5px;
                    background: linear-gradient(90deg, #00ffff, #ff00ff);
                    border-radius: 3px;
                    margin-bottom: 0.4em;
                    box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
                    transition: width 0.3s ease;
                }
                
                .progress-time {
                    font-size: 1em;
                    color: #00ffff;
                    text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
                }
                
                .widget-info {
                    flex: 1;
                    padding: 0 1.5em;
                }
                
                .widget-info h3 {
                    margin: 0 0 0.6em 0;
                    font-size: 1.6em;
                    color: #00ffff;
                    text-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
                }
                
                .widget-info p {
                    margin: 0 0 1.2em 0;
                    color: #ff00ff;
                    font-size: 1.2em;
                    text-shadow: 0 0 10px rgba(255, 0, 255, 0.6);
                }
                
                .continue-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.6em;
                    padding: 0.8em 1.8em;
                    background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.3));
                    color: #fff;
                    border: 2px solid #00ffff;
                    border-radius: 25px;
                    font-size: 1.2em;
                    cursor: pointer;
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
                    text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
                    backdrop-filter: blur(10px);
                    transition: all 0.2s ease;
                }
                
                .continue-btn:hover,
                .continue-btn.focus {
                    transform: scale(1.05);
                    box-shadow: 0 0 30px rgba(0, 255, 255, 0.8), 0 0 40px rgba(255, 0, 255, 0.6);
                    border-color: #ff00ff;
                }
                
                .continue-btn svg {
                    width: 1.4em;
                    height: 1.4em;
                    fill: currentColor;
                    filter: drop-shadow(0 0 5px #00ffff);
                }
                
                @media (max-width: 768px) {
                    .watch-progress-widget {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .widget-poster {
                        margin-bottom: 1.2em;
                    }
                    
                    .widget-info {
                        padding: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        },
        
        renderWidget: function() {
            var watchData = this.getWatchProgress();
            if (!watchData || watchData.length === 0) return;
            
            var mainContainer = document.querySelector('.wrap');
            if (!mainContainer) return;
            
            // Удаляем старый виджет, если есть
            var oldWidget = document.querySelector('.watch-progress-widget');
            if (oldWidget) {
                oldWidget.remove();
            }
            
            var latestWatch = watchData[0]; // Берем последний просмотренный
            var widget = document.createElement('div');
            widget.className = 'watch-progress-widget';
            
            var progress = Math.round((latestWatch.time / latestWatch.duration) * 100);
            var currentTime = this.formatTime(latestWatch.time);
            var totalTime = this.formatTime(latestWatch.duration);
            
            widget.innerHTML = `
                <div class="widget-poster">
                    <img src="${latestWatch.poster}" alt="${latestWatch.title}">
                    <div class="progress-overlay">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                        <span class="progress-time">${currentTime} / ${totalTime}</span>
                    </div>
                </div>
                <div class="widget-info">
                    <h3>${latestWatch.title}</h3>
                    <p>${latestWatch.seasonInfo || ''}</p>
                    <button class="continue-btn">
                        <svg viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        Продолжить просмотр
                    </button>
                </div>
            `;
            
            var self = this;
            widget.querySelector('.continue-btn').addEventListener('click', function() {
                self.continueWatch(latestWatch);
            });
            
            // Вставляем виджет в начало контейнера
            mainContainer.insertBefore(widget, mainContainer.firstChild);
        },
        
        getWatchProgress: function() {
            try {
                var data = Lampa.Storage.get(this.storageKey, '[]');
                return JSON.parse(data);
            } catch (e) {
                return [];
            }
        },
        
        saveWatchProgress: function(movieData) {
            var progress = this.getWatchProgress();
            
            // Удаляем старую запись этого фильма
            progress = progress.filter(function(item) {
                return item.id !== movieData.id;
            });
            
            // Добавляем новую запись в начало
            progress.unshift(movieData);
            
            // Ограничиваем до 10 последних
            if (progress.length > 10) {
                progress = progress.slice(0, 10);
            }
            
            Lampa.Storage.set(this.storageKey, JSON.stringify(progress));
        },
        
        formatTime: function(seconds) {
            var h = Math.floor(seconds / 3600);
            var m = Math.floor((seconds % 3600) / 60);
            var s = Math.floor(seconds % 60);
            
            if (h > 0) {
                return h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
            }
            return m + ':' + (s < 10 ? '0' : '') + s;
        },
        
        continueWatch: function(watchData) {
            // Здесь должна быть логика возобновления просмотра
            // Это зависит от структуры Lampa, пример:
            Lampa.Activity.push({
                url: watchData.url,
                title: watchData.title,
                component: 'full',
                page: 1
            });
        }
    };

    // ============================================================================
    // НЕОНОВАЯ ТЕМА
    // ============================================================================
    
    var NeonTheme = {
        init: function() {
            if (settings.theme !== 'neon') {
                this.remove();
                return;
            }
            
            this.addStyles();
        },
        
        addStyles: function() {
            if (document.getElementById('neon-theme-styles')) return;
            
            var style = document.createElement('style');
            style.id = 'neon-theme-styles';
            style.textContent = `
                /* Neon Theme Variables */
                :root {
                    --neon-bg-primary: #0a0a0a;
                    --neon-bg-secondary: #151515;
                    --neon-cyan: #00ffff;
                    --neon-magenta: #ff00ff;
                    --neon-yellow: #ffff00;
                    --neon-green: #00ff80;
                    --neon-red: #ff0040;
                    --neon-text-primary: #ffffff;
                    --neon-text-secondary: #b0b0b0;
                }
                
                /* Background with grid */
                body {
                    background: 
                        linear-gradient(rgba(0, 255, 255, 0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 0, 255, 0.02) 1px, transparent 1px),
                        linear-gradient(135deg, #0a0a0a 0%, #151515 100%);
                    background-size: 50px 50px, 50px 50px, 100% 100%;
                    color: var(--neon-text-primary);
                }
                
                /* Cards with neon glow */
                .card {
                    background: rgba(20, 20, 20, 0.8);
                    border: 1px solid rgba(0, 255, 255, 0.2);
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    transition: all 0.2s ease;
                }
                
                .card:hover,
                .card.focus {
                    transform: scale(1.08);
                    border-color: var(--neon-cyan);
                    box-shadow: 
                        0 0 20px rgba(0, 255, 255, 0.6),
                        0 0 40px rgba(0, 255, 255, 0.4),
                        0 0 60px rgba(0, 255, 255, 0.2);
                }
                
                .card__view {
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .card__title {
                    color: var(--neon-cyan);
                    text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
                }
                
                /* Menu with neon highlights */
                .menu {
                    background: rgba(15, 15, 15, 0.95);
                    border-right: 2px solid rgba(0, 255, 255, 0.3);
                    box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
                    backdrop-filter: blur(15px);
                }
                
                .menu__item {
                    border-left: 3px solid transparent;
                    transition: all 0.2s ease;
                }
                
                .menu__item.focus,
                .menu__item.hover {
                    background: linear-gradient(90deg, rgba(0, 255, 255, 0.2), transparent) !important;
                    border-left-color: var(--neon-cyan) !important;
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
                }
                
                .menu__ico {
                    filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.5));
                }
                
                .menu__item.focus .menu__ico,
                .menu__item.hover .menu__ico {
                    filter: drop-shadow(0 0 10px var(--neon-cyan)) drop-shadow(0 0 20px var(--neon-cyan));
                }
                
                /* Buttons with neon style */
                .full-start__button,
                button,
                .selector {
                    background: linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(255, 0, 255, 0.15));
                    border: 2px solid rgba(0, 255, 255, 0.4);
                    border-radius: 25px;
                    color: var(--neon-cyan);
                    text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
                    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
                    backdrop-filter: blur(10px);
                    transition: all 0.2s ease;
                }
                
                .full-start__button:hover,
                .full-start__button.focus,
                button:hover,
                button.focus,
                .selector.focus {
                    background: linear-gradient(135deg, rgba(255, 0, 255, 0.25), rgba(0, 255, 255, 0.25));
                    border-color: var(--neon-magenta);
                    color: var(--neon-magenta);
                    text-shadow: 0 0 15px rgba(255, 0, 255, 1);
                    box-shadow: 
                        0 0 20px rgba(255, 0, 255, 0.6),
                        0 0 40px rgba(255, 0, 255, 0.4);
                    transform: scale(1.05);
                }
                
                /* Settings with neon accents */
                .settings {
                    background: rgba(10, 10, 10, 0.95);
                    backdrop-filter: blur(15px);
                }
                
                .settings-folder,
                .settings-param {
                    border-bottom: 1px solid rgba(0, 255, 255, 0.1);
                    transition: all 0.2s ease;
                }
                
                .settings-folder.focus,
                .settings-param.focus {
                    background: linear-gradient(90deg, rgba(0, 255, 255, 0.15), transparent) !important;
                    border-left: 3px solid var(--neon-cyan);
                    box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
                }
                
                /* Detail Page with cinematic neon effect */
                .full-start {
                    background: var(--neon-bg-primary);
                }
                
                .full-start__background {
                    opacity: 0.4;
                }
                
                .full-start::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        radial-gradient(ellipse at top, rgba(0, 255, 255, 0.15) 0%, transparent 70%),
                        linear-gradient(to bottom, transparent 0%, rgba(10, 10, 10, 0.8) 70%, var(--neon-bg-primary) 100%);
                    z-index: 1;
                }
                
                .full-start__content {
                    z-index: 2;
                    position: relative;
                }
                
                .full-start__title {
                    color: var(--neon-cyan);
                    text-shadow: 
                        0 0 20px rgba(0, 255, 255, 0.8),
                        0 0 40px rgba(0, 255, 255, 0.4);
                }
                
                .full-start__poster {
                    border: 2px solid rgba(255, 0, 255, 0.4);
                    border-radius: 10px;
                    box-shadow: 
                        0 0 30px rgba(255, 0, 255, 0.4),
                        0 0 60px rgba(255, 0, 255, 0.2);
                }
                
                /* Search Bar */
                .search {
                    background: rgba(20, 20, 20, 0.9);
                    border-bottom: 2px solid rgba(0, 255, 255, 0.3);
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
                    backdrop-filter: blur(15px);
                }
                
                .search input {
                    background: rgba(30, 30, 30, 0.8) !important;
                    color: var(--neon-cyan) !important;
                    border: 1px solid rgba(0, 255, 255, 0.3) !important;
                    border-radius: 25px;
                    box-shadow: inset 0 0 15px rgba(0, 255, 255, 0.1);
                    text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
                }
                
                .search input:focus {
                    border-color: var(--neon-cyan) !important;
                    box-shadow: 
                        inset 0 0 15px rgba(0, 255, 255, 0.2),
                        0 0 20px rgba(0, 255, 255, 0.4);
                }
                
                /* Modal */
                .modal__content,
                .selectbox__content {
                    background: rgba(20, 20, 20, 0.95) !important;
                    border: 2px solid rgba(0, 255, 255, 0.3) !important;
                    border-radius: 15px;
                    box-shadow: 0 0 40px rgba(0, 255, 255, 0.3);
                    backdrop-filter: blur(20px);
                }
                
                .modal__title {
                    color: var(--neon-cyan);
                    text-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
                }
                
                /* Scrollbar */
                ::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }
                
                ::-webkit-scrollbar-track {
                    background: rgba(20, 20, 20, 0.5);
                    border-radius: 5px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, var(--neon-cyan), var(--neon-magenta));
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    box-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
                }
                
                /* Loading animation */
                .broadcast__scan {
                    border-color: rgba(0, 255, 255, 0.2);
                    border-top-color: var(--neon-cyan);
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
                }
                
                /* Text glow effects */
                .card__vote,
                .full-start__rate {
                    text-shadow: 0 0 10px currentColor;
                }
                
                /* Селектор сезонов/серий */
                .selectbox-item.focus {
                    background: linear-gradient(90deg, rgba(0, 255, 255, 0.2), transparent) !important;
                    border-left: 3px solid var(--neon-cyan);
                    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
                }
            `;
            document.head.appendChild(style);
        },
        
        remove: function() {
            var style = document.getElementById('neon-theme-styles');
            if (style) {
                style.remove();
            }
        }
    };

    // ============================================================================
    // НАСТРОЙКИ ПЛАГИНА
    // ============================================================================
    
    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'interface_mod_new',
            name: Lampa.Lang.translate('interface_mod_new_plugin_name'),
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/><path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13V11Z" fill="currentColor"/><path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V17Z" fill="currentColor"/></svg>'
        });

        // Настройка: Лейблы типа контента
        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'interface_mod_new_show_movie_type',
                type: 'trigger',
                default: true
            },
            field: {
                name: Lampa.Lang.translate('interface_mod_new_show_movie_type'),
                description: Lampa.Lang.translate('interface_mod_new_show_movie_type_desc')
            },
            onChange: function(value) {
                settings.show_movie_type = value;
                Lampa.Storage.set('interface_mod_new_show_movie_type', value);
                Lampa.Settings.update();
                document.body.setAttribute('data-movie-labels-new', value ? 'on' : 'off');
                LabelManager.processExistingCards();
            }
        });

        // Настройка: Новая инфо-панель
        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'interface_mod_new_info_panel',
                type: 'trigger',
                default: true
            },
            field: {
                name: Lampa.Lang.translate('interface_mod_new_info_panel'),
                description: Lampa.Lang.translate('interface_mod_new_info_panel_desc')
            },
            onChange: function(value) {
                settings.info_panel = value;
                Lampa.Storage.set('interface_mod_new_info_panel', value);
                Lampa.Settings.update();
            }
        });

        // Настройка: Цветные рейтинги
        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'interface_mod_new_colored_ratings',
                type: 'trigger',
                default: true
            },
            field: {
                name: Lampa.Lang.translate('interface_mod_new_colored_ratings'),
                description: Lampa.Lang.translate('interface_mod_new_colored_ratings_desc')
            },
            onChange: function(value) {
                settings.colored_ratings = value;
                Lampa.Storage.set('interface_mod_new_colored_ratings', value);
                Lampa.Settings.update();
                if (value) {
                    ColorManager.updateAllColors();
                }
            }
        });

        // Настройка: Тема оформления
        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'interface_mod_new_theme_select',
                type: 'select',
                values: {
                    default: Lampa.Lang.translate('interface_mod_new_theme_default'),
                    neon: Lampa.Lang.translate('interface_mod_new_theme_neon')
                },
                default: 'neon'
            },
            field: {
                name: Lampa.Lang.translate('interface_mod_new_theme_select'),
                description: Lampa.Lang.translate('interface_mod_new_theme_select_desc')
            },
            onChange: function(value) {
                settings.theme = value;
                Lampa.Storage.set('interface_mod_new_theme_select', value);
                Lampa.Settings.update();
                NeonTheme.init();
            }
        });

        // Настройка: Виджет просмотра
        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'interface_mod_new_watch_progress',
                type: 'trigger',
                default: true
            },
            field: {
                name: Lampa.Lang.translate('interface_mod_new_watch_progress'),
                description: Lampa.Lang.translate('interface_mod_new_watch_progress_desc')
            },
            onChange: function(value) {
                settings.watch_progress = value;
Lampa.Storage.set('interface_mod_new_watch_progress', value);
            Lampa.Settings.update();
            if (value) {
                WatchProgressWidget.renderWidget();
            } else {
                var widget = document.querySelector('.watch-progress-widget');
                if (widget) widget.remove();
            }
        }
    });

    // Настройка: Стилизация заголовков
    Lampa.SettingsApi.addParam({
        component: 'interface_mod_new',
        param: {
            name: 'interface_mod_new_stylize_titles',
            type: 'trigger',
            default: true
        },
        field: {
            name: Lampa.Lang.translate('interface_mod_new_stylize_titles'),
            description: Lampa.Lang.translate('interface_mod_new_stylize_titles_desc')
        },
        onChange: function(value) {
            settings.stylize_titles = value;
            Lampa.Storage.set('interface_mod_new_stylize_titles', value);
            Lampa.Settings.update();
            stylizeCollectionTitles();
        }
    });

    // Настройка: Ленивая загрузка
    Lampa.SettingsApi.addParam({
        component: 'interface_mod_new',
        param: {
            name: 'interface_mod_new_lazy_load',
            type: 'trigger',
            default: true
        },
        field: {
            name: Lampa.Lang.translate('interface_mod_new_lazy_load'),
            description: Lampa.Lang.translate('interface_mod_new_lazy_load_desc')
        },
        onChange: function(value) {
            settings.lazy_load = value;
            Lampa.Storage.set('interface_mod_new_lazy_load', value);
            Lampa.Settings.update();
            if (value) {
                LazyLoader.init();
            } else {
                LazyLoader.destroy();
            }
        }
    });

    // Настройка: WebP конвертация
    Lampa.SettingsApi.addParam({
        component: 'interface_mod_new',
        param: {
            name: 'interface_mod_new_webp_conversion',
            type: 'trigger',
            default: true
        },
        field: {
            name: Lampa.Lang.translate('interface_mod_new_webp_conversion'),
            description: Lampa.Lang.translate('interface_mod_new_webp_conversion_desc')
        },
        onChange: function(value) {
            settings.webp_conversion = value;
            Lampa.Storage.set('interface_mod_new_webp_conversion', value);
            Lampa.Settings.update();
        }
    });
}

// ============================================================================
// СТИЛИЗАЦИЯ ЗАГОЛОВКОВ
// ============================================================================

function stylizeCollectionTitles() {
    var oldStyle = document.getElementById('stylized-titles-css');
    if (oldStyle) oldStyle.remove();
    
    if (!settings.stylize_titles) return;
    
    var styleElement = document.createElement('style');
    styleElement.id = 'stylized-titles-css';
    styleElement.textContent = `
        .items-line__title {
            font-size: 2.4em;
            display: inline-block;
            background: linear-gradient(90deg, #00ffff, #ff00ff, #00ff80, #00ffff);
            background-size: 200% auto;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 800;
            text-shadow: 
                0 0 20px rgba(0, 255, 255, 0.5),
                0 0 40px rgba(255, 0, 255, 0.3);
            position: relative;
            padding: 0 10px;
            z-index: 1;
            filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.6));
        }
    `;
    document.head.appendChild(styleElement);
}

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================================

function startPlugin() {
    // Инициализируем централизованный наблюдатель
    DOMWatcher.init();
    
    // Добавляем настройки
    addSettings();
    
    // Инициализируем модули
    DPadNavigation.init();
    LazyLoader.init();
    LabelManager.init();
    InfoPanel.init();
    ColorManager.init();
    WatchProgressWidget.init();
    NeonTheme.init();
    
    // Стилизация заголовков
    if (settings.stylize_titles) {
        stylizeCollectionTitles();
    }
}

// Запуск плагина
if (window.appready) {
    startPlugin();
} else {
    Lampa.Listener.follow('app', function(event) {
        if (event.type === 'ready') {
            startPlugin();
        }
    });
}
})();
