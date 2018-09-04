var Backbone = require('backbone'),
	_ = require('underscore');

module.exports = Backbone.View.extend({
	events: {
		'click' : 'doSort'
	},

	initialize: function(options) {
		this.modifyURL = options.modifyURL !== false;
		this.qp = Backbone.history.getQueryParameters();
		this.$el = $(this.el);

		this.setIcons();
	},

	setIcons: function() {
		var elementItem,
			elementOrder,
			tooltipEnabled = typeof($.fn.tooltip),
			i = 0;

		this.$el.css({'position': 'relative', 'user-select': 'none', 'cursor': 'url(assets/img/cursor_sort.png), auto'});

		if(this.modifyURL === false) {
			this.qp = JSON.parse(sessionStorage.getItem('queryParams')) || {};
		}

		if(this.qp.sort_fields) {
			$.each(this.qp.sort_fields.split(','), function(id, element) {
				elementItem = element.substring(0, element.indexOf(':'));
				elementOrder =  element.substring(element.indexOf(':') + 1);
				i = i + 1;

				if(elementItem === this.$el.attr('data-sortBy')) {
					if(elementOrder === 'asc') {
						this.$el.append('<span class="glyphicon glyphicon-triangle-top sorter-icon"/>');

						if(tooltipEnabled === 'function') {
							this.$el.tooltip({container: 'body', trigger: 'hover', title: 'Ordenação ' + i + ', ascendente', placement: 'top', html: true});
						}
					} else {
						this.$el.append('<span class="glyphicon glyphicon-triangle-bottom sorter-icon"/>');

						if(tooltipEnabled === 'function') {
							this.$el.tooltip({container: 'body', trigger: 'hover', title: 'Ordenação ' + i + ', descendente', placement: 'top', html: true});
						}
					}
				}
			}.bind(this));

			this.$el.find('.sorter-icon').css({'position': 'absolute', 'right': '5px', 'top': '7px'});
		} else {
			if(tooltipEnabled === 'function') {
				this.$el.tooltip({container: 'body', trigger: 'hover', title: 'Clique para ordenar, use a tecla CTRL para ordenações múltiplas', placement: 'top', html: true});
			}
		}
	},

	doSort: function(e) {
		e.preventDefault();

		var route = location.hash.split('?')[0],
			sortSelected = this.$el.data('sortby'),
			sortContent = '',
			sortArrayItem = [],
			sortArrayOrder = [],
			elementItem,
			elementOrder,
			tooltipEnabled = typeof($.fn.tooltip);

		if(tooltipEnabled === 'function') {
			this.$el.tooltip('destroy');
		}

		if(this.qp.sort_fields) {
			$.each(this.qp.sort_fields.split(','), function(id, element) {
				elementItem = element.substring(0, element.indexOf(':'));
				elementOrder =  element.substring(element.indexOf(':') + 1);

				if(e.ctrlKey) {
					sortArrayItem.push(elementItem);

					if(elementItem === sortSelected) {
						if(elementOrder === 'asc') {
							sortArrayOrder.push('desc');
						} else {
							sortArrayOrder.push('asc');
						}
					} else {
						sortArrayOrder.push(elementOrder);
					}
				} else {
					if(elementItem === sortSelected) {
						sortArrayItem.push(elementItem);

						if(elementOrder === 'asc') {
							sortArrayOrder.push('desc');
						} else {
							sortArrayOrder.push('asc');
						}
					}
				}
			}.bind(this));
		}

		if(sortArrayItem.indexOf(sortSelected) === -1) {
			sortArrayItem.push(sortSelected);
			sortArrayOrder.push('asc');
		}

		if(sortArrayItem.length) {
			if(this.modifyURL === false) {
				this.qp = JSON.parse(sessionStorage.getItem('queryParams')) || {};
			}

			$.each(sortArrayItem, function(id, element) {
				if(sortContent === '') {
					sortContent = element + ':' + sortArrayOrder[id];
				} else {
					sortContent = sortContent + ',' + element + ':' + sortArrayOrder[id];
				}
			}.bind(this));

			_.extend(this.qp, { sort_fields: sortContent });

			if(this.modifyURL === false) {
				sessionStorage.setItem('queryParams', JSON.stringify(this.qp));
			} else {
				route = Backbone.Router.prototype.toFragment(route, this.qp);
				Backbone.history.navigate(route);
			}

			Backbone.trigger('change-queryParams', this.qp);
		}
	}
});