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
        interface_mod_new_theme_netflix: {
            ru: 'Netflix Style',
            en: 'Netflix Style'
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
        theme: Lampa.Storage.get('interface_mod_new_theme_select', 'default'),
        stylize_titles: Lampa.Storage.get('interface_mod_new_stylize_titles', false),
        watch_progress: Lampa.Storage.get('interface_mod_new_watch_progress', true)
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
                    left: 0.3em !important;
                    bottom: 0.3em !important;
                    background: rgba(0,0,0,0.5) !important;
                    color: #fff !important;
                    font-size: 1.3em !important;
                    padding: 0.2em 0.5em !important;
                    border-radius: 1em !important;
                    font-weight: 700;
                    z-index: 10 !important;
                }
                .serial-label-new {
                    background: rgba(0,0,0,0.5) !important;
                    color: #3498db !important;
                }
                .movie-label-new {
                    background: rgba(0,0,0,0.5) !important;
                    color: #2ecc71 !important;
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
            seasons: { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
            episodes: { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
            duration: { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
            next: { bg: 'rgba(230, 126, 34, 0.8)', text: 'white' },
            genres: {
                'Боевик': { bg: 'rgba(231, 76, 60, 0.8)', text: 'white' },
                'Приключения': { bg: 'rgba(39, 174, 96, 0.8)', text: 'white' },
                'Мультфильм': { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' },
                'Комедия': { bg: 'rgba(241, 196, 15, 0.8)', text: 'black' },
                'Криминал': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },
                'Документальный': { bg: 'rgba(22, 160, 133, 0.8)', text: 'white' },
                'Драма': { bg: 'rgba(142, 68, 173, 0.8)', text: 'white' },
                'Семейный': { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
                'Фэнтези': { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' },
                'История': { bg: 'rgba(211, 84, 0, 0.8)', text: 'white' },
                'Ужасы': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },
                'Музыка': { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
                'Детектив': { bg: 'rgba(52, 73, 94, 0.8)', text: 'white' },
                'Мелодрама': { bg: 'rgba(233, 30, 99, 0.8)', text: 'white' },
                'Фантастика': { bg: 'rgba(41, 128, 185, 0.8)', text: 'white' },
                'Триллер': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },
                'Военный': { bg: 'rgba(127, 140, 141, 0.8)', text: 'white' },
                'Вестерн': { bg: 'rgba(211, 84, 0, 0.8)', text: 'white' }
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
            newContainer.style.cssText = 'display: flex; flex-direction: column; width: 100%; gap: 0.6em; margin: 0.6em 0 0.6em 0';
            
            var firstRow = document.createElement('div');
            firstRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.4em; align-items: center; margin: 0 0 0.2em 0';
            
            var secondRow = document.createElement('div');
            secondRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.4em; align-items: center; margin: 0 0 0.2em 0';
            
            var thirdRow = document.createElement('div');
            thirdRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.4em; align-items: center; margin: 0 0 0.2em 0';
            
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
                        var color = self.colors.genres[genre] || { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
                        var badge = self.createBadge(genre, color);
                        thirdRow.appendChild(badge);
                    });
                } else {
                    var genre = text.trim();
                    if (genre) {
                        var color = self.colors.genres[genre] || { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
                        var badge = self.createBadge(genre, color);
                        thirdRow.appendChild(badge);
                    }
                }
            });
        },
        
        createBadge: function(text, colors) {
            var badge = document.createElement('span');
            badge.textContent = text;
            badge.style.cssText = 'border-radius: 0.3em; border: 0px; font-size: 1.3em; padding: 0.2em 0.6em; ' +
                'display: inline-block; white-space: nowrap; line-height: 1.2em; margin-right: 0.4em; ' +
                'margin-bottom: 0.2em; background-color: ' + colors.bg + '; color: ' + colors.text + ';';
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
            
            if (vote >= 0 && vote <= 3) {
                color = 'red';
            } else if (vote > 3 && vote < 6) {
                color = 'orange';
            } else if (vote >= 6 && vote < 8) {
                color = 'cornflowerblue';
            } else if (vote >= 8 && vote <= 10) {
                color = 'lawngreen';
            }
            
            if (color) {
                element.style.color = color;
            }
        },
        
        colorizeSeriesStatus: function() {
            var statusColors = {
                completed: { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
                canceled: { bg: 'rgba(231, 76, 60, 0.8)', text: 'white' },
                ongoing: { bg: 'rgba(243, 156, 18, 0.8)', text: 'black' },
                production: { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
                planned: { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' }
            };
            
            var statusElements = document.querySelectorAll('.full-start__status');
            statusElements.forEach(function(element) {
                var statusText = element.textContent.trim();
                var bgColor = '';
                var textColor = '';
                
                if (statusText.includes('Заверш') || statusText.includes('Ended')) {
                    bgColor = statusColors.completed.bg;
                    textColor = statusColors.completed.text;
                } else if (statusText.includes('Отмен') || statusText.includes('Canceled')) {
                    bgColor = statusColors.canceled.bg;
                    textColor = statusColors.canceled.text;
                } else if (statusText.includes('Онгоинг') || statusText.includes('Выход') || 
                           statusText.includes('В процессе') || statusText.includes('Return')) {
                    bgColor = statusColors.ongoing.bg;
                    textColor = statusColors.ongoing.text;
                } else if (statusText.includes('производстве') || statusText.includes('Production')) {
                    bgColor = statusColors.production.bg;
                    textColor = statusColors.production.text;
                } else if (statusText.includes('Запланировано') || statusText.includes('Planned')) {
                    bgColor = statusColors.planned.bg;
                    textColor = statusColors.planned.text;
                }
                
                if (bgColor) {
                    element.style.cssText = 'background-color: ' + bgColor + '; color: ' + textColor + '; ' +
                        'border-radius: 0.3em; border: 0px; font-size: 1.3em; display: inline-block;';
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
                kids: { bg: '#2ecc71', text: 'white' },
                children: { bg: '#3498db', text: 'white' },
                teens: { bg: '#f1c40f', text: 'black' },
                almostAdult: { bg: '#e67e22', text: 'white' },
                adult: { bg: '#e74c3c', text: 'white' }
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
                    element.style.cssText = 'background-color: ' + colors[group].bg + '; color: ' + colors[group].text + '; ' +
                        'border-radius: 0.3em; font-size: 1.3em; border: 0px;';
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
                    background: rgba(30, 30, 30, 0.95);
                    border-radius: 0.5em;
                    padding: 1em;
                    margin: 1em 0;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .watch-progress-widget:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
                
                .widget-poster {
                    position: relative;
                    width: 120px;
                    height: 180px;
                    border-radius: 0.3em;
                    overflow: hidden;
                    flex-shrink: 0;
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
                    background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
                    padding: 0.5em;
                }
                
                .progress-bar {
                    height: 4px;
                    background: #e50914;
                    border-radius: 2px;
                    margin-bottom: 0.3em;
                    transition: width 0.3s ease;
                }
                
                .progress-time {
                    font-size: 0.9em;
                    color: #fff;
                }
                
                .widget-info {
                    flex: 1;
                    padding: 0 1em;
                }
                
                .widget-info h3 {
                    margin: 0 0 0.5em 0;
                    font-size: 1.4em;
                    color: #fff;
                }
                
                .widget-info p {
                    margin: 0 0 1em 0;
                    color: #aaa;
                    font-size: 1.1em;
                }
                
                .continue-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5em;
                    padding: 0.7em 1.5em;
                    background: #e50914;
                    color: #fff;
                    border: none;
                    border-radius: 0.3em;
                    font-size: 1.1em;
                    cursor: pointer;
                    transition: background 0.3s ease;
                }
                
                .continue-btn:hover {
                    background: #f40612;
                }
                
                .continue-btn svg {
                    width: 1.2em;
                    height: 1.2em;
                    fill: currentColor;
                }
                
                @media (max-width: 768px) {
                    .watch-progress-widget {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .widget-poster {
                        margin-bottom: 1em;
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
    // NETFLIX ТЕМА
    // ============================================================================
    
    var NetflixTheme = {
        init: function() {
            if (settings.theme !== 'netflix') {
                this.remove();
                return;
            }
            
            this.addStyles();
        },
        
        addStyles: function() {
            if (document.getElementById('netflix-theme-styles')) return;
            
            var style = document.createElement('style');
            style.id = 'netflix-theme-styles';
            style.textContent = `
                /* Netflix Theme Variables */
                :root {
                    --netflix-bg-primary: #141414;
                    --netflix-bg-secondary: #1f1f1f;
                    --netflix-accent: #e50914;
                    --netflix-text-primary: #ffffff;
                    --netflix-text-secondary: #b3b3b3;
                }
                
                /* Background */
                body {
                    background: var(--netflix-bg-primary);
                    color: var(--netflix-text-primary);
                }
                
                /* Cards */
                .card {
                    border-radius: 4px;
                    transition: transform 0.3s ease, z-index 0s 0.3s;
                }
                
                .card:hover,
                .card.focus {
                    transform: scale(1.15);
                    z-index: 10;
                    transition: transform 0.3s ease, z-index 0s 0s;
                }
                
                .card__view::after {
                    border: none !important;
                    box-shadow: 0 0 0 2px var(--netflix-accent) !important;
                }
                
                /* Menu Items */
                .menu__item.focus,
                .menu__item.traverse,
                .menu__item.hover {
                    background: var(--netflix-accent) !important;
                    color: var(--netflix-text-primary) !important;
                }
                
                /* Settings */
                .settings-folder.focus,
                .settings-param.focus,
                .selectbox-item.focus {
                    background: var(--netflix-accent) !important;
                    color: var(--netflix-text-primary) !important;
                }
                
                /* Buttons */
                .full-start__button.focus,
                .custom-online-btn.focus,
                .custom-torrent-btn.focus,
                .main2-more-btn.focus {
                    background: var(--netflix-accent) !important;
                    color: var(--netflix-text-primary) !important;
                }
                
                /* Detail Page */
                .full-start__background {
                    opacity: 0.6;
                }
                
                .full-start::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        to bottom,
                        transparent 0%,
                        rgba(20, 20, 20, 0.6) 60%,
                        var(--netflix-bg-primary) 100%
                    );
                    z-index: 1;
                }
                
                .full-start__content {
                    z-index: 2;
                    position: relative;
                }
                
                /* Netflix Loader Animation */
                .netflix-loader {
                    width: 50px;
                    height: 50px;
                    border: 3px solid var(--netflix-accent);
                    border-radius: 50%;
                    border-top-color: transparent;
                    animation: netflix-spin 1s linear infinite;
                }
                
                @keyframes netflix-spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
                
                /* Search Bar */
                .search input {
                    background: var(--netflix-bg-secondary) !important;
                    color: var(--netflix-text-primary) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                }
                
                /* Modal */
                .modal__content,
                .selectbox__content {
                    background: var(--netflix-bg-secondary) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
                
                /* Text Colors */
                .card__title,
                .full-start__title {
                    color: var(--netflix-text-primary) !important;
                }
                
                .card__vote,
                .full-start__rate {
                    color: var(--netflix-text-secondary) !important;
                }
            `;
            document.head.appendChild(style);
        },
        
        remove: function() {
            var style = document.getElementById('netflix-theme-styles');
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
                    netflix: Lampa.Lang.translate('interface_mod_new_theme_netflix')
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
                Lampa.Settings.update();
                NetflixTheme.init();
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
                default: false
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
                background: linear-gradient(45deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%);
                background-size: 200% auto;
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradient-text 3s ease infinite;
                font-weight: 800;
                text-shadow: 0 1px 3px rgba(0,0,0,0.2);
                position: relative;
                padding: 0 5px;
                z-index: 1;
            }
            
            @keyframes gradient-text {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
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
        LabelManager.init();
        InfoPanel.init();
        ColorManager.init();
        WatchProgressWidget.init();
        NetflixTheme.init();
        
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