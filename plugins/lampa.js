(function () {
    'use strict';

    // Полифилл для String.prototype.startsWith
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    // Локализация (только русский и английский)
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
        interface_mod_new_show_all_buttons: {
            ru: 'Показывать все кнопки',
            en: 'Show all buttons'
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
        interface_mod_new_theme_minimalist: {
            ru: 'Минималистичная',
            en: 'Minimalist'
        },
        interface_mod_new_theme_glow_outline: {
            ru: 'Светящийся контур',
            en: 'Glowing outline'
        },
        interface_mod_new_theme_menu_lines: {
            ru: 'Меню с линиями',
            en: 'Menu with lines'
        },
        interface_mod_new_theme_dark_emerald: {
            ru: 'Тёмный Emerald',
            en: 'Dark Emerald'
        },
        interface_mod_new_stylize_titles: {
            ru: 'Новый стиль заголовков',
            en: 'New titles style'
        },
        interface_mod_new_stylize_titles_desc: {
            ru: 'Включает стильное оформление заголовков подборок с анимацией и спецэффектами',
            en: 'Enables stylish titles with animation and special effects'
        },
        interface_mod_new_enhance_detailed_info: {
            ru: 'Увеличенная информация Beta',
            en: 'Enhanced detailed info Beta'
        },
        interface_mod_new_enhance_detailed_info_desc: {
            ru: 'Включить увеличенную информацию о фильме/сериале',
            en: 'Enable enhanced detailed info about movie/series'
        }
    });

    // Настройки по умолчанию
    var settings = {
        show_movie_type: Lampa.Storage.get('interface_mod_new_show_movie_type', true),
        info_panel: Lampa.Storage.get('interface_mod_new_info_panel', true),
        colored_ratings: Lampa.Storage.get('interface_mod_new_colored_ratings', true),
        buttons_style_mode: Lampa.Storage.get('interface_mod_new_buttons_style_mode', 'default'),
        theme: Lampa.Storage.get('interface_mod_new_theme_select', 'default'),
        stylize_titles: Lampa.Storage.get('interface_mod_new_stylize_titles', false),
        enhance_detailed_info: Lampa.Storage.get('interface_mod_new_enhance_detailed_info', false)
    };
    
    // Информация о плагине
    var aboutPluginData = null;
    
    // Единый глобальный MutationObserver для всех функций
    var globalObserver = null;
    var observerCallbacks = [];
    
    // Кэш для jQuery селекторов
    var selectorCache = {};
    
    // Оптимизированная функция получения элементов
    function getElements(selector, forceRefresh) {
        if (forceRefresh || !selectorCache[selector]) {
            selectorCache[selector] = $(selector);
        }
        return selectorCache[selector];
    }
    
    // Очистка кэша селекторов
    function clearSelectorCache() {
        selectorCache = {};
    }
    
    // Инициализация единого глобального Observer
    function initGlobalObserver() {
        if (globalObserver) return;
        
        globalObserver = new MutationObserver(function(mutations) {
            // Очищаем кэш при изменениях DOM
            clearSelectorCache();
            
            // Выполняем все зарегистрированные callback'и
            observerCallbacks.forEach(function(callback) {
                try {
                    callback(mutations);
                } catch (e) {
                    console.error('Observer callback error:', e);
                }
            });
        });
        
        globalObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false
        });
    }
    
    // Регистрация callback для глобального Observer
    function registerObserverCallback(callback) {
        if (observerCallbacks.indexOf(callback) === -1) {
            observerCallbacks.push(callback);
        }
    }
    
    // Lazy Load для изображений с WebP поддержкой
    var lazyLoadObserver = null;
    
    function initLazyLoad() {
        if ('IntersectionObserver' in window) {
            lazyLoadObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var img = entry.target;
                        var src = img.dataset.src || img.dataset.original;
                        
                        if (src) {
                            // Проверка поддержки WebP
                            var webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                            
                            // Пытаемся загрузить WebP версию
                            var testImg = new Image();
                            testImg.onload = function() {
                                img.src = webpSrc;
                                img.removeAttribute('data-src');
                                img.removeAttribute('data-original');
                                img.classList.add('loaded');
                            };
                            testImg.onerror = function() {
                                // Если WebP не доступен, загружаем оригинал
                                img.src = src;
                                img.removeAttribute('data-src');
                                img.removeAttribute('data-original');
                                img.classList.add('loaded');
                            };
                            testImg.src = webpSrc;
                        }
                        
                        lazyLoadObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
        }
    }
    
    // Применение Lazy Load к изображениям
    function applyLazyLoad() {
        if (!lazyLoadObserver) return;
        
        var images = document.querySelectorAll('img[data-src], img[data-original], .card__img');
        images.forEach(function(img) {
            if (!img.classList.contains('lazy-registered')) {
                img.classList.add('lazy-registered');
                lazyLoadObserver.observe(img);
            }
        });
    }
    
    // Callback для отслеживания новых изображений
    function lazyLoadCallback() {
        applyLazyLoad();
    }
    
    // Добавление настроек в меню
    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'interface_mod_new',
            name: Lampa.Lang.translate('interface_mod_new_plugin_name'),
            icon: '<svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 3L3 10L17 17L31 10L17 3Z" stroke="white" stroke-width="2"/><path d="M3 24L17 31L31 24" stroke="white" stroke-width="2"/><path d="M3 17L17 24L31 17" stroke="white" stroke-width="2"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'about_plugin',
                type: 'static',
                default: true
            },
            field: {
                name: Lampa.Lang.translate('interface_mod_new_about_plugin'),
                description: 'Модификация интерфейса Lampa с улучшенным дизайном и производительностью'
            },
            onRender: function(item) {
                item.on('hover:enter', function() {
                    showAboutPlugin();
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'show_movie_type',
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
                changeMovieTypeLabels();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'info_panel',
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
                newInfoPanel();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'colored_ratings',
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
                if (value) {
                    updateVoteColors();
                    setupVoteColorsForDetailPage();
                }
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'buttons_style_mode',
                type: 'select',
                values: {
                    default: Lampa.Lang.translate('interface_mod_new_buttons_style_mode_default'),
                    all: Lampa.Lang.translate('interface_mod_new_buttons_style_mode_all'),
                    main2: Lampa.Lang.translate('interface_mod_new_buttons_style_mode_custom')
                },
                default: 'default'
            },
            field: {
                name: Lampa.Lang.translate('interface_mod_new_buttons_style_mode')
            },
            onChange: function(value) {
                settings.buttons_style_mode = value;
                Lampa.Storage.set('interface_mod_new_buttons_style_mode', value);
                if (value === 'all' || value === 'main2') {
                    showAllButtons();
                }
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'theme_select',
                type: 'select',
                values: {
                    default: Lampa.Lang.translate('interface_mod_new_theme_default'),
                    minimalist: Lampa.Lang.translate('interface_mod_new_theme_minimalist'),
                    glow_outline: Lampa.Lang.translate('interface_mod_new_theme_glow_outline'),
                    menu_lines: Lampa.Lang.translate('interface_mod_new_theme_menu_lines'),
                    dark_emerald: Lampa.Lang.translate('interface_mod_new_theme_dark_emerald')
                },
                default: 'default'
            },
            field: {
                name: Lampa.Lang.translate('interface_mod_new_theme_select'),
                description: Lampa.Lang.translate('interface_mod_new_theme_select_desc')
            },
            onChange: function(value) {
                settings.theme = value;
                Lampa.Storage.set('interface_mod_new_theme_select', value);
                applyTheme(value);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'stylize_titles',
                type: 'trigger',
                default: false
            },
            field: {
                name: Lampa.Lang.translate('interface_mod_new_stylize_titles'),
                description: Lampa.Lang.translate('interface_mod_new_stylize_titles_desc')
            },
            onChange: function(value) {
                settings.stylize_titles = value;
                Lampa.Storage.set('interface_mod_new_stylize_titles', value);
                if (value) {
                    stylizeCollectionTitles();
                }
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'enhance_detailed_info',
                type: 'trigger',
                default: false
            },
            field: {
                name: Lampa.Lang.translate('interface_mod_new_enhance_detailed_info'),
                description: Lampa.Lang.translate('interface_mod_new_enhance_detailed_info_desc')
            },
            onChange: function(value) {
                settings.enhance_detailed_info = value;
                Lampa.Storage.set('interface_mod_new_enhance_detailed_info', value);
                if (value) {
                    enhanceDetailedInfo();
                }
            }
        });
    }

    // Показ информации о плагине
    function showAboutPlugin() {
        var modal = $('<div class="modal"><div class="modal__content about-plugin"><div class="about-plugin__title">Interface MOD</div><div class="about-plugin__version">Версия: 3.0 Optimized</div><div class="about-plugin__description">Модификация интерфейса Lampa с улучшениями:<br>• Оптимизированная производительность<br>• WebP поддержка для постеров<br>• Lazy Load изображений<br>• Единый MutationObserver<br>• Кэширование селекторов<br>• Цветные рейтинги и статусы<br>• Новые темы оформления</div></div></div>');
        
        modal.on('click', function() {
            modal.remove();
        });
        
        $('body').append(modal);
        setTimeout(function() {
            modal.addClass('modal--open');
        }, 10);
    }

    // Изменение лейблов типа контента
    function changeMovieTypeLabels() {
        if (!settings.show_movie_type) return;

        var style = document.getElementById('movie-type-labels-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'movie-type-labels-style';
            style.textContent = `
                .card__view::before {
                    content: attr(data-movie-type);
                    position: absolute;
                    top: 0.5em;
                    right: 0.5em;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 0.3em 0.6em;
                    border-radius: 0.3em;
                    font-size: 1.1em;
                    font-weight: bold;
                    z-index: 3;
                    text-transform: uppercase;
                }
            `;
            document.head.appendChild(style);
        }

        // Callback для обработки карточек
        function processCards() {
            var cards = document.querySelectorAll('.card');
            cards.forEach(function(card) {
                if (card.dataset.typeProcessed) return;
                
                var numberElement = card.querySelector('.card__number');
                if (numberElement) {
                    var isSeries = numberElement.textContent.match(/(?:EP|Эп|Сезон)/i);
                    var cardView = card.querySelector('.card__view');
                    if (cardView) {
                        var type = isSeries ? 
                            Lampa.Lang.translate('interface_mod_new_label_serial') : 
                            Lampa.Lang.translate('interface_mod_new_label_movie');
                        cardView.setAttribute('data-movie-type', type);
                        card.dataset.typeProcessed = 'true';
                    }
                }
            });
        }

        registerObserverCallback(processCards);
        processCards();
    }

    // Новая информационная панель
    function newInfoPanel() {
        if (!settings.info_panel) return;

        var style = document.getElementById('new-info-panel-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'new-info-panel-style';
            style.textContent = `
                .full-start__premiery {
                    display: none !important;
                }
                
                .info-panel-new {
                    margin-top: 1em;
                    padding: 0.8em;
                    background: linear-gradient(135deg, rgba(52, 152, 219, 0.15) 0%, rgba(142, 68, 173, 0.15) 100%);
                    border-left: 0.3em solid rgba(52, 152, 219, 0.8);
                    border-radius: 0.4em;
                    font-size: 1.3em;
                }
            `;
            document.head.appendChild(style);
        }

        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite') {
                setTimeout(function() {
                    var premiery = getElements('.full-start__premiery', true);
                    if (premiery.length && !premiery.next('.info-panel-new').length) {
                        var text = premiery.text().trim();
                        if (text) {
                            var newPanel = $('<div class="info-panel-new"></div>').text(text);
                            premiery.after(newPanel);
                        }
                    }
                }, 100);
            }
        });
    }

    // Получение цвета для рейтинга
    function getColorForVote(vote) {
        vote = parseFloat(vote);
        if (isNaN(vote)) return '';
        
        if (vote >= 8.0) return '#27ae60';
        if (vote >= 7.0) return '#2ecc71';
        if (vote >= 6.0) return '#f39c12';
        if (vote >= 5.0) return '#e67e22';
        return '#e74c3c';
    }

    // Обновление цветов рейтинга
    function updateVoteColors() {
        if (!settings.colored_ratings) return;

        var style = document.getElementById('vote-colors-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'vote-colors-style';
            document.head.appendChild(style);
        }

        function processVotes() {
            var cards = document.querySelectorAll('.card');
            cards.forEach(function(card) {
                var vote = card.querySelector('.card__vote');
                if (vote && !vote.dataset.colorApplied) {
                    var rating = vote.textContent.trim();
                    var color = getColorForVote(rating);
                    if (color) {
                        vote.style.color = color;
                        vote.style.fontWeight = 'bold';
                        vote.dataset.colorApplied = 'true';
                    }
                }
            });
        }

        registerObserverCallback(processVotes);
        processVotes();
    }

    // Настройка цветов для страницы деталей
    function setupVoteColorsForDetailPage() {
        if (!settings.colored_ratings) return;

        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite') {
                setTimeout(function() {
                    var taglines = document.querySelectorAll('.full-start__tagline');
                    taglines.forEach(function(tagline) {
                        var match = tagline.textContent.match(/(\d+(?:\.\d+)?)/);
                        if (match) {
                            var rating = match[1];
                            var color = getColorForVote(rating);
                            if (color) {
                                tagline.style.color = color;
                                tagline.style.fontWeight = 'bold';
                            }
                        }
                    });
                }, 100);
            }
        });
    }

    // Цветовое выделение статуса сериала
    function colorizeSeriesStatus() {
        var style = document.getElementById('series-status-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'series-status-style';
            style.textContent = `
                .status-ended { color: #e74c3c !important; }
                .status-ongoing { color: #27ae60 !important; }
                .status-unknown { color: #95a5a6 !important; }
            `;
            document.head.appendChild(style);
        }

        function processStatuses() {
            var details = document.querySelectorAll('.full-start__details span');
            details.forEach(function(span) {
                var text = span.textContent.toLowerCase();
                if (text.includes('завершен') || text.includes('ended')) {
                    span.classList.add('status-ended');
                } else if (text.includes('продолжается') || text.includes('ongoing')) {
                    span.classList.add('status-ongoing');
                } else if (text.includes('статус')) {
                    span.classList.add('status-unknown');
                }
            });
        }

        registerObserverCallback(processStatuses);
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite') {
                setTimeout(processStatuses, 100);
            }
        });
    }

    // Цветовое выделение возрастного рейтинга
    function colorizeAgeRating() {
        var style = document.getElementById('age-rating-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'age-rating-style';
            style.textContent = `
                .age-0 { color: #27ae60 !important; }
                .age-6 { color: #2ecc71 !important; }
                .age-12 { color: #f39c12 !important; }
                .age-16 { color: #e67e22 !important; }
                .age-18 { color: #e74c3c !important; }
            `;
            document.head.appendChild(style);
        }

        function processAgeRatings() {
            var details = document.querySelectorAll('.full-start__details span');
            details.forEach(function(span) {
                var text = span.textContent;
                if (text.match(/\b0\+/)) span.classList.add('age-0');
                else if (text.match(/\b6\+/)) span.classList.add('age-6');
                else if (text.match(/\b12\+/)) span.classList.add('age-12');
                else if (text.match(/\b16\+/)) span.classList.add('age-16');
                else if (text.match(/\b18\+/)) span.classList.add('age-18');
            });
        }

        registerObserverCallback(processAgeRatings);
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite') {
                setTimeout(processAgeRatings, 100);
            }
        });
    }

    // Показ всех кнопок
    function showAllButtons() {
        var style = document.getElementById('show-all-buttons-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'show-all-buttons-style';
            style.textContent = `
                .full-start__button {
                    display: inline-block !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Применение темы
    function applyTheme(themeName) {
        // Удаляем предыдущие темы
        var oldTheme = document.getElementById('interface-mod-theme');
        if (oldTheme) oldTheme.remove();

        if (themeName === 'default') return;

        var themeStyle = document.createElement('style');
        themeStyle.id = 'interface-mod-theme';

        var themes = {
            minimalist: `
                .card { 
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: none !important;
                    transition: all 0.3s ease !important;
                }
                .card:hover {
                    background: rgba(255, 255, 255, 0.1) !important;
                    transform: translateY(-0.3em);
                }
            `,
            glow_outline: `
                .card {
                    border: 0.15em solid rgba(52, 152, 219, 0.3) !important;
                    box-shadow: 0 0 1em rgba(52, 152, 219, 0.2) !important;
                    transition: all 0.3s ease !important;
                }
                .card:hover {
                    border-color: rgba(52, 152, 219, 0.8) !important;
                    box-shadow: 0 0 1.5em rgba(52, 152, 219, 0.6) !important;
                }
            `,
            menu_lines: `
                .menu__item {
                    border-bottom: 0.1em solid rgba(255, 255, 255, 0.1) !important;
                    padding: 1em 0 !important;
                }
                .menu__item:hover {
                    border-bottom-color: rgba(52, 152, 219, 0.8) !important;
                }
            `,
            dark_emerald: `
                body {
                    background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%) !important;
                }
                .card {
                    background: rgba(46, 204, 113, 0.1) !important;
                    border: 0.1em solid rgba(46, 204, 113, 0.3) !important;
                }
                .card:hover {
                    background: rgba(46, 204, 113, 0.2) !important;
                    border-color: rgba(46, 204, 113, 0.6) !important;
                }
            `
        };

        themeStyle.textContent = themes[themeName] || '';
        document.head.appendChild(themeStyle);
    }

    // Стилизация заголовков подборок
    function stylizeCollectionTitles() {
        var style = document.getElementById('stylize-titles-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'stylize-titles-style';
            style.textContent = `
                .selectbox-item__title {
                    background: linear-gradient(90deg, #3498db, #9b59b6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: bold !important;
                    text-shadow: 0 0 0.5em rgba(52, 152, 219, 0.5);
                    animation: titlePulse 3s ease-in-out infinite;
                }
                
                @keyframes titlePulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Расширенная информация о фильме
    function enhanceDetailedInfo() {
        var style = document.getElementById('enhance-detailed-info-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'enhance-detailed-info-style';
            style.textContent = `
                .full-start-new__title {
                    font-size: 2.2em !important;
                }
                
                .full-start-new__tagline {
                    font-size: 1.4em !important;
                }
                
                .full-start-new__desc {
                    font-size: 1.6em !important;
                    margin-top: 1em !important;
                }
                
                .full-start-new__info {
                    font-size: 1.4em !important;
                }
                
                .info-unified-line {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5em;
                    margin: 0.5em 0;
                }
                
                .info-unified-item {
                    border-radius: 0.3em;
                    font-size: 1.3em;
                    padding: 0.2em 0.6em;
                    display: inline-block;
                    white-space: nowrap;
                    line-height: 1.2em;
                }
                
                @media (max-width: 768px) {
                    .full-start-new__title {
                        font-size: 1.8em !important;
                    }
                    
                    .full-start-new__desc {
                        font-size: 1.4em !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite') {
                setTimeout(function() {
                    var details = getElements('.full-start-new__details', true);
                    if (!details.length) return;
                    
                    var seasonText = '';
                    var episodeText = '';
                    var durationText = '';
                    
                    details.find('span').each(function() {
                        var text = $(this).text().trim();
                        
                        if (text.match(/Сезон(?:ы)?:?\s*(\d+)/i) || text.match(/(\d+)\s+Сезон(?:а|ов)?/i)) {
                            seasonText = text;
                        } else if (text.match(/Серии?:?\s*(\d+)/i) || text.match(/(\d+)\s+Сери(?:я|и|й)/i)) {
                            episodeText = text;
                        } else if (text.match(/Длительность/i) || text.indexOf('≈') !== -1) {
                            durationText = text;
                        }
                    });
                    
                    if ((seasonText && episodeText) || (seasonText && durationText) || (episodeText && durationText)) {
                        var unifiedLine = $('<div class="info-unified-line"></div>');
                        
                        if (seasonText) {
                            unifiedLine.append(
                                $('<span class="info-unified-item"></span>')
                                    .text(seasonText)
                                    .css({
                                        'background-color': 'rgba(52, 152, 219, 0.8)',
                                        'color': 'white'
                                    })
                            );
                        }
                        
                        if (episodeText) {
                            unifiedLine.append(
                                $('<span class="info-unified-item"></span>')
                                    .text(episodeText)
                                    .css({
                                        'background-color': 'rgba(46, 204, 113, 0.8)',
                                        'color': 'white'
                                    })
                            );
                        }
                        
                        if (durationText) {
                            unifiedLine.append(
                                $('<span class="info-unified-item"></span>')
                                    .text(durationText)
                                    .css({
                                        'background-color': 'rgba(52, 152, 219, 0.8)',
                                        'color': 'white'
                                    })
                            );
                        }
                        
                        details.find('span').each(function() {
                            var text = $(this).text().trim();
                            if (text === seasonText || text === episodeText || text === durationText) {
                                $(this).remove();
                            }
                        });
                        
                        details.prepend(unifiedLine);
                    }
                }, 300);
            }
        });
    }

    // Инициализация плагина
    function startPlugin() {
        // Инициализируем глобальный Observer
        initGlobalObserver();
        
        // Инициализируем Lazy Load
        initLazyLoad();
        registerObserverCallback(lazyLoadCallback);
        
        // Загружаем настройки и активируем функции
        addSettings();
        changeMovieTypeLabels();
        newInfoPanel();
        
        if (settings.colored_ratings) {
            updateVoteColors();
            setupVoteColorsForDetailPage();
        }
        
        colorizeSeriesStatus();
        colorizeAgeRating();
        
        if (settings.buttons_style_mode === 'all' || settings.buttons_style_mode === 'main2') {
            showAllButtons();
        }
        
        if (settings.theme) {
            applyTheme(settings.theme);
        }
        
        if (settings.stylize_titles) {
            stylizeCollectionTitles();
        }
        
        if (settings.enhance_detailed_info) {
            enhanceDetailedInfo();
        }
        
        // Первоначальное применение Lazy Load
        applyLazyLoad();
    }

    // Запуск после готовности приложения
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                startPlugin();
            }
        });
    }
})();
